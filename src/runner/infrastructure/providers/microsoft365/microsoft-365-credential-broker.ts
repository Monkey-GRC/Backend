import { CredentialBroker } from '../../../domain/ports';
import { FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../../../domain/runner.types';
import { errName } from '../sts-base';
import { buildClientAssertion } from './microsoft-365-client-assertion';

// Microsoft 365 se conecta con una aplicación y un CERTIFICADO que generó Monkey (D154). El certificado se queda aquí: al motor solo le llegan permisos temporales de esa
// organización (D156, SEG-46). Antes de gastar una corrida se hace lo que significa «validar» una conexión:
//   1. firmar una aserción con la clave privada y pedirle a Entra un token de la aplicación (si Entra la rechaza, la conexión no sirve);
//   2. comprobar que el token es del tenant declarado (`tid`); si no, jamás se evalúa;
//   3. comprobar que el token trae los permisos de lectura que hacen falta (`roles`): sin el consentimiento del administrador el token sale, pero vacío.
// Nunca se registra un token, una aserción ni una clave: solo clases de error y códigos HTTP.
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const HTTP_TIMEOUT_MS = 20_000;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXCHANGE_SCOPE = 'https://outlook.office365.com/.default';
const TEAMS_SCOPE = '48ac35b8-9aa8-4d74-927d-1f4a14a0b239/.default';
const tokenUrlOf = (tenantId: string) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

// Los permisos SIN los que no tiene sentido evaluar: son los que el motor marca como necesarios para todos los servicios (`Directory.Read.All`, `Policy.Read.All`) y para Entra
// (`AuditLog.Read.All`). Los demás se piden, pero un tenant puede no ofrecerlos (licencias) y los checks que dependen de ellos simplemente no corren.
// Es un acuerdo con el script de alta del backend: una prueba comprueba que cada uno está entre los permisos que el script pide.
export const MICROSOFT_365_REQUIRED_ROLES = ['AuditLog.Read.All', 'Directory.Read.All', 'Policy.Read.All'] as const;

// Lo que el cliente puede corregir: Entra rechazó la aplicación, el certificado o el tenant. 5xx, 429 y fallos de red son nuestros (o de Microsoft), no de su conexión.
const CLIENT_REJECTIONS = new Set([400, 401, 403, 404]);

type Fetch = typeof fetch;

// Con el botón, Microsoft a veces rechaza un acceso que segundos después concede (visto con un tenant real, con todos los permisos autorizados). La comprobación ya la reintenta la pantalla;
// una evaluación no tiene quién la repita, así que se reintenta aquí antes de decirle al cliente que falta la autorización.
export const CONSENT_RETRY_DELAYS_MS = [5_000, 15_000];
const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// La aplicación de Monkey que los clientes autorizan con el botón (D157). Su llave la tiene SOLO el trabajador; sirve para todas las organizaciones que la autorizaron, así que ni sale
// de aquí ni entra al motor.
export type MonkeyMicrosoftApp = { clientId: string; certificateThumbprint: string; privateKeyPem: string };

export class Microsoft365CredentialBroker extends CredentialBroker {
  constructor(
    private readonly http: Fetch = fetch,
    private readonly now: () => Date = () => new Date(),
    private readonly monkeyApp: MonkeyMicrosoftApp | null = null,
    private readonly wait: (ms: number) => Promise<void> = pause,
  ) {
    super();
  }

  async obtain(job: RunnerJob): Promise<TemporaryCredentials> {
    const delays = job.connection.method === 'admin_consent' && job.kind === 'assessment' ? CONSENT_RETRY_DELAYS_MS : [];
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.access(job);
      } catch (e) {
        const rejected = e instanceof RunnerFailure && (e.reason === FAILURE.appRejected || e.reason === FAILURE.permissionsMissing);
        if (!rejected || job.connection.method !== 'admin_consent') throw e;
        if (attempt < delays.length) {
          await this.wait(delays[attempt]);
          continue;
        }
        // Con el botón no hay aplicación ni certificado que el cliente pueda corregir: lo que falta es la autorización. La causa se conserva para el registro.
        throw new RunnerFailure(FAILURE.consentRequired, e.message);
      }
    }
  }

  private async access(job: RunnerJob): Promise<TemporaryCredentials> {
    // Con certificado propio de la conexión llega todo en el trabajo; con el botón, la aplicación es la de Monkey (si este trabajador la tiene).
    const c = job.connection.method === 'app_certificate' ? job.connection : job.connection.method === 'admin_consent' ? this.monkeyApp : null;
    if (!c || !job.externalAccountId) throw new RunnerFailure(FAILURE.methodNotSupportedByRunner);
    const tenantId = job.externalAccountId.toLowerCase();
    if (!GUID.test(tenantId) || !GUID.test(c.clientId)) throw new RunnerFailure(FAILURE.engineFailed, 'tenant o aplicación inválidos');

    const url = tokenUrlOf(tenantId);
    // Cada petición lleva su propia aserción firmada: la clave privada no sale de aquí.
    const issue = (scope: string) =>
      this.requestToken(url, c.clientId, scope, buildClientAssertion({ tokenUrl: url, clientId: c.clientId, thumbprint: c.certificateThumbprint, privateKeyPem: c.privateKeyPem, now: this.now() }));
    const token = await issue(GRAPH_SCOPE);
    const claims = decodeClaims(token);

    // 2. El token es del tenant declarado (un tenant ajeno nunca se evalúa, aunque la aplicación exista).
    if (typeof claims['tid'] !== 'string' || claims['tid'].toLowerCase() !== tenantId) throw new RunnerFailure(FAILURE.accountMismatch);
    // 3. Los permisos de lectura que hacen falta.
    const roles = Array.isArray(claims['roles']) ? (claims['roles'] as unknown[]).filter((r): r is string => typeof r === 'string') : [];
    const missing = MICROSOFT_365_REQUIRED_ROLES.filter((r) => !roles.includes(r));
    if (missing.length > 0) throw new RunnerFailure(FAILURE.permissionsMissing, `faltan ${missing.join(', ')}`);

    // Correo y reuniones solo sirven para evaluar: no se piden al validar y, si Microsoft no los entrega (la organización no los tiene), sus verificaciones no corren.
    const optional = (scope: string) => (job.kind === 'assessment' ? issue(scope).catch(() => null) : Promise.resolve(null));
    const [exchange, teams] = await Promise.all([optional(EXCHANGE_SCOPE), optional(TEAMS_SCOPE)]);
    return { provider: 'microsoft_365', tenantId, clientId: c.clientId, tokens: { graph: token, exchange, teams } };
  }

  private async requestToken(url: string, clientId: string, scope: string, assertion: string): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      scope,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: assertion,
    });
    let res: Response;
    try {
      res = await this.http(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(), signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
    } catch (e) {
      throw new RunnerFailure(FAILURE.engineFailed, `token: ${errName(e)}`);
    }
    // Nunca se vuelca el cuerpo de un error: puede repetir lo que se envió.
    if (CLIENT_REJECTIONS.has(res.status)) throw new RunnerFailure(FAILURE.appRejected, `token: ${res.status}${await errorCodes(res)}`);
    if (!res.ok) throw new RunnerFailure(FAILURE.engineFailed, `token: ${res.status}`);
    try {
      const json: unknown = await res.json();
      const token = (json as { access_token?: unknown } | null)?.access_token;
      if (typeof token === 'string' && token) return token;
    } catch {
      /* cae abajo */
    }
    throw new RunnerFailure(FAILURE.engineFailed, 'token: respuesta no válida');
  }
}

// De un rechazo solo se toman los códigos NUMÉRICOS de Microsoft (sirven para diagnosticar y no repiten nada de lo enviado).
async function errorCodes(res: Response): Promise<string> {
  try {
    const codes = ((await res.json()) as { error_codes?: unknown } | null)?.error_codes;
    const numbers = Array.isArray(codes) ? codes.filter((c): c is number => Number.isInteger(c)).slice(0, 5) : [];
    return numbers.length > 0 ? ` (AADSTS${numbers.join(', AADSTS')})` : '';
  } catch {
    return '';
  }
}

// El cuerpo de un JWT. No se verifica su firma: lo entregó Microsoft por TLS en respuesta a nuestra petición, y aquí solo se lee lo que ya vino.
function decodeClaims(jwt: string): Record<string, unknown> {
  try {
    const payload = jwt.split('.')[1];
    const json: unknown = JSON.parse(Buffer.from(payload ?? '', 'base64url').toString('utf8'));
    if (json && typeof json === 'object' && !Array.isArray(json)) return json as Record<string, unknown>;
  } catch {
    /* cae abajo */
  }
  throw new RunnerFailure(FAILURE.engineFailed, 'token: no se pudo leer');
}
