import type { INestApplication } from '@nestjs/common';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D114 · las opciones del asistente de conexión salen de GET /v1/catalogs/{nombre} con description, availability y tags (contracts/enums/onboarding/conexion-activos.md).
type Option = { value: string; label: string; description: string; availability: string; tags: string[] };
let app: INestApplication;
let a: Tenant;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const items = async (name: string, lang: string) => (await a.agent.get(`/v1/catalogs/${name}`).set('Accept-Language', lang).expect(200)).body.data.items as Option[];

describe('Catálogos de las opciones de conexión', () => {
  it('gcp_connection_scope: proyecto disponible, organización próximamente', async () => {
    const es = await items('gcp_connection_scope', 'es');
    expect(es.map((o) => [o.value, o.availability, o.tags])).toEqual([['project', 'available', []], ['organization', 'coming_soon', []]]);
    expect(es[0].label).toBe('Un proyecto');
    expect((await items('gcp_connection_scope', 'en'))[1].label).toBe('An organization');
  });

  it('gcp_setup_method: Cloud Shell disponible y recomendada, Terraform próximamente', async () => {
    const es = await items('gcp_setup_method', 'es');
    expect(es.map((o) => [o.value, o.availability, o.tags])).toEqual([['cloud_shell', 'available', ['recommended', 'fastest']], ['terraform', 'coming_soon', ['advanced']]]);
  });

  it('connection_method conserva value y label y suma description, availability y tags', async () => {
    const es = await items('connection_method', 'es');
    expect(es.map((o) => [o.value, o.tags])).toEqual([['readonly_role', ['recommended']], ['access_keys', ['less_secure']], ['agent', []], ['identity_federation', ['recommended']]]);
    expect(es[0].label).toBe('Rol de solo lectura (recomendado)');
  });

  it('todas traen descripción traducida, sin claves sueltas ni nombres del proveedor de la sonda o del motor', async () => {
    for (const name of ['connection_method', 'gcp_connection_scope', 'gcp_setup_method']) {
      for (const lang of ['es', 'en']) {
        for (const o of await items(name, lang)) {
          expect(o.description.length).toBeGreaterThan(10);
          expect(`${o.label} ${o.description}`).not.toMatch(/catalogs\.|wazuh|prowler/i);
        }
      }
    }
  });
});
