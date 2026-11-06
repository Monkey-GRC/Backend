import { Injectable, Logger } from '@nestjs/common';
import { MailMessage, Mailer } from '../../common/mail/mailer';

// SOLO para trabajar en local (MAIL_PROVIDER=log): escribe el mensaje en el log del servidor en vez de enviarlo.
// Incluye la clave de acceso de una empresa (D99), por eso en producción el servidor se niega a arrancar con este modo (SEG-71).
@Injectable()
export class LogMailer extends Mailer {
  private readonly logger = new Logger(LogMailer.name);

  async send(message: MailMessage): Promise<void> {
    // Un mensaje confidencial (invitación con su código, SEG-75) deja constancia de que se simuló, pero nunca su cuerpo.
    const body = message.confidential ? '(cuerpo omitido: lleva un código de un solo uso)' : message.text;
    this.logger.warn(`Correo simulado (no se envió) a ${message.to}\nAsunto: ${message.subject}\n${body}`);
  }
}
