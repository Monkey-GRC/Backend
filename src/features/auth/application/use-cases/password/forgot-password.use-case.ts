import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { PASSWORD_RESET_REQUESTS_PER_HOUR, PASSWORD_RESET_TOKEN_MINUTES } from '../../../domain/password-rules';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { PasswordRepository } from '../../../domain/repositories/password.repository';
import { PasswordNotifier } from '../../services/password-notifier.service';

const HOUR_MS = 60 * 60 * 1000;

// D101 · «Olvidé mi contraseña»: no devuelve nada ni falla nunca por la cuenta, exista o no, esté activa o no, o haya pedido demasiados enlaces (así no sirve para
// averiguar qué correos tienen cuenta). El correo sale sin esperar a que lo acepte el proveedor, para que el tiempo de respuesta tampoco lo delate.
@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenHasher,
    private readonly notifier: PasswordNotifier,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(email: string, meta: RequestMeta): Promise<void> {
    const now = new Date();
    const normalized = email.trim().toLowerCase();
    const credentials = await this.users.findCredentialsByEmail(normalized);
    if (!credentials) {
      await this.hasher.compareAgainstDummy(normalized);
      return this.log(meta, null, 'unknown_email', normalized);
    }
    if (credentials.status !== 'active') return this.log(meta, credentials.id, `status_${credentials.status}`, normalized);

    const scope = { companyId: credentials.companyId, userId: credentials.id, role: credentials.role };
    const recent = await this.passwords.countResetRequestsSince(scope, credentials.id, new Date(now.getTime() - HOUR_MS));
    if (recent >= PASSWORD_RESET_REQUESTS_PER_HOUR) return this.log(meta, credentials.id, 'rate_limited', normalized);

    const token = this.tokens.generate();
    await this.passwords.issueResetToken(scope, {
      userId: credentials.id,
      tokenHash: this.tokens.hash(token),
      expiresAt: new Date(now.getTime() + PASSWORD_RESET_TOKEN_MINUTES * 60_000),
      at: now,
    });
    void this.notifier.sendResetLink(normalized, credentials.role, token, credentials.preferredLanguage);
    await this.audit.write({
      tenantId: credentials.companyId,
      userId: credentials.id,
      action: 'auth.password_forgot',
      resource: 'user',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { user_id: credentials.id },
    });
  }

  // Los intentos que no envían nada también dejan rastro (CC7.2), con el correo tecleado.
  private log(meta: RequestMeta, userId: string | null, reason: string, attemptedEmail: string): Promise<void> {
    return this.audit.write({
      tenantId: null,
      userId,
      attemptedEmail,
      action: 'auth.password_forgot',
      resource: 'user',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { reason },
    });
  }
}
