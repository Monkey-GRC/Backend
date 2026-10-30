import { Injectable, Logger } from '@nestjs/common';
import { MailMessage, Mailer } from '../../common/mail/mailer';

// SOLO para trabajar en local (MAIL_PROVIDER=log): escribe el mensaje en el log del servidor en vez de enviarlo.
// Incluye la clave de acceso, por eso en producción el servidor se niega a arrancar con este modo (SEG-71).
@Injectable()
export class LogMailer extends Mailer {
  private readonly logger = new Logger(LogMailer.name);

  async send(message: MailMessage): Promise<void> {
    this.logger.warn(`Correo simulado (no se envió) a ${message.to}\nAsunto: ${message.subject}\n${message.text}`);
  }
}
