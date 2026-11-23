import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appUrl } from '../../../common/mail/app-url';
import { Mailer } from '../../../common/mail/mailer';
import { Invitation } from '../domain/admin-account';
import { AdminInvitationEmailInput, buildAdminInvitationEmail } from './admin-invitation-email';

export type AdminInvitationDeliveryInput = Omit<AdminInvitationEmailInput, 'appUrl'> & { userId: string };

// D117 · Envía el código DESPUÉS de que la cuenta y el código quedaron guardados. Un fallo del correo no deshace nada: la cuenta existe y se reenvía con
// `activation-code`; aquí solo se informa `failed`. Ni el log ni el resultado llevan el código ni el correo (SEG-75).
@Injectable()
export class AdminInvitationDelivery {
  private readonly logger = new Logger(AdminInvitationDelivery.name);

  constructor(
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
  ) {}

  async deliver(input: AdminInvitationDeliveryInput): Promise<Invitation['deliveryStatus']> {
    // El enlace va solo a Monkey Admin: sin ADMIN_APP_URL el correo sale sin enlace (nunca a Platform) y se avisa en el log.
    const url = appUrl(this.config, 'ADMIN_APP_URL') ?? null;
    if (!url) this.logger.warn('La invitación de administrador sale sin enlace: falta ADMIN_APP_URL.');
    try {
      await this.mailer.send(buildAdminInvitationEmail({ ...input, appUrl: url }));
      return 'sent';
    } catch (error) {
      this.logger.warn(`No se pudo enviar la invitación de la cuenta ${input.userId}: ${error instanceof Error ? error.message : 'error desconocido'}`);
      return 'failed';
    }
  }
}
