import type { INestApplication } from '@nestjs/common';
import { bootApp, owner, RUN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';

// Un activo sin aprovisionamiento (datos de demostración o a medias) no puede tumbar la lista de activos: se omite y su detalle es 404, nunca un 500.
let app: INestApplication;
let a: Tenant;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('Activos sin aprovisionamiento', () => {
  it('la lista responde 200 y los omite; su detalle es 404', async () => {
    const res = await a.agent.post('/v1/assets').send(awsBody(a, `aws-sin-aprov-${RUN}`));
    expect(res.status).toBe(201);
    const id = res.body.data.id as string;
    const before = (await a.agent.get('/v1/assets').expect(200)).body.data;
    expect(before.items.some((x: { id: string }) => x.id === id)).toBe(true);

    await owner('delete from tenant.asset_provisionings where asset_id = $1', [id]);

    const after = (await a.agent.get('/v1/assets').expect(200)).body.data;
    expect(after.items.some((x: { id: string }) => x.id === id)).toBe(false);
    expect(after.total).toBe(before.total - 1);
    await a.agent.get(`/v1/assets/${id}`).expect(404);
  });
});