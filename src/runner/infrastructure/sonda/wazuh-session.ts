import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { FAILURE, RunnerFailure } from '../../domain/runner.types';

// La sesión con la API del manager de la sonda (D113): autenticación con el usuario que corresponda, token que se renueva antes de vencer, y los errores traducidos a razones
// estables. La usan DOS clientes con credenciales distintas: el de lectura (`monkey_sync`) y el de alta (`monkey_enroll`). Nunca se vuelca el cuerpo de una respuesta ni la
// credencial: la respuesta de la sonda puede llevar datos de otros agentes, y un error con la clave dentro acabaría en un registro.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type HttpRequest = { method: HttpMethod; url: string; headers: Record<string, string>; body?: string; timeoutMs: number };
export type HttpResponse = { status: number; body: string };
export type HttpTransport = (req: HttpRequest) => Promise<HttpResponse>;

export type TlsOptions = {
  // Certificado (PEM) de la CA que firmó la sonda. Lo normal en producción: la sonda con un certificado de confianza o fijado aquí.
  ca?: string;
  // SOLO desarrollo (la sonda de pruebas usa un certificado propio). `loadRunnerConfig` lo rechaza en producción.
  rejectUnauthorized: boolean;
  // El nombre con el que se verifica el certificado, si no es el de la dirección a la que se conecta (la sonda de pruebas usa un certificado genérico de `localhost`).
  serverName?: string;
};

const MAX_BODY_BYTES = 20 * 1024 * 1024;

export function nodeTransport(tls: TlsOptions): HttpTransport {
  return (req) =>
    new Promise<HttpResponse>((resolve, reject) => {
      const url = new URL(req.url);
      const secure = url.protocol === 'https:';
      const headers = req.body === undefined ? req.headers : { ...req.headers, 'Content-Type': 'application/json', 'Content-Length': String(Buffer.byteLength(req.body)) };
      const r = (secure ? httpsRequest : httpRequest)(
        url,
        { method: req.method, headers, timeout: req.timeoutMs, ...(secure ? { ca: tls.ca, rejectUnauthorized: tls.rejectUnauthorized, ...(tls.serverName ? { servername: tls.serverName } : {}) } : {}) },
        (res) => {
          const chunks: Buffer[] = [];
          let size = 0;
          res.on('data', (c: Buffer) => {
            size += c.length;
            if (size > MAX_BODY_BYTES) return r.destroy(new Error('respuesta demasiado grande'));
            chunks.push(c);
          });
          res.on('end', () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }));
          res.on('error', reject);
        },
      );
      r.on('timeout', () => r.destroy(new Error('tiempo agotado')));
      r.on('error', reject);
      if (req.body !== undefined) r.write(req.body);
      r.end();
    });
}

export type WazuhApiOptions = { baseUrl: string; username: string; password: string };

const REQUEST_TIMEOUT_MS = 30_000;
// El token de la API dura 900 s por defecto: se renueva un poco antes para no usar uno que vence a mitad de una lectura.
const TOKEN_TTL_MS = 780_000;

export function parseJson(body: string): any {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export class WazuhSession {
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly options: WazuhApiOptions,
    private readonly http: HttpTransport,
    private readonly now: () => number = Date.now,
    // Una sesión de SOLO LECTURA se niega a enviar cualquier cosa que no sea un GET: la credencial de lectura nunca podría escribir aunque alguien lo intentara.
    private readonly readOnly = false,
  ) {}

  async request(method: HttpMethod, path: string, body?: unknown): Promise<{ status: number; json: any }> {
    if (this.readOnly && method !== 'GET') throw new Error('Esta sesión es de solo lectura.');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = await this.bearer();
      const res = await this.send({ method, path, headers: { Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
      // 401: el token venció o la sonda lo revocó (cambiar roles lo invalida). Se pide otro UNA vez; si vuelve a fallar, es la credencial.
      if (res.status === 401 && attempt === 0) {
        this.token = null;
        continue;
      }
      if (res.status === 401 || res.status === 403) throw new RunnerFailure(FAILURE.probeUnauthorized);
      if (res.status === 0 || res.status >= 500) throw new RunnerFailure(FAILURE.probeUnreachable, `HTTP ${res.status}`);
      return { status: res.status, json: parseJson(res.body) };
    }
    throw new RunnerFailure(FAILURE.probeUnauthorized);
  }

  private async bearer(): Promise<string> {
    if (this.token && this.now() < this.token.expiresAt) return this.token.value;
    const basic = Buffer.from(`${this.options.username}:${this.options.password}`).toString('base64');
    const res = await this.send({ method: 'POST', path: '/security/user/authenticate?raw=true', headers: { Authorization: `Basic ${basic}` } });
    if (res.status === 401 || res.status === 403) throw new RunnerFailure(FAILURE.probeUnauthorized);
    const value = res.body.trim();
    if (res.status !== 200 || !value || /\s/.test(value)) throw new RunnerFailure(FAILURE.probeUnreachable, `autenticación: HTTP ${res.status}`);
    this.token = { value, expiresAt: this.now() + TOKEN_TTL_MS };
    return value;
  }

  private async send(req: { method: HttpMethod; path: string; headers: Record<string, string>; body?: string }): Promise<HttpResponse> {
    try {
      return await this.http({ method: req.method, url: `${this.options.baseUrl}${req.path}`, headers: { Accept: 'application/json', ...req.headers }, body: req.body, timeoutMs: REQUEST_TIMEOUT_MS });
    } catch (e) {
      // Solo la clase del error: el mensaje de una librería de red puede incluir la URL con parámetros.
      throw new RunnerFailure(FAILURE.probeUnreachable, (e as Error)?.constructor?.name ?? 'Error');
    }
  }
}
