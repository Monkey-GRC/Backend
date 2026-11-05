import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-157, D96 · El auditor entra por la API real y se reconoce (el rol sale de la base, no del token). La cuenta se crea como dueño para
// aislar esta prueba del módulo de equipo (`test/equipo/`), que es quien invita de verdad.
let app: INestApplication;
let a: Tenant;
let auditorA: Awaited<ReturnType<typeof login>>;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];

async function crearCuenta(companyId: string, email: string, role: 'auditor') {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
}

beforeAll(async () => {
  app = await bootApp();
  const escenario = await dosEmpresas(app);
  a = escenario.a;
  monkey = escenario.monkey;

  await crearCuenta(a.companyId, `auditor-${RUN}@roles.test`, 'auditor');
  auditorA = await login(app, `auditor-${RUN}@roles.test`);
});
afterAll(async () => {
  await app?.close();
});

describe('El auditor entra y se reconoce', () => {
  it('el auditor inicia sesión y su rol sale de la base', async () => {
    const res = await auditorA.get('/v1/auth/me').expect(200);
    expect(res.body.data.user.role).toBe('auditor');
  });

  it('el auditor pertenece a la empresa que audita', async () => {
    const rows = await owner<{ role: string; company_id: string }>(`select role::text, company_id from platform.users where email = $1`, [`auditor-${RUN}@roles.test`]);
    expect(rows).toEqual([{ role: 'auditor', company_id: a.companyId }]);
  });
});

describe('El auditor no pasa por rutas de Monkey Admin', () => {
  const nueva = () => ({ name: `Empresa roles ${RUN}`, requires_dedicated_database: false, max_users: 1000, admin_email: `x-${RUN}@roles.test`, framework_codes: ['soc2'] });

  it('el auditor no registra empresas', async () => {
    expect((await auditorA.post('/v1/companies').send(nueva())).status).toBe(403);
  });

  it('admin_monkey sí (control de la prueba)', async () => {
    expect((await monkey.get('/v1/companies')).status).toBe(200);
  });
});
