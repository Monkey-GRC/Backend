import { createHash } from 'node:crypto';
import { DomainError } from '../../../../../common/errors/domain-error';
import { CredentialCipher } from '../../../../../common/security/credential-cipher';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { TenantScope } from '../../../../../common/tenancy/tenant-scope';
import { AuthUser, UserCredentials } from '../../../domain/entities/auth-user.entity';
import { MfaChallenge, MfaChallengePurpose } from '../../../domain/entities/mfa-challenge.entity';
import { normalizeRecoveryCode } from '../../../domain/recovery-codes';
import { totpAt } from '../../../domain/totp';
import { MfaAttempts } from '../../services/mfa-attempts.service';
import { MfaChallengeService } from '../../services/mfa-challenge.service';
import { ConfirmMfaSetupUseCase } from './confirm-mfa-setup.use-case';
import { StartMfaSetupUseCase } from './start-mfa-setup.use-case';
import { VerifyMfaUseCase } from './verify-mfa.use-case';

// El segundo factor de punta a punta SIN base de datos: repositorios en memoria que respetan lo que la base impone (un solo uso por escritura condicional, la
// huella de los códigos, el desafío de un solo uso). Lo que corre contra Postgres (RLS, la función de búsqueda, las migraciones) lo cubre test/autenticacion/mfa.e2e-spec.ts.

const scope: TenantScope = { companyId: 'co-1', userId: 'u-1' };
const meta = { ipAddress: '10.0.0.1', userAgent: 'jest' };

class FakeTokens extends TokenHasher {
  private n = 0;
  generate() { return `token-${++this.n}`; }
  hash(token: string) { return createHash('sha256').update(token).digest('hex'); }
}
class FakeCipher extends CredentialCipher {
  encrypt(c: Record<string, unknown>) { return `v1.${Buffer.from(JSON.stringify(c)).toString('base64url')}`; }
  decrypt(p: string) { return JSON.parse(Buffer.from(p.slice(3), 'base64url').toString()) as Record<string, unknown>; }
}

class World {
  user = { isMfaEnabled: false, secret: null as string | null, lastStep: null as number | null, failed: 0, lockedUntil: null as Date | null, status: 'active' as 'active' | 'inactive' };
  challenges = new Map<string, { id: string; purpose: MfaChallengePurpose; hash: string; pending: string | null; failures: number; expiresAt: Date; consumedAt: Date | null }>();
  recovery: { hash: string; used: boolean }[] = [];
  sessions = 0;
  audits: { action: string; result: string; afterState?: Record<string, unknown> }[] = [];
  private seq = 0;

  creds(): UserCredentials {
    const u = this.user;
    return new UserCredentials('u-1', 'co-1', 'pw', 'admin_empresa', u.status, u.failed, u.lockedUntil, u.isMfaEnabled, u.secret, u.lastStep);
  }

  users = {
    findCredentialsById: async () => this.creds(),
    findById: async () => new AuthUser('u-1', 'co-1', 'ACME', 'ana@acme.com', null, null, 'admin_empresa', 'active', this.user.isMfaEnabled, null, new Date()),
    registerFailedLogin: async (_s: TenantScope, _id: string, state: { failedLoginAttempts: number; lockedUntil: Date | null }) => {
      this.user.failed = state.failedLoginAttempts;
      this.user.lockedUntil = state.lockedUntil;
    },
    registerSuccessfulLogin: async () => {
      this.user.failed = 0;
      this.user.lockedUntil = null;
    },
  };

  mfa = {
    createChallenge: async (_s: TenantScope, d: { tokenHash: string; purpose: MfaChallengePurpose; expiresAt: Date }) => {
      const id = `ch-${++this.seq}`;
      this.challenges.set(id, { id, purpose: d.purpose, hash: d.tokenHash, pending: null, failures: 0, expiresAt: d.expiresAt, consumedAt: null });
    },
    findChallengeByTokenHash: async (hash: string) => {
      const c = [...this.challenges.values()].find((x) => x.hash === hash);
      return c ? { scope, challenge: new MfaChallenge(c.id, 'u-1', c.purpose, c.pending, c.failures, c.expiresAt, c.consumedAt) } : null;
    },
    setPendingSecret: async (_s: TenantScope, id: string, enc: string) => { this.challenges.get(id)!.pending = enc; },
    registerChallengeFailure: async (_s: TenantScope, id: string) => ++this.challenges.get(id)!.failures,
    consumeChallenge: async (_s: TenantScope, id: string, at: Date) => { this.challenges.get(id)!.consumedAt = at; },
    recordTotpUse: async (_s: TenantScope, _u: string, step: number) => {
      if (this.user.lastStep !== null && this.user.lastStep >= step) return false;
      this.user.lastStep = step;
      return true;
    },
    useRecoveryCode: async (_s: TenantScope, _u: string, hash: string) => {
      const code = this.recovery.find((r) => r.hash === hash && !r.used);
      if (code) code.used = true;
      return { used: !!code, remaining: this.recovery.filter((r) => !r.used).length };
    },
    activate: async (_s: TenantScope, _u: string, d: { challengeId: string; secretEncrypted: string; step: number; recoveryCodeHashes: string[]; at: Date }, audit: (v: { userId: string }) => { action: string; result: string }) => {
      this.user.isMfaEnabled = true;
      this.user.secret = d.secretEncrypted;
      this.user.lastStep = d.step;
      this.recovery = d.recoveryCodeHashes.map((hash) => ({ hash, used: false }));
      this.challenges.get(d.challengeId)!.consumedAt = d.at;
      this.audits.push(audit({ userId: 'u-1' }));
    },
  };

  audit = { write: async (e: { action: string; result: string; afterState?: Record<string, unknown> }) => { this.audits.push(e); } };
  sessionIssuer = { issue: async () => { this.sessions++; return { session: { id: `s-${this.sessions}`, expiresAt: new Date() }, accessToken: 'a', refreshToken: 'r' }; } };
}

function build() {
  const w = new World();
  const tokens = new FakeTokens();
  const cipher = new FakeCipher();
  const challenges = new MfaChallengeService(w.mfa as never, tokens);
  const attempts = new MfaAttempts(w.users as never, w.mfa as never, w.audit as never);
  return {
    w,
    open: (purpose: MfaChallengePurpose) => challenges.open(scope, 'u-1', purpose, meta),
    start: new StartMfaSetupUseCase(challenges, w.users as never, w.mfa as never, cipher),
    confirm: new ConfirmMfaSetupUseCase(challenges, w.users as never, w.mfa as never, attempts, cipher, tokens, w.sessionIssuer as never),
    verify: new VerifyMfaUseCase(challenges, w.users as never, w.mfa as never, attempts, cipher, tokens, w.sessionIssuer as never),
  };
}

const code = (secret: string, offsetSeconds = 0) => totpAt(secret, new Date(Date.now() + offsetSeconds * 1000));
const rejects = async (p: Promise<unknown>, expected: string) => {
  const e = await p.then(() => null, (err: unknown) => err);
  expect(e).toBeInstanceOf(DomainError);
  expect((e as DomainError).code).toBe(expected);
};

/** Una persona que ya activó el segundo factor: devuelve el secreto y los 10 códigos de recuperación. */
async function enrolled(s: ReturnType<typeof build>) {
  const challenge = await s.open('setup');
  const { secret } = await s.start.execute(challenge.token);
  const done = await s.confirm.execute({ challengeToken: challenge.token, code: code(secret) }, meta);
  return { secret, recoveryCodes: done.recoveryCodes };
}

describe('configurar el segundo factor (primer ingreso)', () => {
  it('el secreto se guarda cifrado en el desafío, y pedir el QR dos veces da el mismo', async () => {
    const s = build();
    const { token } = await s.open('setup');
    const first = await s.start.execute(token);
    const second = await s.start.execute(token);
    expect(second.secret).toBe(first.secret);
    expect(first.otpauthUri).toContain(`secret=${first.secret}`);
    expect([...s.w.challenges.values()][0].pending).not.toContain(first.secret);
    expect(s.w.user.isMfaEnabled).toBe(false);
  });

  it('con el primer código se activa, entrega 10 códigos de recuperación (solo su huella queda) y abre la sesión', async () => {
    const s = build();
    const { token } = await s.open('setup');
    const { secret } = await s.start.execute(token);
    const done = await s.confirm.execute({ challengeToken: token, code: code(secret) }, meta);
    expect(s.w.user.isMfaEnabled).toBe(true);
    expect(done.recoveryCodes).toHaveLength(10);
    expect(s.w.recovery).toHaveLength(10);
    for (const c of done.recoveryCodes) expect(s.w.recovery.map((r) => r.hash)).not.toContain(c);
    expect(s.w.sessions).toBe(1);
    expect(s.w.audits.map((a) => a.action)).toContain('auth.mfa_enabled');
  });

  it('un código equivocado suma intentos y no activa nada; sin pedir el QR no hay qué confirmar', async () => {
    const s = build();
    const { token } = await s.open('setup');
    await rejects(s.confirm.execute({ challengeToken: token, code: '123456' }, meta), 'MFA_SETUP_NOT_STARTED');
    await s.start.execute(token);
    await rejects(s.confirm.execute({ challengeToken: token, code: '000000' }, meta), 'MFA_CODE_INVALID');
    expect(s.w.user.isMfaEnabled).toBe(false);
    expect(s.w.user.failed).toBe(1);
    expect([...s.w.challenges.values()][0].failures).toBe(1);
    expect(s.w.audits.at(-1)).toMatchObject({ action: 'auth.mfa_failed', result: 'error' });
  });

  it('un desafío de verificación no sirve para configurar, ni uno inexistente', async () => {
    const s = build();
    const { token } = await s.open('verify');
    await rejects(s.start.execute(token), 'MFA_CHALLENGE_INVALID');
    await rejects(s.start.execute('nada'), 'MFA_CHALLENGE_INVALID');
    await rejects(s.start.execute(undefined), 'MFA_CHALLENGE_INVALID');
  });
});

describe('verificar el segundo factor (ingresos siguientes)', () => {
  it('el código del paso siguiente abre la sesión; el de la configuración, ya gastado, no', async () => {
    const s = build();
    const { secret } = await enrolled(s);
    const spent = await s.open('verify');
    await rejects(s.verify.execute({ challengeToken: spent.token, code: code(secret) }, meta), 'MFA_CODE_INVALID');
    const ok = await s.open('verify');
    const res = await s.verify.execute({ challengeToken: ok.token, code: code(secret, 30) }, meta);
    expect(res.method).toBe('totp');
    expect(s.w.sessions).toBe(2);
    expect(s.w.user.failed).toBe(0);
  });

  it('el mismo código no sirve dos veces', async () => {
    const s = build();
    const { secret } = await enrolled(s);
    const a = await s.open('verify');
    await s.verify.execute({ challengeToken: a.token, code: code(secret, 30) }, meta);
    const b = await s.open('verify');
    await rejects(s.verify.execute({ challengeToken: b.token, code: code(secret, 30) }, meta), 'MFA_CODE_INVALID');
  });

  it('el desafío se gasta con la sesión: no se puede reusar', async () => {
    const s = build();
    const { secret } = await enrolled(s);
    const a = await s.open('verify');
    await s.verify.execute({ challengeToken: a.token, code: code(secret, 30) }, meta);
    await rejects(s.verify.execute({ challengeToken: a.token, code: code(secret, 60) }, meta), 'MFA_CHALLENGE_INVALID');
  });

  it('un código de recuperación entra una vez (con o sin guion y en minúsculas) y dice cuántos quedan', async () => {
    const s = build();
    const { recoveryCodes } = await enrolled(s);
    const a = await s.open('verify');
    const res = await s.verify.execute({ challengeToken: a.token, recoveryCode: recoveryCodes[0].toLowerCase().replace('-', ' ') }, meta);
    expect(res.method).toBe('recovery');
    expect(res.recoveryCodesLeft).toBe(9);
    const b = await s.open('verify');
    await rejects(s.verify.execute({ challengeToken: b.token, recoveryCode: recoveryCodes[0] }, meta), 'MFA_CODE_INVALID');
    expect(normalizeRecoveryCode(recoveryCodes[1])).toBeTruthy();
  });

  it('cinco códigos equivocados bloquean la cuenta en el quinto, y el desafío ya no sirve', async () => {
    const s = build();
    await enrolled(s);
    const a = await s.open('verify');
    for (let i = 0; i < 4; i++) await rejects(s.verify.execute({ challengeToken: a.token, code: '111111' }, meta), 'MFA_CODE_INVALID');
    await rejects(s.verify.execute({ challengeToken: a.token, code: '111111' }, meta), 'ACCOUNT_LOCKED');
    expect(s.w.user.lockedUntil).not.toBeNull();
    await rejects(s.verify.execute({ challengeToken: a.token, code: '111111' }, meta), 'MFA_CHALLENGE_INVALID');
  });

  it('un desafío vencido no sirve', async () => {
    const s = build();
    const { secret } = await enrolled(s);
    const a = await s.open('verify');
    [...s.w.challenges.values()].find((c) => c.hash && !c.consumedAt)!.expiresAt = new Date(Date.now() - 1000);
    await rejects(s.verify.execute({ challengeToken: a.token, code: code(secret, 30) }, meta), 'MFA_CHALLENGE_INVALID');
  });

  it('una cuenta inactiva no entra aunque el código sea correcto', async () => {
    const s = build();
    const { secret } = await enrolled(s);
    const a = await s.open('verify');
    s.w.user.status = 'inactive';
    await rejects(s.verify.execute({ challengeToken: a.token, code: code(secret, 30) }, meta), 'ACCOUNT_INACTIVE');
  });
});
