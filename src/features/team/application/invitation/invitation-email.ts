import { escapeHtml, renderBrandEmail } from '../../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../../common/mail/brand-logo';
import type { MailMessage } from '../../../../common/mail/mailer';

// El rol como lo dice el negocio, no como se llama en la base (monkey-ui-copy).
const ROLE_LABEL: Record<string, string> = { admin_empresa: 'administrador', responsable: 'responsable', delegado: 'delegado', auditor: 'auditor' };

const pad = (n: number) => String(n).padStart(2, '0');
// «dd/mm/aaaa hh:mm UTC»: el correo no sabe en qué zona está quien lo lee, así que dice cuál usa.
const formatUtc = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;

export type InvitationEmailInput = {
  to: string;
  inviterName: string;
  companyName: string;
  role: string;
  code: string;
  expiresAt: Date;
  // Dónde está Monkey Platform. Sin él, el correo no lleva enlace.
  appUrl: string | null;
};

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

// MD-190 · La invitación al equipo: el único canal por el que sale el código de activación (SEG-75). Marcada `confidential` para que ningún adaptador que registre
// mensajes escriba su cuerpo. No nombra al proveedor de la sonda ni del motor de nube. Solo español por ahora.
export function buildInvitationEmail(input: InvitationEmailInput): MailMessage {
  const role = ROLE_LABEL[input.role] ?? input.role;
  const expires = formatUtc(input.expiresAt);
  const intro = `${input.inviterName} te invitó a Monkey, la plataforma de cumplimiento de ${input.companyName}, con el rol de ${role}.`;
  const how = ['Abre Monkey y elige activar tu cuenta.', `Escribe este código, tu correo (${input.to}) y la contraseña que quieras usar.`, 'Configura tu segundo factor cuando te lo pida.'];
  const lines = [intro, '', 'Este es tu código de activación:', '', `    ${input.code}`, '', `Sirve una sola vez y vence el ${expires}.`, '', 'Para activar tu cuenta:', ...how.map((l, i) => `${i + 1}. ${l}`)];
  if (input.appUrl) lines.push('', `Monkey: ${input.appUrl}`);
  lines.push('', 'Si no esperabas esta invitación, ignora este mensaje: sin el código nadie puede entrar. Si piden un código nuevo, este deja de servir.');

  const html = renderBrandEmail({
    title: 'Te invitaron a Monkey',
    preheader: `${input.inviterName} te invitó a ${input.companyName}. Activa tu cuenta con este código.`,
    heading: 'Te invitaron a Monkey',
    introHtml: `${escapeHtml(input.inviterName)} te invitó a Monkey, la plataforma de cumplimiento de <strong>${escapeHtml(input.companyName)}</strong>, con el rol de <strong>${escapeHtml(role)}</strong>.`,
    highlightHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed #046cc4;border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin-bottom:8px;">Código de activación</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#01264a;">${escapeHtml(input.code)}</div>
      </td></tr></table>`,
    button: input.appUrl ? { label: 'Abrir Monkey', url: input.appUrl } : null,
    bulletsHtml: [`Sirve <strong>una sola vez</strong> y vence el <strong>${escapeHtml(expires)}</strong>.`, ...how.map(escapeHtml)],
    footnote: 'Si no esperabas esta invitación, ignora este mensaje: sin el código nadie puede entrar. Si piden un código nuevo, este deja de servir.',
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: `${input.inviterName} te invitó a Monkey`, text: lines.join('\n'), html, confidential: true, ...inlineLogo() };
}
