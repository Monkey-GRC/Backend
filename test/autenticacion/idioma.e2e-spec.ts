import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { correo } from '../support/correo-en-memoria';
import { dosEmpresas, Tenant } from '../support/escenario';

// D111 · Cada persona guarda su idioma (`PATCH /v1/auth/me/language`); con él salen sus correos. La invitación y la clave de acceso salen en el idioma de quien las envía.
let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let n = 0;
const http = () => request(app.getHttpServer());
const me = async (agent: Agent) => (await agent.get('/v1/auth/me').expect(200)).body.data.user;
const language = (agent: Agent, value: unknown) => agent.patch('/v1/auth/me/language').send({ language: value });
const lastSubject = (email: string) => correo.paraEl(email).slice(-1)[0]?.subject;

beforeAll(async () => {
  app = await bootApp({ PLATFORM_APP_URL: 'http://platform.test' });
  ({ a, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('PATCH /v1/auth/me/language', () => {
  it('la cuenta nace en español y el idioma viaja en /auth/me', async () => {
    expect((await me(a.agent)).preferred_language).toBe('es');
  });

  it('204, se guarda y lo devuelven /auth/me y el login', async () => {
    await language(a.agent, 'en').expect(204);
    expect((await me(a.agent)).preferred_language).toBe('en');
    const fresh = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    expect(fresh.status).toBe(200);
    expect(fresh.body.data.user.preferred_language).toBe('en');
    await language(a.agent, 'es').expect(204);
    expect((await me(a.agent)).preferred_language).toBe('es');
  });

  it('deja rastro (user.language_changed) con el idioma de antes y el de después, en la misma transacción', async () => {
    await language(a.agent, 'en').expect(204);
    const rows = await owner<{ before_state: any; after_state: any; tenant_id: string; resource: string }>(
      `select before_state, after_state, tenant_id, resource from audit.audit_logs where action = 'user.language_changed' and tenant_id = $1 order by created_at desc limit 1`,
      [a.companyId],
    );
    expect(rows[0]).toMatchObject({ resource: 'user', before_state: { preferred_language: 'es' }, after_state: { preferred_language: 'en' } });
    await language(a.agent, 'es').expect(204);
  });

  it('cualquier rol con sesión puede cambiarlo, también admin_monkey', async () => {
    await language(monkey, 'en').expect(204);
    expect((await me(monkey)).preferred_language).toBe('en');
    await language(monkey, 'es').expect(204);
  });

  it('sin sesión es 401', async () => {
    await http().patch('/v1/auth/me/language').send({ language: 'en' }).expect(401);
  });

  it.each([['fr'], [''], [null], [undefined]])('un valor inválido (%p) es 422 enum.invalid y no cambia nada', async (value) => {
    const res = await language(a.agent, value).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'language', code: 'enum.invalid' })]));
    expect((await me(a.agent)).preferred_language).toBe('es');
  });

  it('un campo de más se rechaza', async () => {
    await a.agent.patch('/v1/auth/me/language').send({ language: 'en', role: 'admin_monkey' }).expect(422);
  });
});

describe('los correos salen en el idioma de la persona', () => {
  it('recuperar la contraseña: en inglés para quien guardó en, en español para quien guardó es', async () => {
    await language(a.agent, 'en').expect(204);
    await http().post('/v1/auth/password/forgot').send({ email: a.email }).expect(202);
    await new Promise((r) => setTimeout(r, 300));
    const sent = correo.paraEl(a.email).slice(-1)[0];
    expect(sent.subject).toBe('Create your new Monkey password');
    expect(sent.html).toContain('<html lang="en">');
    expect(sent.text).toContain('expires in 30 minutes');

    await language(a.agent, 'es').expect(204);
    await http().post('/v1/auth/password/forgot').send({ email: a.email }).expect(202);
    await new Promise((r) => setTimeout(r, 300));
    expect(lastSubject(a.email)).toBe('Crea tu contraseña nueva de Monkey');
  });

  it('la invitación sale en el idioma de quien invita y la cuenta nace con ese idioma', async () => {
    const send = async (lang: string) => {
      const email = `inv-${lang}-${RUN}-${n++}@idioma.test`;
      await a.agent.post('/v1/users').set('Accept-Language', lang).send({ email, name: 'P', last_name: 'P', role: 'responsable' }).expect(201);
      const [row] = await owner<{ preferred_language: string }>('select preferred_language::text from platform.users where email = $1', [email]);
      return { subject: lastSubject(email), text: correo.paraEl(email).slice(-1)[0].text, stored: row.preferred_language };
    };
    const en = await send('en');
    expect(en.subject).toMatch(/invited you to Monkey$/);
    expect(en.text).toContain('with the role of responsible');
    expect(en.stored).toBe('en');
    const es = await send('es');
    expect(es.subject).toMatch(/te invitó a Monkey$/);
    expect(es.stored).toBe('es');
    expect((await send('fr')).stored).toBe('es');
  });

  it('la clave de acceso de una empresa nueva sale en el idioma de quien la registra', async () => {
    const register = async (lang: string) => {
      const email = `admin-${lang}-${RUN}-${n++}@idioma.test`;
      await monkey.post('/v1/companies').set('Accept-Language', lang).send({ name: `Idioma ${lang} ${RUN} ${n}`, requires_dedicated_database: false, max_users: 5, admin_email: email, framework_codes: ['soc2'] }).expect(201);
      return correo.paraEl(email).slice(-1)[0];
    };
    const en = await register('en');
    expect(en.subject).toBe('Your Monkey access key');
    expect(en.text).toMatch(/It expires on [A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} UTC/);
    expect((await register('es')).subject).toBe('Tu clave de acceso a Monkey');
  });

  it('sesión nueva (login) y agente fresco leen el mismo idioma', async () => {
    await language(a.agent, 'en').expect(204);
    expect((await me(await login(app, a.email))).preferred_language).toBe('en');
    await language(a.agent, 'es').expect(204);
  });
});
