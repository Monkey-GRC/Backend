import type { INestApplication } from '@nestjs/common';
import { bootApp, owner } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D67: el marketplace de plataformas. Lo que el cliente elige al conectar y las reglas del paso 3 salen de la base de datos (catálogo), no de constantes del
// código. Cada prueba sale por HTTP, como lo haría la pantalla.
let app: INestApplication;
let a: Tenant;

type Platform = { code: string; name: string; logo_key: string; availability: string; connection_methods: string[] };
type Capability = { catalog_code: string; category: string; platforms: Platform[] } & Record<string, unknown>;

const capabilities = async (): Promise<Capability[]> => (await a.agent.get('/v1/catalogs/automated-capabilities').expect(200)).body.data.items;
const names = (items: Capability[], code: string) => items.find((c) => c.catalog_code === code)?.platforms.map((p) => p.name);

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('El catálogo de conexiones trae las plataformas del comité', () => {
  it('cada conexión ofrece las plataformas de la hoja AC-01…AC-06, en su orden', async () => {
    const items = await capabilities();
    expect(items.map((c) => c.catalog_code)).toEqual(['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06']);
    expect(names(items, 'ac_01')).toEqual(['Amazon Web Services', 'Azure', 'GCP', 'Microsoft 365', 'Google Workspace']);
    expect(names(items, 'ac_02')).toEqual(['Linux', 'Windows', 'HP-UX', 'AIX', 'Solaris']);
    expect(names(items, 'ac_03')).toEqual(['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB']);
    expect(names(items, 'ac_05')).toEqual(['PostgreSQL', 'MySQL / MariaDB', 'SQL Server', 'Oracle', 'MongoDB']);
    expect(names(items, 'ac_06')).toEqual(['Windows', 'macOS', 'Linux']);
  });

  it('solo AWS, GCP y Linux y Windows en servidores on-premise están disponibles; el resto se muestra bloqueado', async () => {
    const all = (await capabilities()).flatMap((c) => c.platforms.map((p) => ({ cap: c.catalog_code, ...p })));
    expect(all.filter((p) => p.availability === 'available').map((p) => `${p.cap}/${p.code}`)).toEqual(['ac_01/aws', 'ac_01/gcp', 'ac_04/linux', 'ac_04/windows']);
    expect(all.filter((p) => p.availability === 'coming_soon').length).toBe(all.length - 4);
  });

  it('AWS se conecta con rol (el recomendado, primero) o con llaves; cada plataforma trae su logo', async () => {
    const aws = (await capabilities())[0].platforms[0];
    expect(aws).toEqual({ code: 'aws', name: 'Amazon Web Services', logo_key: 'aws', availability: 'available', connection_methods: ['readonly_role', 'access_keys'] });
    for (const p of (await capabilities()).flatMap((c) => c.platforms)) expect(p.logo_key).toMatch(/^[a-z0-9_]+$/);
  });

  it('nunca sale el proveedor del motor, ni en las plataformas ni en ninguna otra parte de la respuesta', async () => {
    const res = await a.agent.get('/v1/catalogs/automated-capabilities').expect(200);
    expect(JSON.stringify(res.body)).not.toMatch(/wazuh|prowler|"provider"/i);
  });

  it('las bases de datos y los servidores se eligen por motor y por sistema operativo, no por dónde viven', async () => {
    const text = (await capabilities()).flatMap((c) => c.platforms.map((p) => p.name)).join(' ');
    expect(text).not.toMatch(/EC2|RDS|Cloud SQL|Atlas|VPS|Azure VM/i);
  });
});

describe('Se ofrecen todas las conexiones del catálogo, sin que el cliente declare dónde vive (D92)', () => {
  const state = async () => (await a.agent.get(`/v1/services/${a.serviceId}/technical-control`).expect(200)).body.data;

  it('un servicio recién creado ya ofrece las seis conexiones, con sus plataformas listas para el marketplace', async () => {
    const data = await state();
    const capabilities = data.applicable_capabilities as Capability[];
    expect(capabilities.map((c) => c.catalog_code)).toEqual(['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06']);
    expect(capabilities[0].platforms.map((p) => p.code)).toEqual(['aws', 'azure', 'gcp', 'microsoft_365', 'google_workspace']);
    expect(capabilities[0]).not.toHaveProperty('supported_platforms');
  });

  it('la respuesta ya no habla de escenario', async () => {
    const data = await state();
    expect(data).not.toHaveProperty('deployment_scenario');
    expect(data).not.toHaveProperty('is_complete');
  });

  it('el endpoint para declararlo ya no existe', async () => {
    await a.agent.put(`/v1/services/${a.serviceId}/deployment-scenario`).send({ deployment_scenario: 'hybrid' }).expect(404);
  });
});

describe('Solo se escribe el catálogo desde Monkey Admin (SEG-06)', () => {
  it('una empresa no puede cambiar la disponibilidad de una plataforma', async () => {
    // El rol de la app, con la sesión de una empresa (no admin_monkey), no tiene política de escritura sobre el catálogo.
    const rows = await owner<{ n: number }>(
      `select count(*)::int n from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace s on s.oid = c.relnamespace
        where s.nspname = 'catalog' and c.relname = 'capability_platforms' and p.polname like 'catalog_%_admin'`,
    );
    expect(rows[0].n).toBe(3); // insert, update, delete: solo admin_monkey
  });
});
