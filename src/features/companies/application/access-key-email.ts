import type { MailMessage } from '../../../common/mail/mailer';

const pad = (n: number) => String(n).padStart(2, '0');

// «dd/mm/aaaa hh:mm UTC»: el correo no sabe en qué zona está quien lo lee, así que dice cuál usa.
function formatUtc(date: Date): string {
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

export type AccessKeyEmailInput = {
  companyName: string;
  adminEmail: string;
  code: string;
  expiresAt: Date;
  // Dónde se canjea (Monkey Platform). Sin él, el correo no lleva enlace.
  redeemUrl: string | null;
};

// D99 · El mensaje que lleva la clave de acceso al administrador de la empresa. Lleva lo mínimo para actuar y no
// nombra al proveedor del motor (SEG-39). Solo español por ahora.
export function buildAccessKeyEmail(input: AccessKeyEmailInput): MailMessage {
  const lines = [
    `Monkey registró a ${input.companyName}. Esta es la clave de acceso para crear la cuenta del administrador de la empresa:`,
    '',
    `    ${input.code}`,
    '',
    `Úsala una sola vez, con este mismo correo (${input.adminEmail}). Vence el ${formatUtc(input.expiresAt)}.`,
  ];
  if (input.redeemUrl) lines.push('', `Actívala aquí: ${input.redeemUrl}`);
  lines.push('', 'Si no esperabas este mensaje, ignóralo: sin la clave nadie puede entrar. Si pides una clave nueva, esta deja de servir.');
  return { to: input.adminEmail, subject: 'Tu clave de acceso a Monkey', text: lines.join('\n') };
}
