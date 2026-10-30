import { MailMessage, Mailer } from '../../src/common/mail/mailer';

const CLAVE = /MNK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/;

/** D99 · El correo de las pruebas: guarda lo que se «envía» y puede fallar a propósito. La clave de acceso ya no sale por la API, solo por aquí. */
export class CorreoEnMemoria extends Mailer {
  readonly enviados: MailMessage[] = [];
  falla = false;

  async send(message: MailMessage): Promise<void> {
    if (this.falla) throw new Error('El servicio de correo no respondió (simulado)');
    this.enviados.push(message);
  }

  paraEl(email: string): MailMessage[] {
    return this.enviados.filter((m) => m.to === email);
  }
}

export const correo = new CorreoEnMemoria();

/** La última clave de acceso que se le envió a ese correo. */
export function claveEnviadaA(email: string): string {
  const mensajes = correo.paraEl(email);
  const clave = mensajes[mensajes.length - 1]?.text.match(CLAVE)?.[0];
  if (!clave) throw new Error(`No se envió ninguna clave de acceso a ${email}`);
  return clave;
}
