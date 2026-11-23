import { appUrl, platformAppUrl } from '../../../../common/mail/app-url';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { MailLanguage } from '../../../../common/mail/mail-language';
import { Mailer } from '../../../../common/mail/mailer';
import { PASSWORD_RESET_TOKEN_MINUTES } from '../../domain/password-rules';
import { buildPasswordChangedEmail, buildPasswordResetLinkEmail, PasswordEmailKind } from '../password-email';

// D101 · Los correos de la contraseña. Un fallo del servicio de correo nunca tumba la operación: el cambio ya ocurrió (o el enlace ya existe y se puede pedir otro),
// así que aquí solo se deja constancia en el log, sin el cuerpo del mensaje.
@Injectable()
export class PasswordNotifier {
  private readonly logger = new Logger(PasswordNotifier.name);

  constructor(
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
  ) {}

  async sendResetLink(email: string, role: UserRole, token: string, language: MailLanguage = 'es'): Promise<void> {
    // Monkey Admin y Monkey Platform son apps distintas: el enlace lleva a la de quien lo pidió.
    // Sin respaldo cruzado: un admin_monkey sin ADMIN_APP_URL no recibe un enlace a Platform.
    const admin = role === 'admin_monkey';
    const base = admin ? appUrl(this.config, 'ADMIN_APP_URL') : platformAppUrl(this.config);
    // Sin dirección de la app no hay a dónde mandar a la persona: se avisa en el log y no se envía un enlace roto.
    if (!base) return this.logger.warn(`No se envió el enlace de recuperación: falta ${admin ? 'ADMIN_APP_URL' : 'PLATFORM_APP_URL'}.`);
    // En Monkey Admin las pantallas de acceso cuelgan de /auth; en Platform, de la raíz.
    const path = admin ? '/auth/reset-password' : '/reset-password';
    await this.deliver(buildPasswordResetLinkEmail({ to: email, resetUrl: `${base}${path}?token=${encodeURIComponent(token)}`, minutes: PASSWORD_RESET_TOKEN_MINUTES, language }));
  }

  async sendChanged(email: string, via: PasswordEmailKind, language: MailLanguage = 'es'): Promise<void> {
    await this.deliver(buildPasswordChangedEmail({ to: email, via, language }));
  }

  private async deliver(message: Parameters<Mailer['send']>[0]): Promise<void> {
    try {
      await this.mailer.send(message);
    } catch (error) {
      this.logger.warn(`No se pudo enviar un correo de contraseña: ${error instanceof Error ? error.message : 'error desconocido'}`);
    }
  }
}
