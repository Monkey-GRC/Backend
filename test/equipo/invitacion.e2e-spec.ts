import { Logger } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { correo } from '../support/correo-en-memoria';
import { dosEmpresas, Tenant } from '../support/escenario';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';

// MD-190 · El código de activación sale por correo y solo por correo (SEG-75). Todo por HTTP real contra el Postgres desechable, con el rol de la app (sujeto a RLS).
type Agent = Awaited<ReturnType<typeof login>>;
const CODIGO = /MNK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/;
// Los términos que el hook de confidencialidad del Brain (.claude/hooks/post-edit-guard.sh) prohíbe en texto de cliente.
const PROHIBIDOS = /wazuh|prowler/i;
const email = (k: string) => `${k}-${RUN}@invitacion.test`;
const cuerpo = (m: { subject: string; text: string; html?: string }) => `${m.subject}\n${m.text}\n${m.html ?? ''}`;

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let lucia: { id: string; session: Agent };

const activo = (agent: Agent, body: { email: string } & Record<string, unknown>) => invitarYActivar(app, agent, { name: 'Persona', last_name: 'De Prueba', ...body });
const invite = (agent: Agent, body: object) => agent.post('/v1/users').send({ name: 'Persona', last_name: 'De Prueba', ...body });
const ultimo = (to: string) => correo.paraEl(to).at(-1)!;

// Todo lo que el servidor puede escribir en un log durante la prueba.
function capturarLogs(): { texto: () => string } {
  const lineas: string[] = [];
  for (const level of ['log', 'warn', 'error', 'debug', 'verbose', 'fatal'] as const) {
    jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => void lineas.push(args.map(String).join(' ')));
  }
  for (const level of ['log', 'warn', 'error', 'info', 'debug'] as const) {
    jest.spyOn(console, level).mockImplementation((...args: unknown[]) => void lineas.push(args.map(String).join(' ')));
  }
  return { texto: () => lineas.join('\n') };
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  lucia = await invitarYActivar(app, a.agent, { email: email('lucia'), name: 'Lucía', last_name: 'Gómez', role: 'admin_empresa' });
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => {
  jest.restoreAllMocks();
  correo.falla = false;
});

describe('El alta envía la invitación por correo', () => {
  it('el correo va a la persona con el código, su vencimiento, quién invitó, la empresa y el rol en lenguaje de negocio', async () => {
    const res = await invite(lucia.session as unknown as Agent, { email: email('aud1'), role: 'auditor' }).expect(201);
    expect(res.body.data.invitation).toEqual({ delivery_status: 'sent', expires_at: expect.any(String) });
    expect(correo.paraEl(email('aud1'))).toHaveLength(1);
    const m = ultimo(email('aud1'));
    expect(m.text).toMatch(CODIGO);
    expect(m.confidential).toBe(true);
    expect(m.text).toContain('Lucía Gómez');
    expect(m.text).toContain(a.companyName);
    expect(m.text).toContain('rol de auditor');
    expect(m.text).not.toContain('admin_empresa');
    expect(m.text).toContain('activ');
    const vence = new Date(res.body.data.invitation.expires_at);
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(m.text).toContain(`${pad(vence.getUTCDate())}/${pad(vence.getUTCMonth() + 1)}/${vence.getUTCFullYear()} ${pad(vence.getUTCHours())}:${pad(vence.getUTCMinutes())} UTC`);
    expect(m.html).toContain(m.text.match(CODIGO)![0]);
  });

  it('cada rol se nombra como el negocio lo dice', async () => {
    const r = await activo(a.agent, { email: email('rol-r'), role: 'responsable' });
    const equipo = await sembrarEquipo(a.companyId, r.id);
    await invite(a.agent, { email: email('rol-adm'), role: 'admin_empresa' }).expect(201);
    await invite(a.agent, { email: email('rol-res'), role: 'responsable' }).expect(201);
    await invite(a.agent, { email: email('rol-del'), role: 'delegado', group_id: equipo, is_internal: true }).expect(201);
    expect(ultimo(email('rol-adm')).text).toContain('rol de administrador');
    expect(ultimo(email('rol-res')).text).toContain('rol de responsable');
    expect(ultimo(email('rol-del')).text).toContain('rol de delegado');
    // Sin nombre, quien invita se identifica con su correo.
    expect(ultimo(email('rol-del')).text).toContain(a.email);
  });

  it('el texto no nombra al proveedor de la sonda ni del motor de nube', async () => {
    await invite(a.agent, { email: email('conf'), role: 'auditor' }).expect(201);
    expect(cuerpo(ultimo(email('conf')))).not.toMatch(PROHIBIDOS);
  });

  it('el código del correo se canjea de punta a punta: alta, correo, lookup y activación', async () => {
    await invite(a.agent, { email: email('e2e'), role: 'auditor' }).expect(201);
    const code = ultimo(email('e2e')).text.match(CODIGO)![0];
    const lookup = await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code }).expect(200);
    expect(lookup.body.data.email).toBe(email('e2e'));
    const session = request.agent(app.getHttpServer());
    const act = await session.post('/v1/auth/activate').send({ code, email: email('e2e'), password: PASSWORD }).expect(201);
    expect(act.body.data.user).toMatchObject({ email: email('e2e'), status: 'active' });
    await session.get('/v1/auth/me').expect(200);
    await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code }).expect(409); // de un solo uso
  });

  it('una cuenta pending no inicia sesión: 401 INVALID_CREDENTIALS', async () => {
    await invite(a.agent, { email: email('pend'), role: 'auditor' }).expect(201);
    const res = await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('pend'), password: PASSWORD }).expect(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('ni la respuesta, ni audit_logs, ni los logs llevan el código ni su huella', async () => {
    const logs = capturarLogs();
    const res = await invite(a.agent, { email: email('sec'), role: 'auditor' }).expect(201);
    const code = ultimo(email('sec')).text.match(CODIGO)![0];
    const [{ code_hash }] = await owner<{ code_hash: string }>('select code_hash from platform.user_activation_codes where user_id = $1', [res.body.data.id]);
    const respuesta = JSON.stringify(res.body);
    expect(respuesta).not.toMatch(CODIGO);
    expect(respuesta).not.toContain(code_hash);
    expect(respuesta).not.toContain('activation_code');
    const rastros = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and (before_state::text ~ 'MNK-' or after_state::text ~ 'MNK-' or before_state::text like $2 or after_state::text like $2)`, [a.companyId, `%${code_hash}%`]);
    expect(rastros[0].n).toBe(0);
    expect(logs.texto()).not.toContain(code);
    expect(logs.texto()).not.toContain(code_hash);
  });
});

describe('Si el correo falla', () => {
  it('la cuenta queda creada con delivery_status failed, sin el código en la respuesta ni en los logs, y el reenvío funciona', async () => {
    const logs = capturarLogs();
    correo.falla = true;
    const res = await invite(a.agent, { email: email('falla'), role: 'auditor' }).expect(201);
    correo.falla = false;
    expect(res.body.data).toMatchObject({ status: 'pending', invitation: { delivery_status: 'failed', expires_at: expect.any(String) } });
    expect(correo.paraEl(email('falla'))).toHaveLength(0);
    expect(await owner('select 1 from platform.users where email = $1', [email('falla')])).toHaveLength(1);
    const [{ code_hash }] = await owner<{ code_hash: string }>('select code_hash from platform.user_activation_codes where user_id = $1', [res.body.data.id]);
    expect(JSON.stringify(res.body)).not.toMatch(CODIGO);
    expect(logs.texto()).toContain('No se pudo enviar la invitación');
    expect(logs.texto()).not.toMatch(CODIGO);
    expect(logs.texto()).not.toContain(code_hash);
    expect(logs.texto()).not.toContain(email('falla'));

    const reenvio = await a.agent.post(`/v1/users/${res.body.data.id}/activation-code`).expect(200);
    expect(reenvio.body.data.invitation.delivery_status).toBe('sent');
    const session = request.agent(app.getHttpServer());
    await session.post('/v1/auth/activate').send({ code: ultimo(email('falla')).text.match(CODIGO)![0], email: email('falla'), password: PASSWORD }).expect(201);
  });

  it('si la reemisión falla responde failed y la cuenta sigue pendiente con un código nuevo guardado', async () => {
    const creada = (await invite(a.agent, { email: email('falla2'), role: 'auditor' }).expect(201)).body.data;
    correo.falla = true;
    const res = await a.agent.post(`/v1/users/${creada.id}/activation-code`).expect(200);
    correo.falla = false;
    expect(res.body.data.invitation.delivery_status).toBe('failed');
    expect(JSON.stringify(res.body)).not.toMatch(CODIGO);
    await a.agent.post(`/v1/users/${creada.id}/activation-code`).expect(200);
    expect(correo.paraEl(email('falla2'))).toHaveLength(2);
  });
});

describe('Reemisiones simultáneas', () => {
  it('dos reemisiones a la vez dejan UN solo código vigente; solo el del correo que quedó vigente canjea', async () => {
    const creada = (await invite(a.agent, { email: email('carrera'), role: 'auditor' }).expect(201)).body.data;
    const [r1, r2] = await Promise.all([a.agent.post(`/v1/users/${creada.id}/activation-code`), a.agent.post(`/v1/users/${creada.id}/activation-code`)]);
    expect([r1.status, r2.status]).toEqual([200, 200]);
    const vigentes = await owner<{ n: number }>("select count(*)::int n from platform.user_activation_codes where user_id = $1 and status = 'pending'", [creada.id]);
    expect(vigentes[0].n).toBe(1);
    const codigos = correo.paraEl(email('carrera')).map((m) => m.text.match(CODIGO)![0]);
    expect(codigos).toHaveLength(3); // el del alta y uno por reemisión
    const validos: string[] = [];
    for (const code of codigos) {
      const res = await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code });
      if (res.status === 200) validos.push(code);
    }
    expect(validos).toHaveLength(1);
    await request(app.getHttpServer()).post('/v1/auth/activate').send({ code: validos[0], email: email('carrera'), password: PASSWORD }).expect(201);
  });
});

describe('Reenviar la invitación', () => {
  it('responde 200 con solo la invitación, envía otro correo, revoca el código anterior y deja auditoría sin el código', async () => {
    const creada = (await invite(a.agent, { email: email('reen'), role: 'auditor' }).expect(201)).body.data;
    const viejo = ultimo(email('reen')).text.match(CODIGO)![0];
    const res = await a.agent.post(`/v1/users/${creada.id}/activation-code`).expect(200);
    expect(res.body.message).toBe('Listo, emitimos una invitación nueva. Revisa si el correo salió.');
    expect(res.body.data).toEqual({ invitation: { delivery_status: 'sent', expires_at: expect.any(String) } });
    expect(correo.paraEl(email('reen'))).toHaveLength(2);
    const nuevo = ultimo(email('reen')).text.match(CODIGO)![0];
    expect(nuevo).not.toBe(viejo);
    expect(JSON.stringify(res.body)).not.toMatch(CODIGO);
    expect(cuerpo(ultimo(email('reen')))).not.toMatch(PROHIBIDOS);
    await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code: viejo }).expect(404);
    await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code: nuevo }).expect(200);
    const rastros = await owner<{ n: number; con_codigo: number }>(
      `select count(*)::int n, count(*) filter (where after_state::text ~ 'MNK-' or before_state::text ~ 'MNK-')::int con_codigo from audit.audit_logs where tenant_id = $1 and action = 'user.activation_code_regenerate' and after_state->>'id' = $2`,
      [a.companyId, creada.id],
    );
    expect(rastros[0]).toEqual({ n: 1, con_codigo: 0 });
  });

  it('quién puede: solo admin_empresa; responsable, delegado, auditor y admin_monkey 403; cuenta activa 409; otra empresa 404', async () => {
    const creada = (await invite(a.agent, { email: email('mat'), role: 'auditor' }).expect(201)).body.data;
    const r = await activo(a.agent, { email: email('mat-r'), role: 'responsable' });
    const d = await activo(a.agent, { email: email('mat-d'), role: 'delegado', group_id: await sembrarEquipo(a.companyId, r.id), is_internal: true });
    const au = await activo(a.agent, { email: email('mat-a'), role: 'auditor' });
    const antes = correo.enviados.length;
    for (const agent of [r.session, d.session, au.session, monkey]) await (agent as unknown as Agent).post(`/v1/users/${creada.id}/activation-code`).expect(403);
    expect(correo.enviados.length).toBe(antes);
    await request(app.getHttpServer()).post(`/v1/users/${creada.id}/activation-code`).expect(401);
    expect((await a.agent.post(`/v1/users/${au.id}/activation-code`).expect(409)).body.error.code).toBe('USER_ALREADY_ACTIVE');
    await b.agent.post(`/v1/users/${creada.id}/activation-code`).expect(404);
    expect(correo.enviados.length).toBe(antes);
    await a.agent.post(`/v1/users/${creada.id}/activation-code`).expect(200);
  });
});
