import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, login, owner, RUN, seedAdminMonkey } from '../support/app';
import { connect } from '../support/db';
import { empresaConCupo } from '../support/escenario';
import { invitarYActivar } from '../support/equipo';

// D103 · SEG-72 · El cupo de usuarios se hace cumplir en el servidor: no se crea ni se reactiva a nadie por encima de companies.max_users, aunque las peticiones
// lleguen a la vez. Cuentan active, pending y suspended de CUALQUIER rol; inactive no (desactivar libera el cupo). Todo por HTTP real, con el rol de la app (RLS).
let app: INestApplication;
let monkey: Agent;
const correo = (k: string) => `${k}-${RUN}@cupo-equipo.test`;
const invitar = (admin: Agent, k: string, role: 'responsable' | 'auditor' | 'admin_empresa' = 'auditor') =>
  admin.post('/v1/users').send({ email: correo(k), name: 'Persona', last_name: 'De Prueba', role });
const contadas = (companyId: string) =>
  owner<{ n: number }>(`select count(*)::int n from platform.users where company_id = $1 and status in ('active', 'pending', 'suspended')`, [companyId]).then((r) => r[0].n);
const fijarCupo = (companyId: string, max: number) => monkey.patch(`/v1/companies/${companyId}/max-users`).send({ max_users: max }).expect(200);
const cambiar = (admin: Agent, id: string, body: object) => admin.patch(`/v1/users/${id}`).send(body);

/** Invita, activa la cuenta con un código y devuelve su id (ya `active`, así que se puede desactivar). */
async function activa(admin: Agent, k: string, role: 'auditor' | 'responsable' = 'auditor'): Promise<string> {
  return (await invitarYActivar(app, admin, { email: correo(k), name: 'Persona', last_name: 'De Prueba', role })).id;
}

beforeAll(async () => {
  app = await bootApp();
  monkey = await login(app, (await seedAdminMonkey()).email);
});
afterAll(async () => {
  await app?.close();
});

describe('Crear a alguien con el cupo lleno', () => {
  it('la N+1 es 409 USER_LIMIT_REACHED con los dos números, y no deja cuenta, ni código, ni rastro; las cuentas pendientes y de cualquier rol cuentan', async () => {
    const e = await empresaConCupo(app, monkey, 'Lleno', 3); // el administrador ya es 1
    await invitar(e.agent, 'lleno-a', 'auditor').expect(201); // pending: cuenta
    await invitar(e.agent, 'lleno-b', 'responsable').expect(201);
    expect(await contadas(e.companyId)).toBe(3);
    const rastros = () => owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'user.create'`, [e.companyId]).then((r) => r[0].n);
    const antes = await rastros();

    const res = await invitar(e.agent, 'lleno-c', 'responsable').expect(409);
    expect(res.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 3, users_count: 3 });
    expect(await owner('select 1 from platform.users where email = $1', [correo('lleno-c')])).toHaveLength(0);
    expect(await owner('select 1 from platform.user_activation_codes c join platform.users u on u.id = c.user_id where u.email = $1', [correo('lleno-c')])).toHaveLength(0);
    expect(await rastros()).toBe(antes); // se revirtió todo: tampoco hay auditoría de una cuenta que no existe
    expect(await contadas(e.companyId)).toBe(3);
  });

  it('sin cupo fijado (NULL, como las empresas anteriores al cupo) no hay tope', async () => {
    const e = await empresaConCupo(app, monkey, 'Libre', null);
    for (const k of ['libre-1', 'libre-2', 'libre-3', 'libre-4', 'libre-5']) await invitar(e.agent, k).expect(201);
    expect(await contadas(e.companyId)).toBe(6);
  });

  it('cuando admin_monkey sube el cupo, el lugar se abre de inmediato', async () => {
    const e = await empresaConCupo(app, monkey, 'Sube', 2);
    await invitar(e.agent, 'sube-a').expect(201);
    await invitar(e.agent, 'sube-b').expect(409);
    await fijarCupo(e.companyId, 3);
    await invitar(e.agent, 'sube-b').expect(201);
    await invitar(e.agent, 'sube-c').expect(409);
  });
});

describe('Desactivar, reactivar y corregir con el cupo lleno', () => {
  it('desactivar libera un lugar; reactivar con el cupo lleno es 409 y con espacio funciona; corregir un nombre y pasar de suspended a active no se bloquean', async () => {
    const e = await empresaConCupo(app, monkey, 'Ciclo', 3);
    const a = await activa(e.agent, 'ciclo-a');
    const b = await activa(e.agent, 'ciclo-b'); // administrador + a + b = 3: lleno

    await cambiar(e.agent, a, { status: 'inactive' }).expect(200); // libera
    expect(await contadas(e.companyId)).toBe(2);
    await invitar(e.agent, 'ciclo-c').expect(201); // ocupa el lugar liberado: otra vez lleno

    const reactivar = await cambiar(e.agent, a, { status: 'active' }).expect(409);
    expect(reactivar.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 3, users_count: 3 });
    expect((await owner<{ status: string }>('select status::text from platform.users where id = $1', [a]))[0].status).toBe('inactive');

    await cambiar(e.agent, b, { name: 'Nombre corregido' }).expect(200); // editar no se bloquea con el cupo lleno
    await owner(`update platform.users set status = 'suspended' where id = $1`, [b]);
    await cambiar(e.agent, b, { status: 'active' }).expect(200); // suspended ya contaba: no suma

    await fijarCupo(e.companyId, 4);
    await cambiar(e.agent, a, { status: 'active' }).expect(200); // con espacio, reactiva
    expect(await contadas(e.companyId)).toBe(4);
  });
});

describe('Dos peticiones a la vez (SEG-72)', () => {
  it('con un solo lugar libre, de varias altas simultáneas entra exactamente una; se repite subiendo el cupo de a uno', async () => {
    const e = await empresaConCupo(app, monkey, 'Carrera', 2); // administrador + 1 lugar
    for (let ronda = 1; ronda <= 3; ronda++) {
      const cupo = ronda + 1;
      if (ronda > 1) await fijarCupo(e.companyId, cupo);
      const resultados = await Promise.all([1, 2, 3, 4].map((i) => invitar(e.agent, `carrera-${ronda}-${i}`)));
      const estados = resultados.map((r) => r.status).sort();
      expect({ ronda, estados }).toEqual({ ronda, estados: [201, 409, 409, 409] });
      expect(resultados.find((r) => r.status === 409)!.body.error.code).toBe('USER_LIMIT_REACHED');
      expect(await contadas(e.companyId)).toBe(cupo); // nunca por encima del cupo
    }
  });

  it('dos reactivaciones simultáneas con un solo lugar: una entra y la otra es 409', async () => {
    const e = await empresaConCupo(app, monkey, 'Reactiva', 3);
    const a = await activa(e.agent, 'reactiva-a');
    const b = await activa(e.agent, 'reactiva-b');
    await cambiar(e.agent, a, { status: 'inactive' }).expect(200);
    await cambiar(e.agent, b, { status: 'inactive' }).expect(200);
    await fijarCupo(e.companyId, 2); // el administrador cuenta 1: queda un lugar
    const estados = (await Promise.all([a, b].map((id) => cambiar(e.agent, id, { status: 'active' })))).map((r) => r.status).sort();
    expect(estados).toEqual([200, 409]);
    expect(await contadas(e.companyId)).toBe(2);
  });

  it('dos reactivaciones simultáneas de LA MISMA persona con el cupo justo: ambas 200 (la segunda ya la encuentra activa) y cuenta una sola vez', async () => {
    const e = await empresaConCupo(app, monkey, 'Misma', 3);
    const a = await activa(e.agent, 'misma-a');
    await cambiar(e.agent, a, { status: 'inactive' }).expect(200);
    await fijarCupo(e.companyId, 2); // un solo lugar libre y dos peticiones por la misma cuenta
    const estados = (await Promise.all([1, 2].map(() => cambiar(e.agent, a, { status: 'active' })))).map((r) => r.status);
    expect(estados).toEqual([200, 200]); // sin el turno tomado antes de leer el estado, la segunda daría un 409 que no merece
    expect(await contadas(e.companyId)).toBe(2);
    expect((await owner<{ status: string }>('select status::text from platform.users where id = $1', [a]))[0].status).toBe('active');
  });

  it('bajar el cupo y un alta a la vez hacen cola por el mismo bloqueo de la empresa, y nunca entran las dos cosas', async () => {
    const resultados = new Set<string>();
    for (let ronda = 1; ronda <= 6; ronda++) {
      const e = await empresaConCupo(app, monkey, `Baja${ronda}`, 3);
      await invitar(e.agent, `baja-${ronda}-a`).expect(201); // administrador + a = 2 cuentas, un lugar libre

      // Se retiene la fila de la empresa desde fuera: si las dos peticiones la piden (FOR UPDATE), ambas quedan ESPERANDO. Sin ese bloqueo no esperarían a nadie
      // y esta prueba fallaría (en una carrera «a ojo» el alta tarda más que el PATCH y nunca se solapan, así que no probaría nada).
      const retiene = await connect();
      const observa = await connect();
      try {
        await retiene.query('begin');
        await retiene.query('select 1 from platform.companies where id = $1 for update', [e.companyId]);
        let terminadas = 0;
        const contar = <T,>(p: Promise<T>) => p.finally(() => terminadas++);
        const pBajar = contar(Promise.resolve(monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 2 })));
        const pAlta = contar(Promise.resolve(invitar(e.agent, `baja-${ronda}-b`)));

        let esperando = 0;
        for (let intento = 0; intento < 100 && esperando < 2; intento++) {
          await new Promise((r) => setTimeout(r, 50));
          esperando = (await observa.query(`select count(*)::int n from pg_stat_activity where wait_event_type = 'Lock' and query ilike '%from platform.companies%for update%'`)).rows[0].n;
        }
        expect({ ronda, esperando }).toEqual({ ronda, esperando: 2 }); // las dos están en cola por la fila de la empresa
        expect(terminadas).toBe(0); // y ninguna respondió mientras otro tenía el turno

        await retiene.query('commit');
        const [bajar, alta] = await Promise.all([pBajar, pAlta]);
        const par = `cupo ${bajar.status} / alta ${alta.status}`;
        resultados.add(par);
        // O el cupo baja a 2 y el alta no cabe, o el alta entra y bajar a 2 ya no es posible (habría 3 cuentas): jamás las dos.
        expect(['cupo 200 / alta 409', 'cupo 409 / alta 201']).toContain(par);
        if (alta.status === 409) expect(alta.body.error.code).toBe('USER_LIMIT_REACHED');
        if (bajar.status === 409) expect(bajar.body.error).toMatchObject({ code: 'MAX_USERS_BELOW_CURRENT', max_users: 2, users_count: 3 });
        const cupo = (await owner<{ m: number }>('select max_users m from platform.companies where id = $1', [e.companyId]))[0].m;
        expect(await contadas(e.companyId)).toBeLessThanOrEqual(cupo);
      } finally {
        await retiene.query('rollback').catch(() => undefined);
        await retiene.end();
        await observa.end();
      }
    }
    expect(resultados.size).toBeGreaterThan(0);
  });
});
