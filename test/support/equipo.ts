import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, owner, PASSWORD } from './app';

// MD-188 · El alta ya no devuelve el código de activación (SEG-75). Mientras el correo de invitación no exista (MD-190), la prueba obtiene un código con el reenvío
// (`POST /v1/users/{id}/activation-code`), que sí lo devuelve.

export type Invitada = { id: string; session: Agent; data: any };

/** Crea la cuenta con `body`, pide un código con el reenvío, la activa y devuelve su sesión. */
export async function invitarYActivar(app: INestApplication, admin: Agent, body: { email: string } & Record<string, unknown>): Promise<Invitada> {
  const data = (await admin.post('/v1/users').send(body).expect(201)).body.data;
  const code = (await admin.post(`/v1/users/${data.id}/activation-code`).expect(201)).body.data.activation_code.code;
  const session = request.agent(app.getHttpServer());
  await session.post('/v1/auth/activate').send({ code, email: body.email, password: PASSWORD }).expect(201);
  return { id: data.id, session, data };
}

/**
 * Siembra en la base el equipo de delegados de un responsable (D104: no nace con la cuenta; crearlo por la API es MD-189, `POST /v1/groups`).
 * Devuelve el id del grupo.
 */
export async function sembrarEquipo(companyId: string, responsableId: string, name = `Equipo ${responsableId}`): Promise<string> {
  const [g] = await owner<{ id: string }>('insert into platform.user_groups (id, company_id, name, leader_id) values (gen_random_uuid(), $1, $2, $3) returning id', [companyId, name, responsableId]);
  return g.id;
}
