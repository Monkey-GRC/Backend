import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-157 · Los roles consultor y auditor entran por la API real y se reconocen (el rol sale de la base, no del token). Cada cuenta se crea como
// dueño porque todavía no hay pantalla ni endpoint para crearlas (invitar usuarios es MD-131; crear consultores, MD-159).
let app: INestApplication;
let a: Tenant;
let monkeyCompanyId: string;
let auditorA: Awaited<ReturnType<typeof login>>;
let consultor: Awaited<ReturnType<typeof login>>;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];

async function crearCuenta(companyId: string, email: string, role: 'auditor' | 'consultor') {
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
  monkeyCompanyId = (await monkey.get('/v1/auth/me').expect(200)).body.data.company.id;

  await crearCuenta(a.companyId, `auditor-${RUN}@roles.test`, 'auditor');
  // El consultor es de Next: su cuenta vive en la empresa interna de Monkey, no en la que atiende (D64).
  await crearCuenta(monkeyCompanyId, `consultor-${RUN}@roles.test`, 'consultor');
  auditorA = await login(app, `auditor-${RUN}@roles.test`);
  consultor = await login(app, `consultor-${RUN}@roles.test`);
});
afterAll(async () => {
  await app?.close();
});

describe('Los roles nuevos entran y se reconocen', () => {
  it('el auditor inicia sesión y su rol sale de la base', async () => {
    const res = await auditorA.get('/v1/auth/me').expect(200);
    expect(res.body.data.user.role).toBe('auditor');
  });

  it('el consultor inicia sesión con su propia cuenta y su rol es consultor', async () => {
    const res = await consultor.get('/v1/auth/me').expect(200);
    expect(res.body.data.user.role).toBe('consultor');
  });

  it('el auditor pertenece a la empresa que audita; el consultor, a la interna de Monkey (no a la que atiende)', async () => {
    const rows = await owner<{ role: string; company_id: string }>(`select role::text, company_id from platform.users where email in ($1, $2) order by role`, [
      `auditor-${RUN}@roles.test`,
      `consultor-${RUN}@roles.test`,
    ]);
    expect(rows).toEqual([
      { role: 'auditor', company_id: a.companyId },
      { role: 'consultor', company_id: monkeyCompanyId },
    ]);
    expect(monkeyCompanyId).not.toBe(a.companyId);
  });
});

describe('Los roles nuevos no pasan por rutas de Monkey Admin', () => {
  const nueva = () => ({ name: `Empresa roles ${RUN}`, requires_dedicated_database: false, admin_email: `x-${RUN}@roles.test`, framework_codes: ['soc2'] });

  it('el auditor no registra empresas', async () => {
    expect((await auditorA.post('/v1/companies').send(nueva())).status).toBe(403);
  });

  it('el consultor no registra empresas', async () => {
    expect((await consultor.post('/v1/companies').send(nueva())).status).toBe(403);
  });

  it('admin_monkey sí (control de la prueba)', async () => {
    expect((await monkey.get('/v1/companies')).status).toBe(200);
  });
});
