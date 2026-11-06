import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner, PASSWORD, RUN } from '../support/app';
import { claveEnviadaA } from '../support/correo-en-memoria';
import { conPg as pg, esperarBloqueados } from '../support/bloqueos';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-191 · Orden de bloqueo (infrastructure/database/row-locks.ts): la activación toma la fila del usuario ANTES que su código, como la reemisión. Va en su propio archivo porque
// las activaciones fallidas comparten un freno de 10 por dirección (DT-37) y la prueba de la carrera provoca varias a propósito.
let app: INestApplication;
let a: Tenant;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@activacion-carrera.test`;
const fila = (id: string) => owner<{ status: string }>('select status::text from platform.users where id = $1', [id]).then((r) => r[0]);

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('Activar contra reemitir el código de la misma cuenta (orden: usuario antes que código)', () => {
  const invitar = async () => {
    const correo = email('act');
    const id = (await a.agent.post('/v1/users').send({ email: correo, name: 'P', last_name: 'P', role: 'auditor' }).expect(201)).body.data.id as string;
    return { correo, id, code: claveEnviadaA(correo) };
  };
  const activar = (x: { correo: string; code: string }) => request(app.getHttpServer()).post('/v1/auth/activate').send({ code: x.code, email: x.correo, password: PASSWORD });

  it('determinista: la activación espera la fila del usuario; si mientras tanto se revoca el código, no activa a nadie', async () => {
    const x = await invitar();
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [x.id]); // la reemisión, a medias
      const activando = activar(x).then((r) => r);
      expect(await esperarBloqueados(pid, 1, [activando])).toBe(0);
      await c.query(`update platform.user_activation_codes set status = 'revoked' where user_id = $1 and status = 'pending'`, [x.id]);
      await c.query('commit');
      const res = await activando;
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
    expect((await fila(x.id)).status).toBe('pending');
  });

  it('8 rondas: reemitir y activar a la vez; o activa (y reemitir da 409) o reemite (y el código viejo no sirve); sin 500 ni deadlock', async () => {
    for (let i = 0; i < 8; i++) {
      const x = await invitar();
      const [act, re] = await Promise.all([activar(x), a.agent.post(`/v1/users/${x.id}/activation-code`).send()]);
      if (act.status === 201) expect([re.status, re.body.error?.code]).toEqual([409, 'USER_ALREADY_ACTIVE']);
      else {
        expect(act.status).toBeLessThan(500);
        expect(re.status).toBe(200);
      }
    }
  });
});

