import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { generateAccessKeyCode, normalizeAccessKeyCode } from '../../src/common/security/access-key-code';
import { TokenHasher } from '../../src/common/security/token-hasher';
import { unusablePasswordHash } from '../../src/common/security/unusable-password-hash';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D95, D96 · Una cuenta que crea el administrador de la empresa (responsable o auditor) nace `pending` y se activa con un código de un solo uso. Todo por HTTP real contra el
// Postgres desechable, con el rol de la app (sujeto a RLS). Quien crea la cuenta y emite el código es el módulo de equipo (`users-team.md`, sin construir): aquí se deja
// la cuenta y el código directamente en la base, que es justo lo que ese módulo hará. Contrato: contracts/modules/users-team.md y auth.md.
const PEPPER = 'pepper-de-la-prueba-0123456789abcdef0123456789';

describe('Activar una cuenta con el código que entrega el administrador', () => {
  let app: INestApplication;
  let a: Tenant;

  // La cuenta pendiente y su código, tal como los dejará el módulo de equipo.
  async function pendiente(email: string, opts: { expiraEn?: string; estadoCodigo?: string } = {}): Promise<{ userId: string; code: string }> {
    const [admin] = await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]);
    const [user] = await owner<{ id: string }>(
      `insert into platform.users (id, company_id, email, password_hash, role, status) values (gen_random_uuid(), $1, $2, $3, 'responsable', 'pending') returning id`,
      [a.companyId, email, await unusablePasswordHash()],
    );
    const code = generateAccessKeyCode();
    await owner(
      `insert into platform.user_activation_codes (id, company_id, user_id, created_by, code_hash, status, expires_at)
       values (gen_random_uuid(), $1, $2, $3, $4, $5::platform.access_key_status, now() + $6::interval)`,
      [a.companyId, user.id, admin.id, app.get(TokenHasher, { strict: false }).hash(normalizeAccessKeyCode(code)), opts.estadoCodigo ?? 'pending', opts.expiraEn ?? '7 days'],
    );
    return { userId: user.id, code };
  }

  beforeAll(async () => {
    app = await bootApp({ TOKEN_HASH_PEPPER: PEPPER });
    ({ a } = await dosEmpresas(app));
  });
  afterAll(async () => {
    await app.close();
  });

  it('una cuenta pendiente no puede iniciar sesión: se ve igual que una contraseña mala', async () => {
    const email = `pend-${RUN}@activacion.test`;
    await pendiente(email);
    for (const password of [PASSWORD, 'OtraClaveLarga456!']) {
      const res = await request(app.getHttpServer()).post('/v1/auth/login').send({ email, password }).expect(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    }
  });

  describe('el recorrido completo', () => {
    const email = `ana-${RUN}@activacion.test`;
    let userId: string;
    let code: string;

    beforeAll(async () => {
      ({ userId, code } = await pendiente(email));
    });

    it('el paso 1 muestra el correo sin gastar el código; uno equivocado no revela nada', async () => {
      const lookup = await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code: code.toLowerCase().replace(/-/g, ' ') }).expect(200);
      expect(lookup.body.data.email).toBe(email);
      expect((await owner<{ status: string }>(`select status::text from platform.user_activation_codes where user_id = $1`, [userId]))[0].status).toBe('pending');
      const mal = await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code: 'MNK-AAAA-BBBB-CCCC' }).expect(404);
      expect(mal.body.error.code).toBe('ACTIVATION_CODE_INVALID');
    });

    it('con otro correo no sirve y el código sigue pendiente', async () => {
      const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email: `otro-${RUN}@activacion.test`, password: PASSWORD }).expect(422);
      expect(res.body.error.code).toBe('ACTIVATION_CODE_EMAIL_MISMATCH');
      expect((await owner<{ status: string }>(`select status::text from platform.users where id = $1`, [userId]))[0].status).toBe('pending');
    });

    it('la contraseña debe cumplir la política', async () => {
      const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email, password: 'corta' }).expect(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('activa la cuenta en la empresa de quien la creó, gasta el código y deja el rastro', async () => {
      const agent = request.agent(app.getHttpServer());
      // MFA_REQUIRED=false en estas pruebas: entra directo. Con el segundo factor obligatorio se prueba más abajo.
      const res = await agent.post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(201);
      expect(res.body.data.user).toMatchObject({ email, role: 'responsable', status: 'active' });
      expect(res.body.data.company).toEqual({ id: a.companyId, name: a.companyName });
      const [row] = await owner<{ status: string; used_at: Date | null }>(`select status::text, used_at from platform.user_activation_codes where user_id = $1`, [userId]);
      expect(row.status).toBe('used');
      expect(row.used_at).not.toBeNull();
      const aud = await owner<{ tenant_id: string; after_state: unknown }>(`select tenant_id, after_state from audit.audit_logs where action = 'user.activate' and result = 'success' and after_state->>'user_id' = $1`, [userId]);
      expect(aud).toHaveLength(1);
      expect(aud[0].tenant_id).toBe(a.companyId);
      expect(JSON.stringify(aud[0].after_state)).not.toContain(code);
    });

    it('el código no se usa dos veces', async () => {
      const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(409);
      expect(res.body.error.code).toBe('ACTIVATION_CODE_ALREADY_USED');
      const lookup = await request(app.getHttpServer()).post('/v1/auth/activate/lookup').send({ code }).expect(409);
      expect(lookup.body.error.code).toBe('ACTIVATION_CODE_ALREADY_USED');
    });

    it('desde ahí entra con correo y contraseña', async () => {
      await login(app, email);
    });
  });

  it('un código vencido no sirve y lo dice', async () => {
    const email = `vencido-${RUN}@activacion.test`;
    const { code } = await pendiente(email, { expiraEn: '-1 minute' });
    const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(409);
    expect(res.body.error.code).toBe('ACTIVATION_CODE_EXPIRED');
  });

  it('un código revocado (se emitió otro) no sirve y no dice más', async () => {
    const email = `revocado-${RUN}@activacion.test`;
    const { code } = await pendiente(email, { estadoCodigo: 'revoked' });
    const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(404);
    expect(res.body.error.code).toBe('ACTIVATION_CODE_INVALID');
  });

  it('una cuenta que ya no está pendiente (la desactivaron) no se activa con su código', async () => {
    const email = `inactivo-${RUN}@activacion.test`;
    const { userId, code } = await pendiente(email);
    await owner(`update platform.users set status = 'inactive' where id = $1`, [userId]);
    const res = await request(app.getHttpServer()).post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(404);
    expect(res.body.error.code).toBe('ACTIVATION_CODE_INVALID');
  });

  it('los intentos fallidos quedan en la auditoría y el código nunca viaja en ella', async () => {
    const mal = 'MNK-ZZZZ-YYYY-XXXX';
    await request(app.getHttpServer()).post('/v1/auth/activate').send({ code: mal, email: `x-${RUN}@activacion.test`, password: PASSWORD }).expect(404);
    const rows = await owner<{ after_state: unknown }>(`select after_state from audit.audit_logs where action = 'user.activate' and result = 'error' and attempted_email = $1`, [`x-${RUN}@activacion.test`]);
    expect(rows.length).toBeGreaterThan(0);
    expect(JSON.stringify(rows)).not.toContain(mal);
  });

  describe('con el segundo factor obligatorio (D94)', () => {
    it('activar la cuenta no abre la sesión: sigue la configuración del segundo factor', async () => {
      const email = `mfa-${RUN}@activacion.test`;
      const { code } = await pendiente(email);
      // La cuenta se activa con otra app que sí exige el segundo factor (mismo pepper: el hash del código).
      const conMfa = await bootApp({ MFA_REQUIRED: 'true', TOKEN_HASH_PEPPER: PEPPER });
      try {
        const agent = request.agent(conMfa.getHttpServer());
        const res = await agent.post('/v1/auth/activate').send({ code, email, password: PASSWORD }).expect(201);
        expect(res.body.data.next_step).toBe('mfa_setup');
        expect(res.body.data.user).toBeUndefined();
        const cookies = (res.headers['set-cookie'] as unknown as string[]).join(';');
        expect(cookies).toContain('mnk_mfa=');
        expect(cookies).not.toContain('mnk_access=');
        await agent.get('/v1/auth/me').expect(401);
      } finally {
        await conMfa.close();
      }
    });
  });
});
