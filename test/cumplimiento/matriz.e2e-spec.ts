import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// La matriz de riesgo 5×5 con el nivel de cada casilla (contracts/modules/compliance-risks.md). Cada prueba sale por HTTP, con la sesión real de cada rol.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let responsable: Agent;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, 'responsable'::platform.user_role)`,
    [a.companyId, `responsable-mtz-${RUN}@cumplimiento.test`, await bcrypt.hash(PASSWORD, 4)],
  );
  responsable = await login(app, `responsable-mtz-${RUN}@cumplimiento.test`);
});
afterAll(async () => {
  await app?.close();
});

const matrix = async (agent: Agent) => (await agent.get('/v1/risk-matrix').expect(200)).body.data as { min: number; max: number; cells: Array<{ likelihood: number; impact: number; value: number; level: string }> };

describe('Matriz de riesgo con niveles', () => {
  it('el administrador de la empresa y el responsable reciben las 25 casillas con su valor y su nivel', async () => {
    const admin = await matrix(a.agent);
    expect(admin.min).toBe(1);
    expect(admin.max).toBe(5);
    expect(admin.cells).toHaveLength(25);
    expect(admin.cells[0]).toEqual({ likelihood: 1, impact: 1, value: 1, level: 'low' });
    expect(admin.cells.find((c) => c.likelihood === 5 && c.impact === 5)).toEqual({ likelihood: 5, impact: 5, value: 25, level: 'critical' });
    expect(await matrix(responsable)).toEqual(admin);
  });

  it('el nivel de una casilla es el que el servidor da a un riesgo evaluado en ella', async () => {
    const risks = (await a.agent.get(`/v1/services/${a.serviceId}/risks?page_size=1`).expect(200)).body.data.items as Array<{ id: string }>;
    const cells = (await matrix(a.agent)).cells;
    for (const [likelihood, impact] of [[2, 2], [3, 3], [4, 4], [5, 5]]) {
      const evaluated = (await a.agent.post(`/v1/risks/${risks[0].id}/evaluation`).send({ likelihood, impact }).expect(201)).body.data;
      expect(evaluated.inherent_risk_level).toBe(cells.find((c) => c.likelihood === likelihood && c.impact === impact)!.level);
    }
  });

  it('admin_monkey no entra al cumplimiento de una empresa: 403; sin sesión, 401', async () => {
    await monkey.get('/v1/risk-matrix').expect(403);
    await request(app.getHttpServer()).get('/v1/risk-matrix').expect(401);
  });
});
