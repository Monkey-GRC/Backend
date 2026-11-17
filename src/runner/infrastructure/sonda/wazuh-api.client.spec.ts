import { readFileSync } from 'node:fs';
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { RunnerFailure } from '../../domain/runner.types';
import { nodeTransport, WazuhApiClient } from './wazuh-api.client';

// Contra un servidor HTTP real que devuelve respuestas CAPTURADAS de la sonda 4.14.6 (fixtures/): lo que viaja por el cable es lo que cuenta.
const fixture = (name: string) => JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));

type Seen = { method?: string; url?: string; auth?: string };
let server: Server;
let base: string;
let seen: Seen[] = [];
// Cada prueba decide qué contesta la sonda a una ruta; por defecto, lo capturado.
let handler: (req: IncomingMessage, res: ServerResponse) => void;

const json = (res: ServerResponse, status: number, body: unknown) => { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(body)); };

const defaults = (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (req.method === 'POST' && url.pathname === '/security/user/authenticate') { res.statusCode = 200; return res.end('eyJTOKEN.DE.PRUEBA'); }
  if (url.pathname === '/') return json(res, 200, fixture('root.json'));
  if (url.pathname === '/agents') return json(res, 200, fixture('agent-active.json'));
  if (url.pathname === '/sca/001') return json(res, 200, fixture('sca-policies.json'));
  if (url.pathname === '/sca/001/checks/cis_ubuntu22-04') return json(res, 200, fixture('sca-checks-page.json'));
  json(res, 404, { title: 'Not Found' });
};

beforeAll(async () => {
  server = createServer((req, res) => { seen.push({ method: req.method, url: req.url, auth: req.headers.authorization }); handler(req, res); });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));
beforeEach(() => { seen = []; handler = defaults; });

const client = (over: { now?: () => number; baseUrl?: string; password?: string } = {}) =>
  new WazuhApiClient({ baseUrl: over.baseUrl ?? base, username: 'monkey_sync', password: over.password ?? 'CLAVE-DE-LECTURA-1!' }, nodeTransport({ rejectUnauthorized: true }), over.now);

const reason = async (p: Promise<unknown>) => { try { await p; return null; } catch (e) { return e instanceof RunnerFailure ? e.reason : `otra:${(e as Error).message}`; } };

describe('WazuhApiClient', () => {
  describe('lectura', () => {
    it('version: la de la API', async () => {
      expect(await client().version()).toBe('4.14.6');
    });

    it('agent: lo que la sonda dice del agente (grupo, estado, SO)', async () => {
      const a = await client().agent('001');
      expect(a).toMatchObject({ id: expect.stringMatching(/^\d{3}$/), status: 'active', osName: 'Ubuntu', osVersion: '22.04.5 LTS', agentVersion: 'Wazuh v4.14.6' });
      expect(a?.groups).toHaveLength(1);
      expect(a?.name).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('agent: un id que no existe es null (no un error)', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 200, { data: { affected_items: [], total_affected_items: 0 } }) : defaults(req, res));
      expect(await client().agent('999')).toBeNull();
    });

    it('agent: un estado que no conocemos NO se toma por activo', async () => {
      handler = (req, res) => (req.url?.startsWith('/agents') ? json(res, 200, { data: { affected_items: [{ id: '001', name: 'a', group: ['g'], status: 'algo-nuevo' }] } }) : defaults(req, res));
      expect((await client().agent('001'))?.status).toBe('disconnected');
    });

    it('agent: un id con forma rara ni siquiera se envía a la sonda (no se puede inyectar en la ruta)', async () => {
      for (const id of ['001&limit=1', '../security/users', '', 'abc', '1']) expect(await client().agent(id)).toBeNull();
      expect(seen).toHaveLength(0);
    });

    it('scaPolicies: política, nombre y fin del escaneo', async () => {
      expect(await client().scaPolicies('001')).toEqual([{ policyId: 'cis_ubuntu22-04', name: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', endScan: expect.stringMatching(/^2026-11-12T/) }]);
    });

    it('scaPolicies: «no hay base de datos para el agente» (nunca se conectó) es una lista vacía, no un error', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 400, { title: 'Bad Request', detail: 'Error retrieving data from Wazuh DB: There is no database for agent 001. Please check if the agent has connected to the manager' }) : defaults(req, res));
      expect(await client().scaPolicies('001')).toEqual([]);
    });

    it('scaChecks: el resultado se entrega TAL CUAL (también `not applicable`) con sus etiquetas de cumplimiento', async () => {
      const out = await client().scaChecks('001', 'cis_ubuntu22-04');
      expect(out).toHaveLength(6);
      expect(out.map((c) => c.result).sort()).toEqual(['failed', 'failed', 'not applicable', 'not applicable', 'passed', 'passed']);
      const withSoc2 = out.find((c) => c.compliance.some((x) => x.key === 'soc_2'));
      expect(withSoc2).toBeDefined();
      expect(withSoc2!.id).toMatch(/^\d+$/);
      expect(withSoc2!.compliance.find((x) => x.key === 'soc_2')!.value).toMatch(/^CC\d/);
    });

    it('scaChecks: sigue pidiendo páginas hasta tener todos los checks', async () => {
      const page = (offset: number) => ({ data: { total_affected_items: 600, affected_items: Array.from({ length: offset === 0 ? 500 : 100 }, (_v, i) => ({ id: offset + i + 1, result: 'passed', compliance: [] })) } });
      handler = (req, res) => (req.method === 'GET' ? json(res, 200, page(Number(new URL(req.url ?? '', 'http://x').searchParams.get('offset')))) : defaults(req, res));
      const out = await client().scaChecks('001', 'cis_ubuntu22-04');
      expect(out).toHaveLength(600);
      expect(seen.filter((s) => s.url?.startsWith('/sca/')).map((s) => s.url)).toEqual(['/sca/001/checks/cis_ubuntu22-04?limit=500&offset=0', '/sca/001/checks/cis_ubuntu22-04?limit=500&offset=500']);
    });

    it('scaChecks: un check sin id es una salida inválida (no se inventa un id)', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 200, { data: { total_affected_items: 1, affected_items: [{ result: 'passed' }] } }) : defaults(req, res));
      expect(await reason(client().scaChecks('001', 'cis_ubuntu22-04'))).toBe('execution.output_invalid');
    });

    it('scaChecks: un identificador de política con forma rara no se envía', async () => {
      expect(await reason(client().scaChecks('001', '../../security/users'))).toBe('execution.output_invalid');
      expect(seen).toHaveLength(0);
    });

    it('recorta y limpia lo que trae la sonda (textos enormes, valores que no son texto)', async () => {
      handler = (req, res) => req.method !== 'GET' ? defaults(req, res) : json(res, 200, { data: { total_affected_items: 1, affected_items: [{ id: 7, result: 'passed', reason: 'x'.repeat(5000), compliance: [{ key: 'k', value: 'v'.repeat(5000) }, { key: 'sin-valor' }, { key: 1, value: 2 }] }] } });
      const [c] = await client().scaChecks('001', 'cis_ubuntu22-04');
      expect(c.reason!.length).toBeLessThanOrEqual(300);
      expect(c.compliance).toHaveLength(1);
      expect(c.compliance[0].value.length).toBeLessThanOrEqual(300);
    });
  });

  describe('solo lectura', () => {
    it('lo único que no es GET es la autenticación: no existe ninguna llamada que cree, cambie o borre nada', async () => {
      const c = client();
      await c.version(); await c.agent('001'); await c.scaPolicies('001'); await c.scaChecks('001', 'cis_ubuntu22-04');
      const writes = seen.filter((s) => s.method !== 'GET').map((s) => `${s.method} ${s.url}`);
      expect(writes).toEqual(['POST /security/user/authenticate?raw=true']);
    });
  });

  describe('autenticación', () => {
    it('autentica UNA vez con Basic y reutiliza el token en las demás llamadas', async () => {
      const c = client();
      await c.version(); await c.agent('001'); await c.scaPolicies('001');
      expect(seen.filter((s) => s.method === 'POST')).toHaveLength(1);
      expect(seen[0].auth).toBe(`Basic ${Buffer.from('monkey_sync:CLAVE-DE-LECTURA-1!').toString('base64')}`);
      expect(seen.filter((s) => s.method === 'GET').every((s) => s.auth === 'Bearer eyJTOKEN.DE.PRUEBA')).toBe(true);
    });

    it('renueva el token ANTES de que venza', async () => {
      let t = 0;
      const c = client({ now: () => t });
      await c.version();
      t = 779_000; await c.version();
      expect(seen.filter((s) => s.method === 'POST')).toHaveLength(1);
      t = 781_000; await c.version();
      expect(seen.filter((s) => s.method === 'POST')).toHaveLength(2);
    });

    it('si la sonda responde 401 (token revocado), pide otro UNA vez y reintenta', async () => {
      let first = true;
      handler = (req, res) => {
        if (req.method === 'GET' && first) { first = false; return json(res, 401, { title: 'Unauthorized' }); }
        defaults(req, res);
      };
      expect(await client().version()).toBe('4.14.6');
      expect(seen.filter((s) => s.method === 'POST')).toHaveLength(2);
    });

    it('credencial rechazada → probe_unauthorized (y no insiste)', async () => {
      handler = (_req, res) => json(res, 401, { title: 'Unauthorized', detail: 'Invalid credentials' });
      expect(await reason(client().version())).toBe('connection.probe_unauthorized');
      expect(seen).toHaveLength(1);
    });

    it('un 403 (al rol le falta un permiso) → probe_unauthorized', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 403, { title: 'Permission Denied' }) : defaults(req, res));
      expect(await reason(client().agent('001'))).toBe('connection.probe_unauthorized');
    });

    it('un 401 que se repite tras renovar el token → probe_unauthorized, sin bucle', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 401, {}) : defaults(req, res));
      expect(await reason(client().version())).toBe('connection.probe_unauthorized');
      expect(seen.filter((s) => s.method === 'POST')).toHaveLength(2);
    });
  });

  describe('cuando la sonda falla', () => {
    it('un 500 → probe_unreachable', async () => {
      handler = (req, res) => (req.method === 'GET' ? json(res, 500, {}) : defaults(req, res));
      expect(await reason(client().version())).toBe('connection.probe_unreachable');
    });

    it('sin servidor escuchando → probe_unreachable', async () => {
      expect(await reason(client({ baseUrl: 'http://127.0.0.1:1' }).version())).toBe('connection.probe_unreachable');
    });

    it('la clave NUNCA aparece en un error', async () => {
      handler = (_req, res) => json(res, 401, {});
      for (const call of [(c: WazuhApiClient) => c.version(), (c: WazuhApiClient) => c.agent('001')]) {
        let err: unknown;
        try { await call(client({ password: 'SECRETO-QUE-NO-DEBE-SALIR' })); } catch (e) { err = e; }
        expect(String((err as Error).message) + JSON.stringify(err)).not.toContain('SECRETO-QUE-NO-DEBE-SALIR');
      }
    });

    it('una respuesta que no es JSON no revienta con el contenido: es una salida inválida', async () => {
      handler = (req, res) => (req.method === 'GET' ? (res.statusCode = 200, res.end('<html>proxy</html>')) : defaults(req, res));
      expect(await reason(client().version())).toBe('execution.output_invalid');
    });
  });
});
