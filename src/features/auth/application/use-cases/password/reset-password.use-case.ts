import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { PasswordRepository } from '../../../domain/repositories/password.repository';
import { MfaAttempts } from '../../services/mfa-attempts.service';
import { PasswordNotifier } from '../../services/password-notifier.service';
import { PasswordRules } from '../../services/password-rules.service';
import { StepUp } from '../../services/step-up.service';

export type ResetPasswordInput = { token: string; newPassword: string; code?: string; recoveryCode?: string };

// D101 · Segundo paso de «olvidé mi contraseña»: el enlace del correo, el segundo factor y la contraseña nueva en una sola petición. Cierra TODAS las sesiones.
// Quien aún no configuró el segundo factor no tiene código que dar: puede cambiarla, y al ingresar tendrá que configurarlo (el login lo sigue exigiendo).
@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenHasher,
    private readonly rules: PasswordRules,
    private readonly stepUp: StepUp,
    private readonly attempts: MfaAttempts,
    private readonly notifier: PasswordNotifier,
  ) {}

  async execute(input: ResetPasswordInput, meta: RequestMeta): Promise<void> {
    const now = new Date();
    const found = await this.passwords.findResetTokenByHash(this.tokens.hash(input.token));
    if (!found || !found.token.isUsable(now)) throw new DomainError('PASSWORD_RESET_INVALID');
    const { scope, token } = found;

    const credentials = await this.users.findCredentialsById(scope, token.userId);
    const user = await this.users.findById(scope, token.userId);
    if (!credentials || !user || credentials.status !== 'active') throw new DomainError('PASSWORD_RESET_INVALID');
    this.attempts.assertNotLocked(credentials, now);

    if (credentials.isMfaEnabled) {
      // Sin código ni código de recuperación es un intento fallido, igual que uno equivocado.
      if (!input.code && !input.recoveryCode) await this.attempts.fail(scope, credentials, null, meta, now, 'missing_code');
      await this.stepUp.assert(scope, credentials.id, input.code, meta, input.recoveryCode);
    }
    await this.rules.assertNotReused(scope, credentials.id, credentials.passwordHash, input.newPassword);

    const newHash = await this.hasher.hash(input.newPassword);
    await this.passwords.change(
      scope,
      { userId: credentials.id, previousHash: credentials.passwordHash, newHash, at: now, keepSessionId: null, resetTokenId: token.id },
      ({ sessionsClosed }) => ({
        tenantId: credentials.companyId,
        userId: credentials.id,
        action: 'auth.password_reset',
        resource: 'user',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { user_id: credentials.id, via: 'reset', sessions_closed: sessionsClosed },
      }),
    );
    await this.notifier.sendChanged(user.email, 'reset', user.preferredLanguage);
  }
}
