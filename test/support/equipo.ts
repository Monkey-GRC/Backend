import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, owner, PASSWORD } from './app';
import { claveEnviadaA } from './correo-en-memoria';

// MD-190 · Ninguna respuesta lleva el código de activación (SEG-75): sale solo por el correo de invitación. La prueba lo lee del correo capturado, como lo haría la persona.

export type Invitada = { id: string; session: Agent; data: any };

/** Crea la cuenta con `body`, toma el código del correo de invitación, la activa y devuelve su sesión. */
export async function invitarYActivar(app: INestApplication, admin: Agent, body: { email: string } & Record<string, unknown>): Promise<Invitada> {
  const data = (await admin.post('/v1/users').send(body).expect(201)).body.data;
  const code = claveEnviadaA(body.email);
  const session = request.agent(app.getHttpServer());
  await session.post('/v1/auth/activate').send({ code, email: body.email, password: PASSWORD }).expect(201);
  return { id: data.id, session, data };
}

/**
 * Siembra en la base el equipo de delegados de un responsable (D104: no nace con la cuenta; la API lo crea con `POST /v1/groups`, pero sembrarlo es más corto en las pruebas que no hablan de ello).
 * Devuelve el id del grupo.
 */
export async function sembrarEquipo(companyId: string, responsableId: string, name = `Equipo ${responsableId}`): Promise<string> {
  const [g] = await owner<{ id: string }>("insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, $2, 'team', $3) returning id", [companyId, name, responsableId]);
  return g.id;
}
