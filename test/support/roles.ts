import type { INestApplication } from '@nestjs/common';
import { Agent, RUN } from './app';
import { invitarYActivar, sembrarEquipo } from './equipo';
import type { Tenant } from './escenario';

// MD-503 · Una persona de cada rol en la empresa `t`, creada como lo hace la API: el administrador invita y la persona activa su cuenta con el código del correo. El `delegado` entra en el equipo
// de un responsable (sembrado: crear el equipo ya no es del responsable). `admin_monkey` es el agente que registró la empresa.
export type Persona = { id: string; agent: Agent; email: string };
export type Roles = {
  admin_monkey: Agent;
  admin_empresa: Agent;
  responsable: Persona;
  delegado: Persona;
  auditor: Persona;
  colaborador: Persona;
  /** El equipo de delegados del responsable. */
  equipo: string;
};

let n = 0;
export const correoDe = (k: string): string => `${k}-${RUN}-${n++}@roles.test`;

export async function personaDe(app: INestApplication, t: Tenant, role: 'admin_empresa' | 'responsable' | 'auditor' | 'colaborador', tag: string = role): Promise<Persona> {
  const email = correoDe(tag);
  const r = await invitarYActivar(app, t.agent, { email, name: 'Persona', last_name: `de ${role}`, role });
  return { id: r.id, agent: r.session, email };
}

export async function delegadoDe(app: INestApplication, t: Tenant, equipo: string, tag = 'delegado'): Promise<Persona> {
  const email = correoDe(tag);
  const r = await invitarYActivar(app, t.agent, { email, name: 'Persona', last_name: 'de delegado', role: 'delegado', group_id: equipo, is_internal: true });
  return { id: r.id, agent: r.session, email };
}

export async function unaPersonaPorRol(app: INestApplication, t: Tenant, monkey: Agent): Promise<Roles> {
  const responsable = await personaDe(app, t, 'responsable');
  const equipo = await sembrarEquipo(t.companyId, responsable.id);
  return {
    admin_monkey: monkey,
    admin_empresa: t.agent,
    responsable,
    delegado: await delegadoDe(app, t, equipo),
    auditor: await personaDe(app, t, 'auditor'),
    colaborador: await personaDe(app, t, 'colaborador'),
    equipo,
  };
}
