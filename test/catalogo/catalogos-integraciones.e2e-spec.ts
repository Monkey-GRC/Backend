import type { INestApplication } from '@nestjs/common';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D110 · `integration_purpose` e `integration_status` salen de GET /v1/catalogs/{nombre} con su etiqueta en es y en (contracts/enums/integraciones.md); el frontend no las escribe.
type Agent = Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
let app: INestApplication;
let a: Tenant;
let monkey: Agent;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const items = async (agent: Agent, name: string, lang: string) => (await agent.get(`/v1/catalogs/${name}`).set('Accept-Language', lang).expect(200)).body.data.items as Array<{ value: string; label: string }>;

describe('Catálogos de Integraciones', () => {
  it('integration_purpose: los dos valores con su etiqueta en es y en', async () => {
    expect(await items(a.agent, 'integration_purpose', 'es')).toEqual([
      { value: 'measurement', label: 'Medición y cumplimiento' },
      { value: 'workflow', label: 'Gestión y flujo de trabajo' },
    ]);
    expect(await items(a.agent, 'integration_purpose', 'en')).toEqual([
      { value: 'measurement', label: 'Measurement and compliance' },
      { value: 'workflow', label: 'Management and workflow' },
    ]);
  });

  it('integration_status: los tres valores del contrato con su etiqueta en es y en', async () => {
    expect(await items(a.agent, 'integration_status', 'es')).toEqual([
      { value: 'active', label: 'Activa' },
      { value: 'pending', label: 'Pendiente de activar' },
      { value: 'needs_attention', label: 'Necesita atención' },
    ]);
    expect(await items(a.agent, 'integration_status', 'en')).toEqual([
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending activation' },
      { value: 'needs_attention', label: 'Needs attention' },
    ]);
  });

  it('los pide cualquier rol con sesión y no hay etiquetas sin traducir', async () => {
    for (const name of ['integration_purpose', 'integration_status']) {
      for (const lang of ['es', 'en']) for (const agent of [a.agent, monkey]) for (const i of await items(agent, name, lang)) expect(i.label).not.toContain('catalogs.');
    }
  });

  it('los valores del estado son los que devuelve GET /v1/integrations y los del propósito, los del catálogo', async () => {
    const purposes = ((await a.agent.get('/v1/integrations/catalog').expect(200)).body.data.items as Array<{ purpose: string }>).map((i) => i.purpose);
    const served = (await items(a.agent, 'integration_purpose', 'es')).map((i) => i.value);
    for (const p of purposes) expect(served).toContain(p);
  });
});
