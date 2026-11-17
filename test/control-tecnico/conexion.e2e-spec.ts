import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { RunNextExecution } from '../../src/runner/application/run-next-execution';
import { Inventory } from '../../src/runner/domain/inventory';
import { CredentialBroker, InventoryScanner, RunnerLogger, ScanEngine } from '../../src/runner/domain/ports';
import { FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../../src/runner/domain/runner.types';
import { HttpRunnerApi } from '../../src/runner/infrastructure/http-runner-api';
import { bootApp, MONKEY_PRINCIPAL_ARN, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D58: el flujo de conexión de una cuenta de nube, de punta a punta por HTTP. El backend es el REAL y la validación pasa por el trabajador REAL
// (su bucle y su cliente HTTP); solo el acceso a AWS (credenciales) y el motor son simulados. Es lo que se presenta.
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;
const SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY-no-debe-salir';
const TEMP: TemporaryCredentials = { provider: 'aws', accessKeyId: 'ASIATEMP', secretAccessKey: 'secreto-temporal', sessionToken: 'token' };

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let baseUrl: string;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

class FakeBroker extends CredentialBroker {
  jobs: RunnerJob[] = [];
  constructor(private readonly fail?: RunnerFailure) { super(); }
  obtain(job: RunnerJob) { this.jobs.push(job); return this.fail ? Promise.reject(this.fail) : Promise.resolve(TEMP); }
}
class NoEngine extends ScanEngine {
  run(): never { throw new Error('una validación no debe correr el motor'); }
  cleanupOrphans() { return Promise.resolve(0); }
}
class SilentLog extends RunnerLogger { info() {} error() {} }

/** El carril de validación del trabajador, trabajando mientras el cliente espera su respuesta. */
async function serveValidation(broker: CredentialBroker, attempts = 40, scanner?: InventoryScanner): Promise<string> {
  const lane = new RunNextExecution(new HttpRunnerApi(baseUrl, RUNNER_TOKEN), broker, new NoEngine(), new SilentLog(), 'validation', scanner);
  for (let i = 0; i < attempts; i++) {
    const r = await lane.execute();
    if (r !== 'idle') return r;
    await new Promise((res) => setTimeout(res, 150));
  }
  return 'idle';
}

const roleAsset = (over: Record<string, unknown> = {}) => ({
  name: `aws-${RUN}-${Math.random().toString(36).slice(2, 6)}`, connection_category: 'ac_01', connection_method: 'readonly_role', platform: 'aws',
  external_account_id: ACCOUNT, regions: ['us-east-1', 'us-east-2'], service_ids: [a.serviceId], ...over,
});
const create = (t: Tenant, body: Record<string, unknown>) => t.agent.post('/v1/assets').send(body);
const validate = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/validate`);

beforeAll(async () => {
  // PROBE_MODE=runner: la validación la hace el trabajador (D58). Espera corta para la prueba del «no disponible».
  app = await bootApp({ PROBE_MODE: 'runner', VALIDATION_WAIT_SECONDS: '3' });
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  ({ a, b } = await dosEmpresas(app));
  // El catálogo de checks de nube en una base nueva (CI) está vacío: la prueba trae el suyo en lugar de depender de lo que dejó otra corrida.
  for (const id of ['conexion_check_1', 'conexion_check_2', 'conexion_check_3']) {
    await owner(
      `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
       values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
      [id],
    );
  }
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
beforeEach(drainQueue);

describe('Alta de una cuenta de nube con su canal de conexión', () => {
  it('rol de solo lectura: Monkey genera el ExternalId y le dice al cliente qué hacer, sin pedirle ningún secreto', async () => {
    const res = await create(a, roleAsset()).expect(201);
    const d = res.body.data;
    expect(d).toMatchObject({ platform: 'aws', external_account_id: ACCOUNT, provisioning: { connection_method: 'readonly_role', regions: ['us-east-1', 'us-east-2'], connection_status: 'pending', is_active: false } });
    expect(d.connection_setup).toMatchObject({ method: 'readonly_role', monkey_principal_arn: MONKEY_PRINCIPAL_ARN, role_name: 'MonkeyReadOnly', template_path: '/v1/connection-templates/aws-readonly-role', role_arn: null });
    expect(d.connection_setup.external_id).toMatch(/^mk-[0-9a-f]{20}$/);
    expect(d.connection_setup.steps).toHaveLength(4);
    expect(d.connection_setup.steps[0]).toMatch(/plantilla/i); // traducidos: la plataforma no tiene i18n propio
    expect(JSON.stringify(res.body)).not.toMatch(/credential|encrypted|secret/i);
  });

  it('cada activo tiene su propio ExternalId', async () => {
    const ids = await Promise.all([create(a, roleAsset()), create(a, roleAsset())].map((p) => p.then((r) => r.body.data.connection_setup.external_id)));
    expect(new Set(ids).size).toBe(2);
  });

  it('el detalle conserva las instrucciones (el cliente puede volver a la pantalla)', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    const d = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data;
    expect(d.connection_setup.method).toBe('readonly_role');
    expect(d.connection_setup.external_id).toMatch(/^mk-/);
  });

  it.each([
    ['cuenta mal formada', { external_account_id: '123' }, 'external_account_id', 'invalid'],
    ['sin cuenta', { external_account_id: null }, 'external_account_id', 'required'],
    ['sin regiones', { regions: [] }, 'regions', 'array.min'],
    ['región inventada', { regions: ['us-east-1; rm -rf /'] }, 'regions', 'invalid'],
    ['región repetida', { regions: ['us-east-1', 'us-east-1'] }, 'regions', 'array.unique'],
    ['una plataforma bloqueada (Azure todavía no tiene flujo)', { platform: 'azure' }, 'platform', 'connection.provider_not_supported'],
    ['una plataforma que no es de esa conexión (Linux no es de nube)', { platform: 'linux' }, 'platform', 'platform.not_in_category'],
    ['una plataforma que no existe', { platform: 'no-existe' }, 'platform', 'platform.not_in_category'],
    ['sin canal de conexión', { connection_method: undefined }, 'connection_method', 'enum.invalid'],
    ['credenciales con el canal de rol', { credentials: { access_key_id: 'x' } }, 'credentials', 'field.not_allowed'],
  ])('rechaza %s (422, con el campo y su texto)', async (_n, over, field, code) => {
    const res = await create(a, roleAsset(over)).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field, code, message: expect.any(String) })]));
  });

  it('un canal que la plataforma no tiene es 409, no un error de formulario', async () => {
    const res = await create(a, roleAsset({ connection_method: 'agent' })).expect(409);
    expect(res.body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
  });

  it('el canal de llaves exige las dos llaves, las guarda cifradas y NUNCA las devuelve', async () => {
    await create(a, roleAsset({ connection_method: 'access_keys' })).expect(422);
    const res = await create(a, roleAsset({ connection_method: 'access_keys', credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } })).expect(201);
    expect(res.body.data.connection_setup).toMatchObject({ method: 'access_keys', warning: expect.stringMatching(/menos seguras|larga duración/i) });
    expect(JSON.stringify(res.body)).not.toContain(SECRET);
    const detail = await a.agent.get(`/v1/assets/${res.body.data.id}`).expect(200);
    expect(JSON.stringify(detail.body)).not.toContain(SECRET);
    const [row] = await owner<{ c: string }>('select encrypted_credentials c from tenant.asset_provisionings where asset_id = $1', [res.body.data.id]);
    expect(row.c).not.toContain(SECRET); // cifrado en la base
  });
});

describe('Las opciones de la pantalla vienen del backend, con su texto', () => {
  it('regiones de AWS y canales de conexión (la pantalla no hardcodea listas)', async () => {
    const regions = (await a.agent.get('/v1/catalogs/aws_region').expect(200)).body.data.items as { value: string; label: string }[];
    expect(regions.find((r) => r.value === 'us-east-1')).toEqual({ value: 'us-east-1', label: 'Virginia del Norte (us-east-1)' });
    expect(regions.length).toBeGreaterThanOrEqual(15);
    const methods = (await a.agent.get('/v1/catalogs/connection_method').expect(200)).body.data.items as { value: string; label: string }[];
    expect(methods.map((m) => m.value)).toEqual(['readonly_role', 'access_keys', 'agent', 'identity_federation']);
    expect(methods[0].label).toMatch(/recomendado/i);
  });
  it('el alta solo acepta las regiones que se ofrecen', async () => {
    await create(a, roleAsset({ regions: ['us-gov-west-1'] })).expect(422); // existe en AWS, pero no se ofrece
    await create(a, roleAsset({ regions: ['eu-west-1'] })).expect(201);
  });
  // D67: las reglas son datos, no código. Agregar una región a la plataforma en la base cambia lo que el catálogo ofrece y lo que el alta acepta, sin tocar el código.
  it('las regiones salen de la base: agregar una cambia el catálogo y lo que el alta acepta', async () => {
    const REGION = 'us-gov-west-1';
    const ids = await owner<{ id: string }>(`select p.id from catalog.capability_platforms p join catalog.automated_capabilities c on c.id = p.automated_capability_id where c.catalog_code = 'ac_01' and p.code = 'aws'`);
    try {
      await owner('insert into catalog.platform_regions (id, platform_id, code, name, sort_order) values (gen_random_uuid(), $1, $2, $3, 99)', [ids[0].id, REGION, 'GovCloud (US-West)']);
      const items = (await a.agent.get('/v1/catalogs/aws_region').expect(200)).body.data.items as { value: string; label: string }[];
      expect(items.find((r) => r.value === REGION)).toEqual({ value: REGION, label: 'GovCloud (US-West)' }); // sin etiqueta traducida: el nombre del proveedor
      await create(a, roleAsset({ regions: [REGION] })).expect(201);
    } finally {
      await owner('delete from catalog.platform_regions where platform_id = $1 and code = $2', [ids[0].id, REGION]);
    }
    await create(a, roleAsset({ regions: [REGION] })).expect(422);
  });
});

describe('La plantilla que el cliente crea en su cuenta', () => {
  it('se descarga como archivo, pide solo lectura y exige el ExternalId', async () => {
    const res = await a.agent.get('/v1/connection-templates/aws-readonly-role').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/yaml/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="RoleMonkeyReadOnly\.yaml"/);
    const yaml = res.text;
    expect(yaml).toContain('sts:ExternalId');
    expect(yaml).toContain('arn:aws:iam::aws:policy/SecurityAudit');
    expect(yaml).toContain('arn:aws:iam::aws:policy/job-function/ViewOnlyAccess');
    expect(yaml).toContain('RoleName: MonkeyReadOnly');
    // ni un permiso de escritura ni comodines: es SOLO lectura
    expect(yaml).not.toMatch(/Action:\s*["']?\*/);
    expect(yaml).not.toMatch(/AdministratorAccess|PowerUser|FullAccess/);
    expect(yaml).not.toMatch(/prowler|wazuh/i);
  });
  it('exige sesión', async () => {
    await request(app.getHttpServer()).get('/v1/connection-templates/aws-readonly-role').expect(401);
  });
});

describe('El cliente entrega el rol que creó', () => {
  it('guarda el ARN, y la conexión vuelve a «pendiente»', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    const res = await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    expect(res.body.data.connection_setup.role_arn).toBe(ROLE_ARN);
    expect(res.body.data.provisioning.connection_status).toBe('pending');
  });
  it.each([
    ['no es un ARN', 'esto-no-es-un-arn', 'invalid'],
    ['es de OTRA cuenta que la declarada', 'arn:aws:iam::999999999999:role/MonkeyReadOnly', 'connection.account_mismatch'],
    ['no es un rol (es un usuario)', `arn:aws:iam::${ACCOUNT}:user/alguien`, 'invalid'],
  ])('rechaza un ARN que %s', async (_n, role_arn, code) => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    const res = await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn }).expect(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'role_arn', code, message: expect.any(String) });
  });
  it('solo aplica al canal de rol, y una empresa ajena ve 404', async () => {
    const keys = (await create(a, roleAsset({ connection_method: 'access_keys', credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } })).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/assets/${keys}/connection`).send({ role_arn: ROLE_ARN }).expect(409)).body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await b.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(404);
  });
});

const res = (uid: string, kind: Inventory['resources'][number]['kind'], name: string, region: string, attributes: Record<string, string | number | boolean | null> = {}, tags: string[] = []) => ({ uid, type: `Aws${kind}`, kind, name, region, attributes, tags });
const INVENTORY: Inventory = {
  warnings: [],
  resources: [
    res(`arn:aws:ec2:us-east-1:${ACCOUNT}:instance/i-1`, 'server', 'api-prod', 'us-east-1', { os: 'Ubuntu 22.04', os_source: 'image', state: 'running', private_ip: '10.0.1.15', availability_zone: 'us-east-1a', instance_id: 'i-1' }, ['ambiente=prod', 'equipo=pagos']),
    res(`arn:aws:ec2:us-east-2:${ACCOUNT}:instance/i-2`, 'server', 'worker', 'us-east-2', { os: null, state: 'stopped' }),
    res(`arn:aws:rds:us-east-1:${ACCOUNT}:db:main`, 'database', 'main', 'us-east-1', { engine: 'postgres', engine_version: '16.3' }),
    res('arn:aws:s3:::datos-prod', 'storage', 'datos-prod', 'us-east-1'),
  ],
};
const scannerOf = (inv: Inventory): InventoryScanner => ({ discover: () => Promise.resolve(inv) });

describe('Los activos que la conexión reconoce en la cuenta (D59)', () => {
  const connect = async (inv: Inventory | null, over: Record<string, unknown> = {}) => {
    const id = (await create(a, roleAsset(over)).expect(201)).body.data.id as string;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const served = serveValidation(new FakeBroker(), 40, inv ? scannerOf(inv) : undefined);
    await validate(a, id).expect(200);
    await served;
    return id;
  };

  it('antes de comprobar la conexión no hay nada descubierto (no es un error)', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    const res = await a.agent.get(`/v1/assets/${id}/resources`).expect(200);
    expect(res.body.data).toMatchObject({ discovered_at: null, items: [], total: 0, summary: [] });
  });

  it('al validar, el cliente ve los activos encontrados, por clase y con lo que se pudo leer de cada uno', async () => {
    const id = await connect(INVENTORY);
    const res = await a.agent.get(`/v1/assets/${id}/resources`).expect(200);
    expect(res.body.data.discovered_at).toEqual(expect.any(String));
    expect(res.body.data.regions).toEqual(['us-east-1', 'us-east-2']);
    expect(res.body.data.summary).toEqual(expect.arrayContaining([{ kind: 'server', count: 2 }, { kind: 'database', count: 1 }, { kind: 'storage', count: 1 }]));
    expect(res.body.data.total).toBe(4);
    const api = res.body.data.items.find((r: { name: string }) => r.name === 'api-prod');
    expect(api).toMatchObject({ kind: 'server', region: 'us-east-1', attributes: { os: 'Ubuntu 22.04', os_source: 'image' } });
    expect(JSON.stringify(res.body)).not.toMatch(/tenant|encrypted|secret/i);
  });

  it('si un servicio no se pudo leer, el cliente ve «incompleto» y no «vacío»', async () => {
    const id = await connect({ ...INVENTORY, warnings: ['rds'] });
    const res = await a.agent.get(`/v1/assets/${id}/resources`).expect(200);
    expect(res.body.data.incomplete_services).toEqual(['rds']);
    expect(res.body.data.total).toBe(4);
  });

  it('una conexión ya activa también se puede volver a comprobar: refresca los activos y su estado no cambia', async () => {
    const id = await connect(INVENTORY);
    await a.agent.post(`/v1/assets/${id}/activate`).expect(200);
    const served = serveValidation(new FakeBroker(), 40, scannerOf({ warnings: [], resources: [res(`arn:aws:ec2:us-east-1:${ACCOUNT}:instance/i-7`, 'server', 'solo-este', 'us-east-1')] }));
    await validate(a, id).expect(200);
    await served;
    const detail = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data;
    expect(detail.provisioning).toMatchObject({ connection_status: 'active', is_active: true });
    expect((await a.agent.get(`/v1/assets/${id}/resources`).expect(200)).body.data.items.map((r: { name: string }) => r.name)).toEqual(['solo-este']);
  });

  it('se puede filtrar por clase', async () => {
    const id = await connect(INVENTORY);
    const res = await a.agent.get(`/v1/assets/${id}/resources`).query({ kind: 'database' }).expect(200);
    expect(res.body.data.items.map((r: { name: string }) => r.name)).toEqual(['main']);
    expect(res.body.data.summary.length).toBe(3); // el resumen no depende del filtro
  });

  it('solo se muestran las regiones declaradas: al quitar una, sus activos desaparecen', async () => {
    const id = await connect(INVENTORY);
    await a.agent.patch(`/v1/assets/${id}`).send({ regions: ['us-east-1'] }).expect(200);
    await a.agent.get(`/v1/assets/${id}/resources`).expect(200).then((r) => {
      expect(r.body.data.items.map((x: { name: string }) => x.name).sort()).toEqual(['api-prod', 'datos-prod', 'main']);
    });
  });

  it('volver a comprobar actualiza lo conocido y deja de mostrar lo que ya no está', async () => {
    const id = await connect(INVENTORY);
    const served = serveValidation(new FakeBroker(), 40, scannerOf({ warnings: [], resources: [INVENTORY.resources[0], res(`arn:aws:ec2:us-east-1:${ACCOUNT}:instance/i-9`, 'server', 'nuevo', 'us-east-1')] }));
    await validate(a, id).expect(200);
    await served;
    const list = (await a.agent.get(`/v1/assets/${id}/resources`).expect(200)).body.data.items.map((r: { name: string }) => r.name).sort();
    expect(list).toEqual(['api-prod', 'nuevo']);
  });

  it('una validación sin descubrimiento sigue siendo válida y no inventa activos', async () => {
    const id = await connect(null);
    expect((await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.provisioning.connection_status).toBe('validated');
    expect((await a.agent.get(`/v1/assets/${id}/resources`).expect(200)).body.data.total).toBe(0);
  });

  it('los recursos que solo conoce la evaluación (otras clases) no se muestran como activos', async () => {
    const id = await connect({ warnings: [], resources: [res(`arn:aws:iam::${ACCOUNT}:user/alguien`, 'other', 'alguien', 'us-east-1')] });
    expect((await a.agent.get(`/v1/assets/${id}/resources`).expect(200)).body.data.total).toBe(0);
  });

  it('una empresa ajena ve 404, y un activo dado de baja también', async () => {
    const id = await connect(INVENTORY);
    await b.agent.get(`/v1/assets/${id}/resources`).expect(404);
    await a.agent.delete(`/v1/assets/${id}`).expect(200);
    await a.agent.get(`/v1/assets/${id}/resources`).expect(404);
  });

  it('el trabajador no puede entregar un inventario mal formado', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const served = serveValidation(new FakeBroker(), 40, scannerOf({ warnings: [], resources: [{ uid: 'x', type: 'T', kind: 'inventada' as never, name: null, region: null, attributes: {}, tags: [] }] }));
    await validate(a, id);
    await served;
    expect((await a.agent.get(`/v1/assets/${id}/resources`).expect(200)).body.data.total).toBe(0);
  });
});

describe('Los activos descubiertos son activos del cliente y se enlazan a servicios (D61)', () => {
  const connect = async (inv: Inventory) => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id as string;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const served = serveValidation(new FakeBroker(), 40, scannerOf(inv));
    await validate(a, id).expect(200);
    await served;
    return id;
  };
  const listing = async (id: string, extra: Record<string, string> = {}) => (await a.agent.get(`/v1/assets/${id}/resources`).query({ service_id: a.serviceId, ...extra }).expect(200)).body.data;
  const idOf = (data: { items: { id: string; name: string }[] }, name: string) => data.items.find((i) => i.name === name)!.id;
  const put = (conn: string, ids: string[], serviceId = a.serviceId) => a.agent.put(`/v1/services/${serviceId}/connections/${conn}/assets`).send({ asset_ids: ids });

  it('cada recurso descubierto es un activo propio, con su código, su IP, su zona y sus etiquetas', async () => {
    const id = await connect(INVENTORY);
    const data = await listing(id);
    const api = data.items.find((i: { name: string }) => i.name === 'api-prod');
    expect(api).toMatchObject({ code: expect.stringMatching(/^AST-\d{4}$/), kind: 'server', ip_address: '10.0.1.15', location: 'us-east-1a', platform: 'Ubuntu 22.04', criticality: 'medium', tags: ['ambiente=prod', 'equipo=pagos'], in_service: false });
    expect(api.attributes).toMatchObject({ instance_id: 'i-1', private_ip: '10.0.1.15' });
    const codes = data.items.map((i: { code: string }) => i.code);
    expect(new Set(codes).size).toBe(codes.length);
    const [row] = await owner<{ origin: string; parent: string; res: string }>('select origin::text, parent_asset_id::text parent, resource_id::text res from tenant.assets where id = $1', [api.id]);
    expect(row).toMatchObject({ origin: 'discovered', parent: id });
    expect(row.res).toEqual(expect.any(String));
  });

  it('los activos descubiertos no son conexiones: no salen en el listado ni cuentan en las conexiones del servicio', async () => {
    const id = await connect(INVENTORY);
    const mine = (await a.agent.get('/v1/assets').query({ page_size: 100 }).expect(200)).body.data.items as { id: string }[];
    expect(mine.some((x) => x.id === id)).toBe(true);
    const child = idOf(await listing(id), 'api-prod');
    expect(mine.some((x) => x.id === child)).toBe(false);
    await a.agent.get(`/v1/assets/${child}`).expect(404);
    await validate(a, child).expect(404);
    await a.agent.patch(`/v1/assets/${child}`).send({ name: 'x' }).expect(404);
  });

  it('el cliente elige cuáles son del servicio; los demás quedan visibles como «no incluidos»', async () => {
    const id = await connect(INVENTORY);
    const before = await listing(id);
    expect(before.included_count).toBe(0);
    const pick = [idOf(before, 'api-prod'), idOf(before, 'main')];
    const saved = await put(id, pick).expect(200);
    expect(saved.body.data).toEqual({ included: 2, added: 2, removed: 0 });
    const after = await listing(id);
    expect(after.included_count).toBe(2);
    expect(after.total).toBe(4);
    expect(after.items.filter((i: { in_service: boolean }) => i.in_service).map((i: { name: string }) => i.name).sort()).toEqual(['api-prod', 'main']);
    // fija el conjunto exacto: quitar uno y agregar otro
    const swap = await put(id, [idOf(before, 'api-prod'), idOf(before, 'worker')]).expect(200);
    expect(swap.body.data).toEqual({ included: 2, added: 1, removed: 1 });
    expect((await put(id, []).expect(200)).body.data).toMatchObject({ included: 0, removed: 2 });
  });

  it('solo se pueden enlazar activos de ESA conexión; con ids ajenos o inventados es 422, y otra empresa ve 404', async () => {
    const one = await connect(INVENTORY);
    const two = await connect({ warnings: [], resources: [res(`arn:aws:ec2:us-east-1:${ACCOUNT}:instance/i-77`, 'server', 'otra-conexion', 'us-east-1')] });
    const foreign = idOf(await listing(two), 'otra-conexion');
    const bad = await put(one, [foreign]).expect(422);
    expect(bad.body.error.fields[0]).toMatchObject({ field: 'asset_ids', code: 'invalid' });
    await put(one, ['6f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b']).expect(422);
    await b.agent.put(`/v1/services/${a.serviceId}/connections/${one}/assets`).send({ asset_ids: [] }).expect(404);
    await put(one, [], b.serviceId).expect(404);
    await a.agent.put(`/v1/services/${a.serviceId}/connections/${one}/assets`).send({ asset_ids: 'no-es-lista' }).expect(422);
  });

  it('un servicio que no existe para la empresa no puede enlazar activos (404)', async () => {
    const id = await connect(INVENTORY);
    await a.agent.put(`/v1/services/6f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b/connections/${id}/assets`).send({ asset_ids: [] }).expect(404);
  });

  it('un servicio ve solo sus activos al volver a comprobar; lo que desaparece de AWS se da de baja y se desenlaza', async () => {
    const id = await connect(INVENTORY);
    const first = await listing(id);
    await put(id, [idOf(first, 'api-prod'), idOf(first, 'worker')]).expect(200);
    const served = serveValidation(new FakeBroker(), 40, scannerOf({ warnings: [], resources: INVENTORY.resources.filter((r) => r.name !== 'worker') }));
    await validate(a, id).expect(200);
    await served;
    const now = await listing(id);
    expect(now.items.map((i: { name: string }) => i.name).sort()).toEqual(['api-prod', 'datos-prod', 'main']);
    expect(now.included_count).toBe(1);
    const [gone] = await owner<{ status: string; links: number }>(`select status::text, (select count(*)::int from tenant.service_assets where asset_id = $1) links from tenant.assets where id = $1`, [idOf(first, 'worker')]);
    expect(gone).toEqual({ status: 'inactive', links: 0 });
  });

  it('si un servicio de AWS no se pudo leer, sus activos NO se dan por desaparecidos', async () => {
    const id = await connect(INVENTORY);
    const first = await listing(id);
    const served = serveValidation(new FakeBroker(), 40, scannerOf({ warnings: ['ec2'], resources: INVENTORY.resources.filter((r) => r.kind !== 'server') }));
    await validate(a, id).expect(200);
    await served;
    const now = await listing(id);
    expect(now.items.filter((i: { kind: string }) => i.kind === 'server')).toHaveLength(2);
    expect(now.incomplete_services).toEqual(['ec2']);
    expect(first.total).toBe(4);
  });

  it('al dar de baja la conexión, sus activos se dan de baja y se desenlazan, pero su historial queda', async () => {
    const id = await connect(INVENTORY);
    const first = await listing(id);
    const child = idOf(first, 'api-prod');
    await put(id, [child, idOf(first, 'main')]).expect(200);
    await a.agent.delete(`/v1/assets/${id}`).expect(200);
    const [row] = await owner<{ inactive: number; links: number; kept: number }>(
      `select count(*) filter (where status = 'inactive')::int inactive,
              (select count(*)::int from tenant.service_assets sa join tenant.assets c on c.id = sa.asset_id where c.parent_asset_id = $1) links,
              (select count(*)::int from tenant.asset_resources where asset_id = $1) kept
         from tenant.assets where parent_asset_id = $1`,
      [id],
    );
    expect(row).toEqual({ inactive: 4, links: 0, kept: 4 });
  });

  it('volver a descubrir conserva la criticidad y el enlace que fijó el cliente', async () => {
    const id = await connect(INVENTORY);
    const first = await listing(id);
    const child = idOf(first, 'api-prod');
    await put(id, [child]).expect(200);
    await owner(`update tenant.assets set criticality = 'high' where id = $1`, [child]);
    const served = serveValidation(new FakeBroker(), 40, scannerOf(INVENTORY));
    await validate(a, id).expect(200);
    await served;
    const again = await listing(id);
    expect(again.items.find((i: { id: string }) => i.id === child)).toMatchObject({ criticality: 'high', in_service: true });
    expect(again.total).toBe(4);
  });
});

describe('Editar y dar de baja un sistema (CRUD)', () => {
  const validated = async (over: Record<string, unknown> = {}) => {
    const id = (await create(a, roleAsset(over)).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const served = serveValidation(new FakeBroker());
    await validate(a, id).expect(200);
    await served;
    return id as string;
  };

  it('nombre, criticidad y etiquetas se cambian sin perder la conexión comprobada', async () => {
    const id = await validated();
    const res = await a.agent.patch(`/v1/assets/${id}`).send({ name: 'AWS producción', criticality: 'high', tags: ['core'] }).expect(200);
    expect(res.body.data).toMatchObject({ name: 'AWS producción', criticality: 'high', tags: ['core'], provisioning: { connection_status: 'validated' } });
  });

  it('cambiar las regiones devuelve la conexión a «pendiente» y se conserva el rol', async () => {
    const id = await validated();
    const res = await a.agent.patch(`/v1/assets/${id}`).send({ regions: ['us-west-2'] }).expect(200);
    expect(res.body.data.provisioning).toMatchObject({ regions: ['us-west-2'], connection_status: 'pending', is_active: false });
    expect(res.body.data.connection_setup.role_arn).toBe(ROLE_ARN);
  });

  it('cambiar de cuenta renueva el ExternalId y descarta el rol anterior', async () => {
    const id = await validated();
    const before = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.connection_setup.external_id;
    const res = await a.agent.patch(`/v1/assets/${id}`).send({ external_account_id: '210987654321' }).expect(200);
    expect(res.body.data.connection_setup.role_arn).toBeNull();
    expect(res.body.data.connection_setup.external_id).not.toBe(before);
    expect(res.body.data.provisioning.connection_status).toBe('pending');
  });

  it('cambiar el rol a otro de la misma cuenta es válido; uno de otra cuenta, no', async () => {
    const id = await validated();
    await a.agent.patch(`/v1/assets/${id}`).send({ role_arn: `arn:aws:iam::${ACCOUNT}:role/OtroRol` }).expect(200);
    const bad = await a.agent.patch(`/v1/assets/${id}`).send({ role_arn: 'arn:aws:iam::999999999999:role/MonkeyReadOnly' }).expect(422);
    expect(bad.body.error.fields[0]).toMatchObject({ field: 'role_arn', code: 'connection.account_mismatch' });
  });

  it('rechaza regiones fuera del catálogo y llaves en el canal de rol', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/assets/${id}`).send({ regions: ['mars-1'] }).expect(422)).body.error.fields[0].field).toBe('regions');
    await a.agent.patch(`/v1/assets/${id}`).send({ credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } }).expect(422);
  });

  it('en el canal de llaves se reemplazan las llaves y nunca se devuelven', async () => {
    const id = (await create(a, roleAsset({ connection_method: 'access_keys', credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } })).expect(201)).body.data.id;
    const res = await a.agent.patch(`/v1/assets/${id}`).send({ credentials: { access_key_id: 'AKIAIOSFODNN7NUEVAAA', secret_access_key: `${SECRET}-2` } }).expect(200);
    expect(JSON.stringify(res.body)).not.toMatch(/NUEVAAA|encrypted|secret_access/i);
    expect(res.body.data.provisioning.connection_status).toBe('pending');
  });

  it('no se edita ni se da de baja con una evaluación en curso', async () => {
    const id = await validated();
    await a.agent.post(`/v1/assets/${id}/executions`).expect(202);
    expect((await a.agent.patch(`/v1/assets/${id}`).send({ name: 'x' }).expect(409)).body.error.code).toBe('EXECUTION_IN_PROGRESS');
    expect((await a.agent.delete(`/v1/assets/${id}`).expect(409)).body.error.code).toBe('EXECUTION_IN_PROGRESS');
  });

  it('dar de baja: deja de listarse y de verse, pero el historial sigue en la base', async () => {
    const id = await validated();
    await a.agent.delete(`/v1/assets/${id}`).expect(200);
    await a.agent.get(`/v1/assets/${id}`).expect(404);
    const list = await a.agent.get('/v1/assets').query({ page_size: 100 }).expect(200);
    expect(JSON.stringify(list.body)).not.toContain(id);
    const [row] = await owner<{ status: string }>('select status from tenant.assets where id = $1', [id]);
    expect(row.status).toBe('inactive');
    await a.agent.delete(`/v1/assets/${id}`).expect(404);
  });

  it('un activo dado de baja no se puede operar (404 en todo) y sus llaves se borran', async () => {
    const id = (await create(a, roleAsset({ connection_method: 'access_keys', credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } })).expect(201)).body.data.id;
    const [before] = await owner<{ c: string | null }>('select encrypted_credentials as c from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(before.c).not.toBeNull();
    await a.agent.delete(`/v1/assets/${id}`).expect(200);
    const [after] = await owner<{ c: string | null }>('select encrypted_credentials as c from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(after.c).toBeNull();
    await validate(a, id).expect(404);
    await a.agent.post(`/v1/assets/${id}/activate`).expect(404);
    await a.agent.put(`/v1/assets/${id}/schedule`).send({ frequency: 'every_24h' }).expect(404);
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(404);
    await a.agent.patch(`/v1/assets/${id}`).send({ name: 'x' }).expect(404);
    await a.agent.post(`/v1/assets/${id}/executions`).expect(404);
    await a.agent.get(`/v1/assets/${id}/readiness`).expect(404);
  });

  it('la lista de servicios cuenta sus conexiones, y una conexión dada de baja deja de contar', async () => {
    const count = async () => {
      const list = (await a.agent.get('/v1/services').query({ page_size: 100 }).expect(200)).body.data.items as { id: string; technical_control: { connection_count: number } }[];
      return list.find((s) => s.id === a.serviceId)!.technical_control.connection_count;
    };
    const before = await count();
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    expect(await count()).toBe(before + 1);
    await a.agent.delete(`/v1/assets/${id}`).expect(200);
    expect(await count()).toBe(before);
  });

  it('una empresa ajena ve 404 al editar y al dar de baja', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await b.agent.patch(`/v1/assets/${id}`).send({ name: 'x' }).expect(404);
    await b.agent.delete(`/v1/assets/${id}`).expect(404);
  });
});

describe('Comprobar la conexión: validación REAL a través del trabajador', () => {
  it('flujo feliz: el cliente espera, el trabajador asume el rol, y la conexión queda validada y luego operativa', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const broker = new FakeBroker();
    const [res, served] = await Promise.all([validate(a, id), serveValidation(broker)]);
    expect(served).toBe('completed');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ connection_status: 'validated', probe_mode: 'runner', mode: 'live' });
    expect(res.body.data.last_validated_at).toEqual(expect.any(String));
    expect(res.body.data.checks_available).toBeGreaterThanOrEqual(3);
    // lo que el trabajador recibió: el rol, el ExternalId que Monkey generó y la cuenta; sin regiones obligatorias para validar
    expect(broker.jobs[0]).toMatchObject({ kind: 'validation', platform: 'aws', externalAccountId: ACCOUNT, connection: { method: 'readonly_role', roleArn: ROLE_ARN } });
    expect(broker.jobs[0].connection).toMatchObject({ externalId: expect.stringMatching(/^mk-/) });

    // «Automatizado ≠ Operativo»: con una comprobación real, activar SÍ lo deja operativo
    const act = await a.agent.post(`/v1/assets/${id}/activate`).expect(200);
    expect(act.body.data).toMatchObject({ operational_status: 'operational', provisioning: { connection_status: 'active', is_active: true } });
  });

  it('si el rol no se puede asumir: 422 con el campo role_arn y un texto que el cliente entiende', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const [res] = await Promise.all([validate(a, id), serveValidation(new FakeBroker(new RunnerFailure(FAILURE.roleNotFound)))]);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('CONNECTION_FAILED');
    expect(res.body.error.fields).toEqual([{ field: 'role_arn', code: 'connection.role_not_found', message: expect.stringMatching(/rol.*(exista|identificador)/i) }]);
    expect(JSON.stringify(res.body)).not.toMatch(/prowler|wazuh|AccessDenied/i);
    expect((await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.provisioning.connection_status).toBe('failed');
  });

  it('el cliente corrige el rol y vuelve a comprobar: no queda bloqueado por el intento fallido', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    await Promise.all([validate(a, id), serveValidation(new FakeBroker(new RunnerFailure(FAILURE.roleNotFound)))]);
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200); // vuelve a «pendiente»
    const [res] = await Promise.all([validate(a, id), serveValidation(new FakeBroker())]);
    expect(res.status).toBe(200);
    expect(res.body.data.connection_status).toBe('validated');
  });

  it('una cuenta distinta de la declarada se rechaza con su razón', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const [res] = await Promise.all([validate(a, id), serveValidation(new FakeBroker(new RunnerFailure(FAILURE.accountMismatch)))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'role_arn', code: 'connection.account_mismatch' });
  });

  it('sin el rol guardado, el trabajador dice «no configurado» y el cliente ve qué le falta', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    // el trabajador real, con credenciales que no deberían pedirse: el backend cierra la validación como fallida ANTES de entregarla
    const [res] = await Promise.all([validate(a, id), serveValidation(new FakeBroker(), 8)]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'role_arn', code: 'connection.not_configured' });
  });

  it('si nadie atiende (trabajador caído): 503 «no disponible», la validación se cancela y el activo NO queda bloqueado', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    const res = await validate(a, id);
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('CONNECTION_UNAVAILABLE');
    const [ex] = await owner<{ status: string }>(`select status from tenant.executions where asset_id = $1 and kind = 'validation' order by queued_at desc limit 1`, [id]);
    expect(ex.status).toBe('cancelled');
    // el estado de la conexión no cambió: no es culpa del cliente
    expect((await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.provisioning.connection_status).toBe('pending');
    const [again] = await Promise.all([validate(a, id), serveValidation(new FakeBroker())]);
    expect(again.status).toBe(200);
  });

  it('llaves de acceso: el trabajador las recibe, el cliente nunca las ve', async () => {
    const created = await create(a, roleAsset({ connection_method: 'access_keys', credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: SECRET } })).expect(201);
    const broker = new FakeBroker();
    const [res] = await Promise.all([validate(a, created.body.data.id), serveValidation(broker)]);
    expect(res.status).toBe(200);
    expect(broker.jobs[0].connection).toEqual({ method: 'access_keys', accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: SECRET });
    expect(JSON.stringify(res.body)).not.toContain(SECRET);
    const audit = await owner<{ s: string }>(`select (coalesce(before_state::text,'') || coalesce(after_state::text,'')) s from audit.audit_logs where tenant_id = $1`, [a.companyId]);
    expect(audit.some((r) => r.s.includes(SECRET))).toBe(false);
  });

  it('una empresa ajena no puede validar el activo (404) ni dejar una validación abierta', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await validate(b, id).expect(404);
    expect((await owner<{ n: number }>('select count(*)::int n from tenant.executions where asset_id = $1', [id]))[0].n).toBe(0);
  });

  it('las validaciones no aparecen en el historial de evaluaciones ni cuentan como una evaluación', async () => {
    const id = (await create(a, roleAsset()).expect(201)).body.data.id;
    await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
    await Promise.all([validate(a, id), serveValidation(new FakeBroker())]);
    expect((await a.agent.get(`/v1/assets/${id}/executions`).expect(200)).body.data.items).toEqual([]);
    expect((await a.agent.get(`/v1/assets/${id}/readiness`).expect(200)).body.data.readiness).toBe('not_measured');
  });

  // D67: lo que aún no tiene flujo se muestra bloqueado y no se puede registrar. Linux y Windows en servidores on-premise (ac_04) ya están abiertos (D113): se cubren en servidor-agente.e2e-spec.ts.
  it.each([
    ['ac_02', 'linux'],
    ['ac_03', 'postgresql'],
    ['ac_04', 'hp_ux'],
    ['ac_05', 'mysql_mariadb'],
    ['ac_06', 'macos'],
  ])('%s/%s está bloqueada: se muestra pero no se puede conectar, y no deja nada registrado', async (category, platform) => {
    const before = (await a.agent.get('/v1/assets').expect(200)).body.data.total as number;
    const res = await create(a, { name: `srv-${RUN}`, connection_category: category, connection_method: 'agent', platform, service_ids: [a.serviceId] }).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'platform', code: 'connection.provider_not_supported' })]));
    expect((await a.agent.get('/v1/assets').expect(200)).body.data.total).toBe(before);
  });
});
