import { Injectable } from '@nestjs/common';
import { MailMessage, Mailer } from '../../common/mail/mailer';

const ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 10_000;

// Adaptador del servicio de correo transaccional (MAIL_PROVIDER=resend). Habla con su API por HTTP, sin librería de
// terceros. Un error nunca incluye el cuerpo del mensaje ni al destinatario: puede traer una clave de acceso.
@Injectable()
export class ResendMailer extends Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {
    super();
  }

  async send(message: MailMessage): Promise<void> {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, text: message.text }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      throw new Error(`El servicio de correo no respondió (${error instanceof Error ? error.name : 'error'})`);
    }
    if (!res.ok) {
      // El servicio responde { name, message }; solo el tipo de error es seguro de registrar.
      const body = (await res.json().catch(() => null)) as { name?: string } | null;
      throw new Error(`El servicio de correo rechazó el mensaje (HTTP ${res.status}${body?.name ? `, ${body.name}` : ''})`);
    }
  }
}
