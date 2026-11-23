import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { RunEnrollment } from '../../src/runner/application/run-enrollment';
import { RunNextExecution } from '../../src/runner/application/run-next-execution';
import { CredentialBroker, RunnerLogger, ScanEngine } from '../../src/runner/domain/ports';
import { FAILURE, RunnerFailure } from '../../src/runner/domain/runner.types';
import { SondaEnrollApi } from '../../src/runner/domain/sonda';
import { HttpRunnerApi } from '../../src/runner/infrastructure/http-runner-api';
import { bootApp, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D113: instalar la sonda en un servidor con agente, de punta a punta por HTTP. El backend es el REAL y el trabajador es el REAL (su bucle y su cliente HTTP); solo la API de la
// sonda es simulada. Es lo que se presenta: el cliente declara su servidor, pide la instalación, el trabajador crea el agente, y el cliente ve el comando UNA sola vez.
const HOST = 'sonda.monkey.test';
const INSTALLER = 'https://api.monkey.test/v1/install';
const ENV = { SONDA_MANAGER_HOST: HOST, SONDA_AGENT_VERSION: '4.14.6', AGENT_INSTALLER_BASE_URL: INSTALLER, AGENT_INSTALL_KEY_TTL_MINUTES: '15' };

// La plantilla trae el catálogo REAL de la sonda: los códigos de la prueba llevan el sufijo de la corrida para no chocar con él.
const UBUNTU = `ubuntu_22_04_lts_e2e_${RUN}`;
const WIN = `windows_server_2022_e2e_${RUN}`;
const SCA_IDS = [`e2e_inst_ubuntu_${RUN}`, `e2e_inst_win_${RUN}`];

let app: INestApplication;
let baseUrl: string;
let a: Tenant;
let b: Tenant;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

// La sonda simulada: guarda los agentes por NOMBRE (como la real: nombres únicos) y reparte ids consecutivos.
class FakeSonda extends SondaEnrollApi {
  agents = new Map<string, { id: string; group: string }>();
  groups = new Set<string>();
  removed: string[] = [];
  failWith: Error | null = null;
  version() { return Promise.resolve('4.14.6'); }
  ensureGroup(group: string) { if (this.failWith) return Promise.reject(this.failWith); this.groups.add(group); return Promise.resolve(); }
  removeAgentByName(name: string) { const had = this.agents.delete(name); if (had) this.removed.push(name); return Promise.resolve(had); }
  createAgent(name: string, group: string) {
    const id = nextAgentId();
    this.agents.set(name, { id, group });
    const key = Buffer.from(`${id} ${name} any ${'ab'.repeat(32)}`).toString('base64');
    return Promise.resolve({ agentId: id, key });
  }
}
class NoBroker extends CredentialBroker { obtain(): never { throw new Error('crear un agente no pide credenciales del cliente'); } }
class NoEngine extends ScanEngine { run(): never { throw new Error('crear un agente no corre el motor'); } cleanupOrphans() { return Promise.resolve(0); } }
class SilentLog extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

// Los ids de agente son únicos en TODA la base: la sonda simulada se reinicia en cada prueba, pero la base conserva los agentes de las anteriores, y el backend (con razón)
// rechaza un agente que ya es de otro activo. Un contador de toda la corrida evita que dos pruebas repartan el mismo.
let agentCounter = 100 + (parseInt(RUN, 16) % 700);
const nextAgentId = () => String(agentCounter++).padStart(3, '0');

let sonda: FakeSonda;
/** El carril de «alta de servidores» del trabajador, trabajando hasta que no quede nada en cola. */
async function serveEnrollment(): Promise<string[]> {
  const api = new HttpRunnerApi(baseUrl, RUNNER_TOKEN);
  const lane = new RunNextExecution(api, new NoBroker(), new NoEngine(), new SilentLog(), 'enrollment', undefined, undefined, new RunEnrollment(api, sonda, new SilentLog(), ['4.14']));
  const out: string[] = [];
  for (let i = 0; i < 10; i++) { const r = await lane.execute(); if (r === 'idle') break; out.push(r); }
  return out;
}

const setAvailability = (value: 'available' | 'coming_soon') =>
  owner(`update catalog.capability_platforms set availability = $1::catalog.framework_availability where code in ('linux', 'windows') and automated_capability_id = (select id from catalog.automated_capabilities where catalog_code = 'ac_04')`, [value]);

const server = (t: Tenant, over: Record<string, unknown> = {}) => ({
  name: `srv-${RUN}-${Math.random().toString(36).slice(2, 6)}`, connection_category: 'ac_04', platform: 'linux', connection_method: 'agent', os_version: UBUNTU, service_ids: [t.serviceId], ...over,
});
const declare = async (t: Tenant, over: Record<string, unknown> = {}): Promise<string> => (await t.agent.post('/v1/assets').send(server(t, over)).expect(201)).body.data.id;
const state = (t: Tenant, id: string) => t.agent.get(`/v1/assets/${id}/agent-install`);
const start = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/agent-install`);
const reveal = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/agent-install/reveal`);
const regenerate = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/agent-install/regenerate`);
const agentRow = async (id: string) => (await owner<{ agent_id: string | null; cipher: string | null; expires: Date | null }>(`select agent_id, install_key_cipher cipher, install_key_expires_at expires from tenant.asset_agents where asset_id = $1`, [id]))[0];
const enrollments = async (id: string) => owner<{ status: string; failure_reason: string | null }>(`select status::text, failure_reason from tenant.executions where asset_id = $1 and kind = 'enrollment' order by queued_at`, [id]);

beforeAll(async () => {
  app = await bootApp(ENV);
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  ({ a, b } = await dosEmpresas(app));
  for (const [i, p] of [{ os: 'linux', dist: 'ubuntu', name: 'Ubuntu', ver: '22.04 LTS', code: UBUNTU }, { os: 'windows', dist: 'windows_server', name: 'Windows Server', ver: '2022', code: WIN }].entries()) {
    await owner(
      `insert into catalog.sca_policies (id, platform, benchmark, sca_id, yaml_file, check_count, os_code, distribution, distribution_name, version_label, version_code, sort_order, is_offerable)
       values (gen_random_uuid(), $1, $2, $3, $4, 10, $5, $6, $7, $8, $9, $10, true) on conflict (sca_id) do update set is_offerable = true, version_code = excluded.version_code, os_code = excluded.os_code`,
      [p.os === 'windows' ? 'Windows' : 'Ubuntu', `Política de prueba ${p.code}`, SCA_IDS[i], `${SCA_IDS[i]}.yml`, p.os, p.dist, p.name, p.ver, p.code, (i + 1) * 10],
    );
  }
  await setAvailability('available');
});
afterAll(async () => {
  await drainQueue();
  await setAvailability('available');
  await owner(`delete from tenant.executions where kind = 'enrollment' and asset_id in (select asset_id from tenant.asset_agents where sca_policy_id in (select id from catalog.sca_policies where sca_id = any($1)))`, [SCA_IDS]).catch(() => undefined);
  await owner(`delete from tenant.asset_agents where sca_policy_id in (select id from catalog.sca_policies where sca_id = any($1))`, [SCA_IDS]).catch(() => undefined);
  await owner(`delete from catalog.sca_policies where sca_id = any($1)`, [SCA_IDS]).catch(() => undefined);
  await app?.close();
});
beforeEach(async () => { await drainQueue(); sonda = new FakeSonda(); });

describe('Instalar la sonda en un servidor (D113)', () => {
  it('antes de empezar: no_started, con el sistema, la versión declarada y lo que el firewall debe permitir DE SALIDA', async () => {
    const id = await declare(a);
    const d = (await state(a, id).expect(200)).body.data;
    expect(d).toMatchObject({ status: 'not_started', failure_message: null, os: 'linux', os_version: { value: UBUNTU, label: 'Ubuntu 22.04 LTS' }, expires_at: null, requires_outbound: { host: HOST, port: 1514 } });
  });

  it('el flujo completo: empezar → el trabajador crea el agente → listo → el comando sale UNA sola vez', async () => {
    const id = await declare(a);

    // 1. Empezar: responde ya (202) y deja la creación del agente en cola. Repetirlo no crea otra.
    expect((await start(a, id).expect(202)).body.data.status).toBe('preparing');
    expect((await start(a, id).expect(202)).body.data.status).toBe('preparing');
    expect(await enrollments(id)).toEqual([{ status: 'queued', failure_reason: null }]);
    expect((await state(a, id).expect(200)).body.data.status).toBe('preparing');

    // 2. El trabajador (su bucle y su cliente HTTP reales) crea el agente con el nombre del ACTIVO y el grupo de la EMPRESA.
    expect(await serveEnrollment()).toEqual(['completed']);
    const agentId = sonda.agents.get(id)!.id;
    expect(sonda.agents.get(id)).toEqual({ id: agentId, group: a.companyId });
    expect(sonda.groups.has(a.companyId)).toBe(true);
    expect(await enrollments(id)).toEqual([{ status: 'completed', failure_reason: null }]);

    // 3. Listo: la clave está guardada CIFRADA, con caducidad, y el agente enlazado al activo.
    const ready = (await state(a, id).expect(200)).body.data;
    expect(ready.status).toBe('ready');
    expect(new Date(ready.expires_at).getTime()).toBeGreaterThan(Date.now() + 10 * 60_000);
    expect(new Date(ready.expires_at).getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60_000);
    const row = await agentRow(id);
    expect(row.agent_id).toBe(agentId);
    expect(row.cipher).toBeTruthy();
    const plainKey = Buffer.from(`${agentId} ${id} any ${'ab'.repeat(32)}`).toString('base64');
    expect(row.cipher).not.toContain(plainKey); // cifrada en la base
    expect(JSON.stringify(ready)).not.toMatch(/sudo|curl|--key/); // el estado no lleva el comando

    // 4. El comando, UNA vez, con los datos de ESTE servidor.
    const shown = (await reveal(a, id).expect(200)).body.data;
    expect(shown).toMatchObject({ os: 'linux', os_version: { label: 'Ubuntu 22.04 LTS' }, requires_outbound: { host: HOST, port: 1514 } });
    expect(shown.options).toEqual([{ kind: 'command', label: 'Terminal', shell: 'bash', value: `curl -fsSL '${INSTALLER}/agent.sh' | sudo bash -s -- --manager '${HOST}' --port 1514 --name '${id}' --version '4.14.6' --key '${plainKey}'` }]);

    // 5. Ya se entregó: no se vuelve a mostrar, y la clave se borró de la base.
    expect((await state(a, id).expect(200)).body.data.status).toBe('delivered');
    const again = await reveal(a, id).expect(409);
    expect(again.body.error.code).toBe('AGENT_INSTALL_NOT_READY');
    expect(JSON.stringify(again.body)).not.toContain(plainKey);
    expect((await agentRow(id)).cipher).toBeNull();
    // Y el estado consultado muchas veces no la gasta ni cambia nada.
    for (let i = 0; i < 3; i++) expect((await state(a, id).expect(200)).body.data.status).toBe('delivered');
  });

  it('dos peticiones A LA VEZ: solo UNA se lleva el comando (la entrega es atómica)', async () => {
    const id = await declare(a);
    await start(a, id).expect(202);
    await serveEnrollment();
    const [r1, r2, r3] = await Promise.all([reveal(a, id), reveal(a, id), reveal(a, id)]);
    expect([r1.status, r2.status, r3.status].sort()).toEqual([200, 409, 409]);
  });

  it('Windows: un comando de PowerShell y un archivo con los datos del servidor adentro', async () => {
    const id = await declare(a, { platform: 'windows', os_version: WIN });
    await start(a, id).expect(202);
    await serveEnrollment();
    const shown = (await reveal(a, id).expect(200)).body.data;
    expect(shown.os).toBe('windows');
    expect(shown.options.map((o: { kind: string }) => o.kind)).toEqual(['command', 'file']);
    expect(shown.options[0].value).toContain(`Invoke-WebRequest -UseBasicParsing '${INSTALLER}/agent.ps1'`);
    expect(shown.options[1]).toMatchObject({ filename: 'instalar-monkey.ps1' });
    expect(shown.options[1].content).toContain(`$Name = '${id}'`);
  });

  describe('«generar de nuevo»', () => {
    it('retira el agente anterior, crea otro con OTRA clave, y el comando viejo deja de servir', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      await serveEnrollment();
      const oldAgentId = sonda.agents.get(id)!.id;
      const first = (await reveal(a, id).expect(200)).body.data.options[0].value as string;
      expect((await state(a, id).expect(200)).body.data.status).toBe('delivered');

      expect((await regenerate(a, id).expect(202)).body.data.status).toBe('preparing');
      expect((await agentRow(id)).agent_id).toBeNull(); // el vínculo con el agente viejo se borró
      expect(await serveEnrollment()).toEqual(['completed']);
      expect(sonda.removed).toEqual([id]); // el trabajador retiró el agente viejo POR SU NOMBRE
      const newAgentId = sonda.agents.get(id)!.id;
      expect(newAgentId).not.toBe(oldAgentId);

      const second = (await reveal(a, id).expect(200)).body.data.options[0].value as string;
      expect(second).not.toBe(first);
      expect(second).toContain(`--name '${id}'`);
      expect((await agentRow(id)).agent_id).toBe(newAgentId);
    });

    it('si el comando no se alcanzó a copiar (sigue «listo»), generar de nuevo también sirve', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      await serveEnrollment();
      expect((await state(a, id).expect(200)).body.data.status).toBe('ready');
      await regenerate(a, id).expect(202);
      await serveEnrollment();
      expect((await reveal(a, id).expect(200)).body.data.options).toHaveLength(1);
    });

    it('mientras se está creando, generar de nuevo no pisa la ejecución en curso (409)', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      expect((await regenerate(a, id).expect(409)).body.error.code).toBe('EXECUTION_IN_PROGRESS');
    });
  });

  describe('si el trabajador no puede crear el agente', () => {
    it('queda «failed» con el motivo TRADUCIDO (nunca el de la sonda), y el cliente puede reintentar', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      sonda.failWith = new RunnerFailure(FAILURE.probeUnreachable);
      expect(await serveEnrollment()).toEqual(['failed']);
      const d = (await state(a, id).expect(200)).body.data;
      expect(d.status).toBe('failed');
      expect(d.failure_message).toMatch(/No pudimos consultar la sonda/);
      expect(JSON.stringify(d)).not.toMatch(/wazuh|probe_unreachable/i);
      expect(await enrollments(id)).toEqual([{ status: 'failed', failure_reason: 'connection.probe_unreachable' }]);

      // Reintento: vuelve a «preparando» y ahora sí.
      sonda.failWith = null;
      expect((await start(a, id).expect(202)).body.data.status).toBe('preparing');
      expect(await serveEnrollment()).toEqual(['completed']);
      expect((await state(a, id).expect(200)).body.data.status).toBe('ready');
    });
  });

  it('una clave que CADUCÓ sin leerse no se puede pedir: hay que generar una nueva', async () => {
    const id = await declare(a);
    await start(a, id).expect(202);
    await serveEnrollment();
    await owner(`update tenant.asset_agents set install_key_expires_at = now() at time zone 'utc' - interval '1 minute' where asset_id = $1`, [id]);
    expect((await state(a, id).expect(200)).body.data.status).toBe('delivered');
    expect((await reveal(a, id).expect(409)).body.error.code).toBe('AGENT_INSTALL_NOT_READY');
  });

  it('pedir el comando antes de que esté listo es 409, y no gasta nada', async () => {
    const id = await declare(a);
    expect((await reveal(a, id).expect(409)).body.error.code).toBe('AGENT_INSTALL_NOT_READY');
    await start(a, id).expect(202);
    expect((await reveal(a, id).expect(409)).body.error.code).toBe('AGENT_INSTALL_NOT_READY'); // sigue en preparación
  });

  it('la creación del agente NO aparece en el historial de evaluaciones del cliente', async () => {
    const id = await declare(a);
    await start(a, id).expect(202);
    await serveEnrollment();
    expect((await a.agent.get(`/v1/assets/${id}/executions`).expect(200)).body.data.items).toEqual([]);
  });

  describe('lo que se registra en la bitácora', () => {
    it('quién y qué, sobre qué servidor, y NUNCA el comando ni la clave', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      await serveEnrollment();
      const command = (await reveal(a, id).expect(200)).body.data.options[0].value as string;
      const agentId = sonda.agents.get(id)!.id;
      const plainKey = Buffer.from(`${agentId} ${id} any ${'ab'.repeat(32)}`).toString('base64');
      const rows = await owner<{ action: string; s: string }>(`select action, (coalesce(before_state::text,'') || coalesce(after_state::text,'')) s from audit.audit_logs where tenant_id = $1 and after_state->>'asset_id' = $2 order by created_at`, [a.companyId, id]);
      expect(rows.map((r) => r.action)).toEqual(expect.arrayContaining(['agent.install.prepare', 'agent.enroll', 'agent.install.reveal']));
      for (const r of rows) {
        expect(r.s).not.toContain(plainKey);
        expect(r.s).not.toContain('sudo');
        expect(r.s).not.toContain(command);
      }
      expect(rows.find((r) => r.action === 'agent.enroll')!.s).toContain(`"agent_id": "${agentId}"`);
    });
  });

  describe('lo que no se puede', () => {
    it('un activo que no es un servidor con agente (una cuenta de nube) es 409', async () => {
      expect((await state(a, a.assetId).expect(409)).body.error.code).toBe('ASSET_NOT_AGENT');
      expect((await start(a, a.assetId).expect(409)).body.error.code).toBe('ASSET_NOT_AGENT');
      expect((await reveal(a, a.assetId).expect(409)).body.error.code).toBe('ASSET_NOT_AGENT');
    });

    it('un activo de OTRA empresa no existe (404), en las cuatro operaciones', async () => {
      const id = await declare(a);
      await start(a, id).expect(202);
      await serveEnrollment();
      for (const call of [state, start, reveal, regenerate]) await call(b, id).expect(404);
      // y la empresa dueña sigue pudiendo
      await reveal(a, id).expect(200);
    });

    it('sin sesión, 401', async () => {
      const id = await declare(a);
      await request(app.getHttpServer()).get(`/v1/assets/${id}/agent-install`).expect(401);
      await request(app.getHttpServer()).post(`/v1/assets/${id}/agent-install/reveal`).expect(401);
    });

    it('un activo que no existe es 404', async () => {
      await state(a, '11111111-1111-4111-8111-111111111111').expect(404);
      await state(a, 'no-es-un-uuid').expect(404);
    });
  });

  describe('la API interna del trabajador (SEG-47)', () => {
    const internal = (path: string, body: Record<string, unknown>, token = RUNNER_TOKEN) => request(app.getHttpServer()).post(`/internal/runner${path}`).set('Authorization', `Bearer ${token}`).send(body);

    const claimed = async (): Promise<{ id: string; assetId: string }> => {
      const assetId = await declare(a);
      await start(a, assetId).expect(202);
      const res = await internal('/claim', { kind: 'enrollment' }).expect(200);
      return { id: res.body.data.execution_id, assetId };
    };

    it('el reclamo trae el nombre y el grupo del agente (derivados del activo y la empresa) y NINGUNA credencial', async () => {
      const assetId = await declare(a);
      await start(a, assetId).expect(202);
      const res = await internal('/claim', { kind: 'enrollment' }).expect(200);
      expect(res.body.data).toMatchObject({ kind: 'enrollment', tenant_id: a.companyId, asset_id: assetId, platform: 'linux', connection: { method: 'agent' }, agent: { name: assetId, group: a.companyId } });
      expect(JSON.stringify(res.body)).not.toMatch(/secret|password|key/i);
    });

    it('un reclamo de otro tipo no se lleva la creación de un agente (cada carril pide el suyo)', async () => {
      const assetId = await declare(a);
      await start(a, assetId).expect(202);
      await internal('/claim', { kind: 'validation' }).expect(204);
      await internal('/claim', { kind: 'assessment' }).expect(204);
    });

    it('sin el token del trabajador, 401', async () => {
      await internal('/claim', { kind: 'enrollment' }, 'token-equivocado').expect(401);
    });

    it('entregar con la empresa EQUIVOCADA no encuentra la ejecución (409): no puede escribir en otra empresa', async () => {
      const { id } = await claimed();
      const res = await internal(`/executions/${id}/enrolled`, { tenant_id: b.companyId, agent_id: '001', key: Buffer.from('x'.repeat(100)).toString('base64') }).expect(409);
      expect(res.body.error.code).toBe('EXECUTION_NOT_RUNNING');
    });

    it.each([
      ['un id de agente con forma rara', { agent_id: '1; rm -rf' }],
      ['una clave con forma rara', { key: 'esto no es base64!!' }],
      ['una clave demasiado corta', { key: 'YWJj' }],
    ])('rechaza %s (422) y no guarda nada', async (_n, over) => {
      const { id, assetId } = await claimed();
      const res = await internal(`/executions/${id}/enrolled`, { tenant_id: a.companyId, agent_id: '001', key: Buffer.from('x'.repeat(100)).toString('base64'), ...over }).expect(422);
      expect(res.body.error).toBeDefined();
      expect((await agentRow(assetId)).agent_id).toBeNull();
      expect((await agentRow(assetId)).cipher).toBeNull();
    });

    it('un id de agente que figuraba en OTRO activo (la sonda recicla ids) se suelta de ese activo y se enlaza al nuevo: un agente nunca queda en dos servidores', async () => {
      const first = await declare(a);
      await start(a, first).expect(202);
      await serveEnrollment(); // el primero queda enlazado con su agente
      const taken = sonda.agents.get(first)!.id;
      expect((await agentRow(first)).agent_id).toBe(taken);
      const { id, assetId } = await claimed();
      await internal(`/executions/${id}/enrolled`, { tenant_id: a.companyId, agent_id: taken, key: Buffer.from('x'.repeat(100)).toString('base64') }).expect(200);
      // El dueño anterior ya no existe en la sonda: su vínculo se soltó. El nuevo lo tiene, y el id sigue siendo único.
      expect((await agentRow(assetId)).agent_id).toBe(taken);
      expect((await agentRow(first)).agent_id).toBeNull();
    });

    it('una ejecución solo se cierra UNA vez', async () => {
      const { id } = await claimed();
      const body = { tenant_id: a.companyId, agent_id: nextAgentId(), key: Buffer.from('x'.repeat(100)).toString('base64') };
      await internal(`/executions/${id}/enrolled`, body).expect(200);
      expect((await internal(`/executions/${id}/enrolled`, { ...body, agent_id: nextAgentId() }).expect(409)).body.error.code).toBe('EXECUTION_NOT_RUNNING');
    });
  });

  describe('si esta instalación no está configurada para instalar la sonda', () => {
    it.each([
      ['sin la dirección de Monkey', 'SONDA_MANAGER_HOST'],
      ['sin la versión fija del programa', 'SONDA_AGENT_VERSION'],
      ['sin la dirección de los instaladores', 'AGENT_INSTALLER_BASE_URL'],
    ])('%s: 503 en las operaciones, sin armar un comando roto', async (_n, missing) => {
      const id = await declare(a);
      const before = process.env[missing];
      process.env[missing] = '';
      try {
        expect((await state(a, id).expect(503)).body.error.code).toBe('AGENT_INSTALL_UNAVAILABLE');
        expect((await start(a, id).expect(503)).body.error.code).toBe('AGENT_INSTALL_UNAVAILABLE');
        expect((await reveal(a, id).expect(503)).body.error.code).toBe('AGENT_INSTALL_UNAVAILABLE');
        expect((await regenerate(a, id).expect(503)).body.error.code).toBe('AGENT_INSTALL_UNAVAILABLE');
        expect(await enrollments(id)).toEqual([]); // y no dejó nada en cola
      } finally {
        process.env[missing] = before;
      }
      expect((await state(a, id).expect(200)).body.data.status).toBe('not_started');
    });
  });
});

describe('Los instaladores públicos', () => {
  const get = (path: string) => request(app.getHttpServer()).get(`/v1/install/${path}`);

  it('Linux: el script se descarga SIN sesión (el curl del cliente no la lleva) y no cambia', async () => {
    const res = await get('agent.sh').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/x-shellscript/);
    expect(res.headers['cache-control']).toMatch(/no-store/);
    expect(res.text.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(res.text).toContain('--manager');
  });

  it('Windows: el script con su bloque de parámetros, sin sesión', async () => {
    const res = await get('agent.ps1').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/^param\(/m);
    expect(res.text).not.toContain('__PARAMS__');
  });

  it('son públicos pero NO secretos: no llevan ninguna clave ni dato de un servidor', async () => {
    const id = await declare(a);
    await start(a, id).expect(202);
    await serveEnrollment();
    const plainKey = Buffer.from(`${sonda.agents.get(id)!.id} ${id} any ${'ab'.repeat(32)}`).toString('base64');
    for (const path of ['agent.sh', 'agent.ps1']) {
      const res = await get(path).expect(200);
      expect(res.text).not.toContain(plainKey);
      expect(res.text).not.toContain(id);
    }
  });

  it('no se pueden pedir otros archivos por esa ruta', async () => {
    await get('../../etc/passwd').expect(404);
    await get('agent.exe').expect(404);
  });
});
