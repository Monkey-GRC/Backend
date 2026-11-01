import { escapeHtml, renderBrandEmail } from '../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../common/mail/brand-logo';
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
  return { to: input.adminEmail, subject: 'Tu clave de acceso a Monkey', text: lines.join('\n'), html: buildHtml(input), ...inlineLogo() };
}

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

function buildHtml(input: AccessKeyEmailInput): string {
  const company = escapeHtml(input.companyName);
  return renderBrandEmail({
    title: 'Tu clave de acceso a Monkey',
    preheader: `Tu clave de acceso para crear la cuenta de ${input.companyName}.`,
    heading: 'Tu clave de acceso',
    introHtml: `Monkey registró a <strong>${company}</strong>. Usa esta clave para crear la cuenta del administrador de la empresa.`,
    highlightHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed #046cc4;border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin-bottom:8px;">Clave de acceso</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#01264a;">${escapeHtml(input.code)}</div>
      </td></tr></table>`,
    button: input.redeemUrl ? { label: 'Activar mi cuenta', url: input.redeemUrl } : null,
    bulletsHtml: [`Úsala <strong>una sola vez</strong>, con este mismo correo (${escapeHtml(input.adminEmail)}).`, `Vence el <strong>${escapeHtml(formatUtc(input.expiresAt))}</strong>.`],
    footnote: 'Si no esperabas este mensaje, ignóralo: sin la clave nadie puede entrar. Si pides una clave nueva, esta deja de servir.',
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
}
