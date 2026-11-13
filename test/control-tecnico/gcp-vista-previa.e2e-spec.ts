import type { INestApplication } from '@nestjs/common';
import { bootApp, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// DT-104: GCP sigue «Próximamente» en el catálogo; solo con PREVIEW_PLATFORMS (desarrollo) se puede declarar por la API.
let app: INestApplication | undefined;
let a: Tenant;
afterEach(async () => {
  await app?.close();
  app = undefined;
});

const body = (t: Tenant) => ({ name: `gcp-previa-${RUN}`, connection_category: 'ac_01', connection_method: 'identity_federation', platform: 'gcp', external_account_id: 'acme-prod-421905', service_ids: [t.serviceId] });

describe('PREVIEW_PLATFORMS', () => {
  it('sin la variable, GCP bloqueada: 422 connection.provider_not_supported', async () => {
    app = await bootApp({ PROBE_MODE: 'runner' });
    ({ a } = await dosEmpresas(app));
    const res = await a.agent.post('/v1/assets').send(body(a)).expect(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'platform', code: 'connection.provider_not_supported' });
  });

  it('en producción el servidor se niega a arrancar con la variable definida', async () => {
    await expect(bootApp({ PROBE_MODE: 'runner', NODE_ENV: 'production', PREVIEW_PLATFORMS: 'gcp' })).rejects.toThrow(/PREVIEW_PLATFORMS no está permitido en producción/);
  });
});
