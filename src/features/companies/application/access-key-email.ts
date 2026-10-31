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
  return { to: input.adminEmail, subject: 'Tu clave de acceso a Monkey', text: lines.join('\n'), html: buildHtml(input) };
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Colores y logo de la marca (los de Monkey Platform). Los clientes de correo no cargan hojas de estilo ni SVG: todo va en
// línea, con tablas, y el logo es un PNG que sirve la propia Platform (si no carga, el alt deja el nombre legible).
const BRAND = { primary: '#046cc4', navy: '#01264a', text: '#1d2939', muted: '#667085', soft: '#f2f4f7', line: '#e4e7ec' };

function buildHtml(input: AccessKeyEmailInput): string {
  const origin = input.redeemUrl ? new URL(input.redeemUrl).origin : null;
  const logo = origin
    ? `<img src="${escapeHtml(origin)}/images/logo/email-logo.png" width="150" alt="Monkey" style="display:block;margin:0 auto;border:0;height:auto;">`
    : `<span style="font-size:26px;font-weight:700;letter-spacing:3px;color:#ffffff;">MONKEY</span>`;
  const button = input.redeemUrl
    ? `<tr><td align="center" style="padding:8px 0 4px;"><a href="${escapeHtml(input.redeemUrl)}" style="display:inline-block;background:${BRAND.primary};color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:13px 32px;border-radius:10px;">Activar mi cuenta</a></td></tr>`
    : '';
  const company = escapeHtml(input.companyName);
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Tu clave de acceso a Monkey</title></head>
<body style="margin:0;padding:0;background:${BRAND.soft};font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu clave de acceso para crear la cuenta de ${company}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.soft};"><tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.line};">
    <tr><td align="center" style="background:${BRAND.navy};padding:30px 24px;">${logo}</td></tr>
    <tr><td style="padding:36px 36px 8px;">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${BRAND.navy};">Tu clave de acceso</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.text};">Monkey registró a <strong>${company}</strong>. Usa esta clave para crear la cuenta del administrador de la empresa.</p>
    </td></tr>
    <tr><td style="padding:20px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed ${BRAND.primary};border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">Clave de acceso</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:${BRAND.navy};">${escapeHtml(input.code)}</div>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:0 36px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${button}</table>
    </td></tr>
    <tr><td style="padding:20px 36px 8px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      <p style="margin:0 0 8px;">&bull; Úsala <strong>una sola vez</strong>, con este mismo correo (${escapeHtml(input.adminEmail)}).</p>
      <p style="margin:0;">&bull; Vence el <strong>${escapeHtml(formatUtc(input.expiresAt))}</strong>.</p>
    </td></tr>
    <tr><td style="padding:20px 36px 32px;">
      <p style="margin:0;padding-top:16px;border-top:1px solid ${BRAND.line};font-size:12.5px;line-height:1.6;color:${BRAND.muted};">Si no esperabas este mensaje, ignóralo: sin la clave nadie puede entrar. Si pides una clave nueva, esta deja de servir.</p>
    </td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">Monkey &middot; Ciberseguridad y cumplimiento</p>
</td></tr></table>
</body></html>`;
}
