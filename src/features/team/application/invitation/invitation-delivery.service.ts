import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { platformAppUrl } from '../../../../common/mail/app-url';
import { Mailer } from '../../../../common/mail/mailer';
import { Invitation } from '../../domain/team.types';
import { buildInvitationEmail, INVITATION_DEFAULTS, InvitationEmailInput } from './invitation-email';

// Quién invita y la empresa pueden faltar si su fila ya no se encuentra al leerlas (después del commit): el correo sale con palabras neutras en vez de perder la invitación.
export type InvitationDeliveryInput = Omit<InvitationEmailInput, 'appUrl' | 'inviterName' | 'companyName'> & { userId: string; inviterName: string | null; companyName: string | null };

// MD-190 · Envía el código de activación por correo, DESPUÉS de que la cuenta y el código quedaron guardados. Un fallo del correo no deshace nada: la cuenta existe y se reenvía con
// la reemisión, así que aquí solo se informa `failed`. Ni el log ni el resultado llevan el código ni el correo de la persona (SEG-75); el error del Mailer tampoco lleva el cuerpo.
@Injectable()
export class InvitationDelivery {
  private readonly logger = new Logger(InvitationDelivery.name);

  constructor(
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
  ) {}

  async deliver(input: InvitationDeliveryInput): Promise<Invitation['deliveryStatus']> {
    const appUrl = platformAppUrl(this.config) ?? null;
    try {
      await this.mailer.send(buildInvitationEmail({ ...input, inviterName: input.inviterName ?? INVITATION_DEFAULTS[input.language ?? 'es'].inviter, companyName: input.companyName ?? INVITATION_DEFAULTS[input.language ?? 'es'].company, appUrl }));
      return 'sent';
    } catch (error) {
      this.logger.warn(`No se pudo enviar la invitación de la cuenta ${input.userId}: ${error instanceof Error ? error.message : 'error desconocido'}`);
      return 'failed';
    }
  }
}
