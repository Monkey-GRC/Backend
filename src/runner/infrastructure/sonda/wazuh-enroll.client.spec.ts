import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { RunnerFailure } from '../../domain/runner.types';
import { nodeTransport, WazuhSession } from './wazuh-session';
import { WazuhEnrollClient } from './wazuh-enroll.client';

// Contra un servidor HTTP real que imita lo que responde la sonda 4.14.6: lo que viaja por el cable es lo que cuenta.
const NAME = '78778a4a-6fef-45b0-ade1-2ad12b457c22';
const GROUP = '11111111-1111-4111-8111-111111111111';
const KEY = Buffer.from(`007 ${NAME} any ${'a1'.repeat(32)}`).toString('base64');

type Seen = { method?: string; url?: string; auth?: string; body: any };
let server: Server;
let base: string;
let seen: Seen[] = [];
let handler: (req: IncomingMessage, res: ServerResponse, body: any) => void;

const json = (res: ServerResponse, status: number, body: unknown) => { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(body)); };
const readBody = (req: IncomingMessage) => new Promise<string>((resolve) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => resolve(b)); });

// Una sonda que funciona: autentica, el grupo no existe, no hay agente con ese nombre, y crea/asigna sin problema.
const defaults = (req: IncomingMessage, res: ServerResponse, body: any) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (req.method === 'POST' && url.pathname === '/security/user/authenticate') { res.statusCode = 200; return res.end('eyJTOKEN.DE.PRUEBA'); }
  if (req.method === 'GET' && url.pathname === '/') return json(res, 200, { data: { api_version: '4.14.6' } });
  if (req.method === 'GET' && url.pathname === '/groups') return json(res, 200, { data: { affected_items: [], total_affected_items: 0 } });
  if (req.method === 'POST' && url.pathname === '/groups') return json(res, 200, { data: { affected_items: [body.group_id] } });
  if (req.method === 'GET' && url.pathname === '/agents') return json(res, 200, { data: { affected_items: [], total_affected_items: 0 } });
  if (req.method === 'POST' && url.pathname === '/agents/insert') return json(res, 200, { data: { id: '007', key: KEY } });
  if (req.method === 'PUT' && /^\/agents\/\d+\/group\//.test(url.pathname)) return json(res, 200, { data: {} });
  if (req.method === 'DELETE' && url.pathname === '/agents') return json(res, 200, { data: {} });
  json(res, 404, {});
};

beforeAll(async () => {
  server = createServer(async (req, res) => {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : null;
    seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, body });
    handler(req, res, body);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));
beforeEach(() => { seen = []; handler = defaults; });

const client = (baseUrl = base) => new WazuhEnrollClient({ baseUrl, username: 'monkey_enroll', password: 'CLAVE-DE-ALTA-1!' }, nodeTransport({ rejectUnauthorized: true }));
const reason = async (p: Promise<unknown>) => { try { await p; return null; } catch (e) { return e instanceof RunnerFailure ? e.reason : `otra:${(e as Error).message}`; } };
const calls = () => seen.filter((s) => !s.url?.startsWith('/security')).map((s) => `${s.method} ${s.url}`);

describe('WazuhEnrollClient', () => {
  it('autentica con SU usuario (el de alta), no con el de lectura', async () => {
    await client().version();
    expect(seen[0].auth).toBe(`Basic ${Buffer.from('monkey_enroll:CLAVE-DE-ALTA-1!').toString('base64')}`);
  });

  describe('crear el agente', () => {
    it('crea el agente con el nombre del activo, le asigna el grupo de la empresa y devuelve su id y su clave', async () => {
      const out = await client().createAgent(NAME, GROUP);
      expect(out).toEqual({ agentId: '007', key: KEY });
      expect(calls()).toEqual(['POST /agents/insert', `PUT /agents/007/group/${GROUP}`]);
      expect(seen.find((s) => s.url === '/agents/insert')!.body).toEqual({ name: NAME, ip: 'any' });
    });

    it('si asignar el grupo falla, NO deja un agente suelto: lo retira antes de fallar', async () => {
      handler = (req, res, body) => (req.method === 'PUT' ? json(res, 400, { detail: 'grupo inexistente' }) : defaults(req, res, body));
      expect(await reason(client().createAgent(NAME, GROUP))).toBe('connection.agent_enroll_failed');
      expect(calls()).toEqual(['POST /agents/insert', `PUT /agents/007/group/${GROUP}`, 'DELETE /agents?agents_list=007&status=all&older_than=0s']);
    });

    it.each([
      ['la sonda no devuelve la clave', { data: { id: '007' } }],
      ['la clave no tiene forma de clave', { data: { id: '007', key: 'abc' } }],
      ['el id no tiene la forma de la sonda', { data: { id: '7; rm', key: KEY } }],
    ])('rechaza una respuesta rara: %s', async (_n, payload) => {
      handler = (req, res, body) => (req.url === '/agents/insert' ? json(res, 200, payload) : defaults(req, res, body));
      expect(await reason(client().createAgent(NAME, GROUP))).toBe('connection.agent_enroll_failed');
    });

    it('si la sonda no puede crear el agente, falla con su razón (nunca con el mensaje de la sonda)', async () => {
      handler = (req, res, body) => (req.url === '/agents/insert' ? json(res, 400, { detail: 'DATOS-INTERNOS-DE-LA-SONDA' }) : defaults(req, res, body));
      let err: unknown;
      try { await client().createAgent(NAME, GROUP); } catch (e) { err = e; }
      expect((err as RunnerFailure).reason).toBe('connection.agent_enroll_failed');
      expect(JSON.stringify(err) + (err as Error).message).not.toContain('DATOS-INTERNOS');
    });
  });

  describe('el grupo de la empresa', () => {
    it('lo crea si no existe', async () => {
      await client().ensureGroup(GROUP);
      expect(calls()).toEqual([`GET /groups?groups_list=${GROUP}`, 'POST /groups']);
      expect(seen.find((s) => s.method === 'POST' && s.url === '/groups')!.body).toEqual({ group_id: GROUP });
    });

    it('si ya existe, no lo vuelve a crear', async () => {
      handler = (req, res, body) => (req.method === 'GET' && req.url?.startsWith('/groups') ? json(res, 200, { data: { affected_items: [{ name: GROUP }], total_affected_items: 1 } }) : defaults(req, res, body));
      await client().ensureGroup(GROUP);
      expect(calls()).toEqual([`GET /groups?groups_list=${GROUP}`]);
    });

    it('si otra corrida lo creó entre la pregunta y la creación, no es un error mientras exista', async () => {
      let asked = 0;
      handler = (req, res, body) => {
        if (req.method === 'GET' && req.url?.startsWith('/groups')) { asked += 1; return json(res, 200, { data: { affected_items: asked === 1 ? [] : [{ name: GROUP }], total_affected_items: asked === 1 ? 0 : 1 } }); }
        if (req.method === 'POST' && req.url === '/groups') return json(res, 400, { detail: 'ya existe' });
        defaults(req, res, body);
      };
      await expect(client().ensureGroup(GROUP)).resolves.toBeUndefined();
    });

    it('si no se pudo crear y sigue sin existir, falla', async () => {
      handler = (req, res, body) => (req.method === 'POST' && req.url === '/groups' ? json(res, 400, {}) : defaults(req, res, body));
      expect(await reason(client().ensureGroup(GROUP))).toBe('connection.agent_enroll_failed');
    });
  });

  describe('retirar un agente anterior (reintento o «generar de nuevo»)', () => {
    it('sin agente con ese nombre no hace nada y devuelve false', async () => {
      expect(await client().removeAgentByName(NAME)).toBe(false);
      expect(calls()).toEqual([`GET /agents?q=name=${NAME}&select=id`]);
    });

    it('con agente: lo retira (aunque esté conectado) y devuelve true', async () => {
      handler = (req, res, body) => (req.method === 'GET' && req.url?.startsWith('/agents') ? json(res, 200, { data: { affected_items: [{ id: '003' }, { id: '004' }], total_affected_items: 2 } }) : defaults(req, res, body));
      expect(await client().removeAgentByName(NAME)).toBe(true);
      expect(calls()).toContain('DELETE /agents?agents_list=003,004&status=all&older_than=0s');
    });

    it('ignora ids que no tienen la forma de la sonda (nunca llegan a la ruta)', async () => {
      handler = (req, res, body) => (req.method === 'GET' && req.url?.startsWith('/agents') ? json(res, 200, { data: { affected_items: [{ id: '003; x' }, { id: '004' }] } }) : defaults(req, res, body));
      await client().removeAgentByName(NAME);
      expect(calls()).toContain('DELETE /agents?agents_list=004&status=all&older_than=0s');
    });
  });

  describe('lo que entra a una ruta de la API se valida ANTES de enviarse', () => {
    it.each([
      ['un grupo con forma rara', () => client().ensureGroup("x'; drop")],
      ['un nombre con forma rara al retirar', () => client().removeAgentByName('../security/users')],
      ['un nombre con forma rara al crear', () => client().createAgent('srv-01', GROUP)],
      ['un grupo con forma rara al crear', () => client().createAgent(NAME, 'default')],
    ])('%s: se rechaza sin tocar la sonda', async (_n, call) => {
      expect(await reason(call())).toBe('connection.agent_enroll_failed');
      expect(seen).toHaveLength(0);
    });
  });

  describe('cuando la sonda falla', () => {
    it('credencial rechazada → probe_unauthorized; un 403 (al rol le falta un permiso) también', async () => {
      handler = (_req, res) => json(res, 401, {});
      expect(await reason(client().ensureGroup(GROUP))).toBe('connection.probe_unauthorized');
      handler = (req, res, body) => (req.method === 'POST' && req.url === '/agents/insert' ? json(res, 403, {}) : defaults(req, res, body));
      expect(await reason(client().createAgent(NAME, GROUP))).toBe('connection.probe_unauthorized');
    });

    it('sin servidor escuchando → probe_unreachable', async () => {
      expect(await reason(client('http://127.0.0.1:1').ensureGroup(GROUP))).toBe('connection.probe_unreachable');
    });

    it('la clave de la API NUNCA aparece en un error', async () => {
      handler = (_req, res) => json(res, 401, {});
      let err: unknown;
      try { await client().createAgent(NAME, GROUP); } catch (e) { err = e; }
      expect(String((err as Error).message) + JSON.stringify(err)).not.toContain('CLAVE-DE-ALTA');
    });
  });
});

describe('WazuhSession de solo lectura', () => {
  it('se niega a enviar cualquier cosa que no sea un GET, sin tocar la red', async () => {
    const s = new WazuhSession({ baseUrl: base, username: 'monkey_sync', password: 'x' }, nodeTransport({ rejectUnauthorized: true }), Date.now, true);
    for (const method of ['POST', 'PUT', 'DELETE'] as const) await expect(s.request(method, '/agents', { name: 'x' })).rejects.toThrow(/solo lectura/);
    expect(seen).toHaveLength(0);
  });
});
