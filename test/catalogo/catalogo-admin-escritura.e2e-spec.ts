import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Monkey Admin · la escritura del catálogo está en solo lectura (MD-491, contracts/catalogo-maestro.md «Admin en solo lectura»): el catálogo v2 solo lo cambia la carga.
// Cada ruta de escritura responde 409 CATALOG_READ_ONLY a admin_monkey; el rol y la sesión se siguen validando antes (403 y 401).
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

const ID = '00000000-0000-4000-8000-000000000000';
const WRITES: Array<[string, string]> = [
  ['post', '/v1/catalog/controls'],
  ['patch', `/v1/catalog/controls/${ID}`],
  ['delete', `/v1/catalog/controls/${ID}`],
  ['post', `/v1/catalog/controls/${ID}/evidence-templates`],
  ['delete', `/v1/catalog/controls/${ID}/evidence-templates/${ID}`],
  ['post', `/v1/catalog/controls/${ID}/tests`],
  ['delete', `/v1/catalog/controls/${ID}/tests/${ID}`],
  ['post', `/v1/catalog/controls/${ID}/points-of-focus`],
  ['delete', `/v1/catalog/controls/${ID}/points-of-focus/${ID}`],
  ['post', `/v1/catalog/controls/${ID}/dimensions`],
  ['delete', `/v1/catalog/controls/${ID}/dimensions/policy`],
  ['post', '/v1/catalog/risks'],
  ['patch', `/v1/catalog/risks/${ID}`],
  ['delete', `/v1/catalog/risks/${ID}`],
  ['post', `/v1/catalog/risks/${ID}/causes`],
  ['delete', `/v1/catalog/risks/${ID}/causes/${ID}`],
  ['post', '/v1/catalog/causes'],
  ['patch', `/v1/catalog/causes/${ID}`],
  ['delete', `/v1/catalog/causes/${ID}`],
  ['post', `/v1/catalog/causes/${ID}/controls`],
  ['delete', `/v1/catalog/causes/${ID}/controls/${ID}`],
  ['post', '/v1/catalog/evidence-templates'],
  ['patch', `/v1/catalog/evidence-templates/${ID}`],
  ['delete', `/v1/catalog/evidence-templates/${ID}`],
  ['post', '/v1/catalog/tests'],
  ['patch', `/v1/catalog/tests/${ID}`],
  ['delete', `/v1/catalog/tests/${ID}`],
];

describe('Escritura del catálogo en solo lectura', () => {
  it('solo admin_monkey llega al bloqueo: el administrador de una empresa recibe 403 y sin sesión, 401', async () => {
    for (const [verb, path] of WRITES) {
      await (a.agent as any)[verb](path).send({}).expect(403);
      await (request(app.getHttpServer()) as any)[verb](path).send({}).expect(401);
    }
  });

  it.each(WRITES)('%s %s responde 409 CATALOG_READ_ONLY, aunque el cuerpo no sea válido', async (verb, path) => {
    const res = await (monkey as any)[verb](path).send({}).expect(409);
    expect(res.body.error.code).toBe('CATALOG_READ_ONLY');
  });

  it('la lectura sigue abierta, también la ayuda para vincular (GET de puntos de enfoque)', async () => {
    const frameworks = (await monkey.get('/v1/catalog/frameworks').expect(200)).body.data.items as Array<{ id: string }>;
    await monkey.get(`/v1/catalog/frameworks/${frameworks[0].id}/points-of-focus`).expect(200);
  });
});
