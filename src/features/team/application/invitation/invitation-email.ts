import { escapeHtml, renderBrandEmail } from '../../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../../common/mail/brand-logo';
import { formatUtc, MailLanguage, pick } from '../../../../common/mail/mail-language';
import type { MailMessage } from '../../../../common/mail/mailer';

// El rol como lo dice el negocio, no como se llama en la base (monkey-ui-copy), en cada idioma.
const ROLE_LABEL: Record<MailLanguage, Record<string, string>> = {
  es: { admin_empresa: 'administrador', responsable: 'responsable', delegado: 'delegado', auditor: 'auditor' },
  en: { admin_empresa: 'administrator', responsable: 'responsible', delegado: 'delegate', auditor: 'auditor' },
};

// Los textos por omisión cuando no se conoce quién invita o la empresa.
export const INVITATION_DEFAULTS: Record<MailLanguage, { inviter: string; company: string }> = {
  es: { inviter: 'Tu equipo', company: 'tu empresa' },
  en: { inviter: 'Your team', company: 'your company' },
};

export type InvitationEmailInput = {
  to: string;
  inviterName: string;
  companyName: string;
  role: string;
  code: string;
  expiresAt: Date;
  // Dónde está Monkey Platform. Sin él, el correo no lleva enlace.
  appUrl: string | null;
  // D111 · El idioma de quien invita (su `Accept-Language`): quien recibe aún no tiene cuenta. La cuenta nace con ese idioma.
  language?: MailLanguage;
};

const COPY = {
  es: {
    subject: (inviter: string) => `${inviter} te invitó a Monkey`,
    heading: 'Te invitaron a Monkey',
    title: 'Te invitaron a Monkey',
    preheader: (inviter: string, company: string) => `${inviter} te invitó a ${company}. Activa tu cuenta con este código.`,
    intro: (inviter: string, company: string, role: string) => `${inviter} te invitó a Monkey, la plataforma de cumplimiento de ${company}, con el rol de ${role}.`,
    htmlIntro: (inviter: string, company: string, role: string) => `${inviter} te invitó a Monkey, la plataforma de cumplimiento de <strong>${company}</strong>, con el rol de <strong>${role}</strong>.`,
    yourCode: 'Este es tu código de activación:',
    once: (expires: string) => `Sirve una sola vez y vence el ${expires}.`,
    bulletOnce: (expires: string) => `Sirve <strong>una sola vez</strong> y vence el <strong>${expires}</strong>.`,
    toActivate: 'Para activar tu cuenta:',
    how: (email: string) => ['Abre Monkey y elige activar tu cuenta.', `Escribe este código, tu correo (${email}) y la contraseña que quieras usar.`, 'Configura tu segundo factor cuando te lo pida.'],
    monkey: 'Monkey:',
    codeLabel: 'Código de activación',
    button: 'Abrir Monkey',
    footnote: 'Si no esperabas esta invitación, ignora este mensaje: sin el código nadie puede entrar. Si piden un código nuevo, este deja de servir.',
  },
  en: {
    subject: (inviter: string) => `${inviter} invited you to Monkey`,
    heading: 'You were invited to Monkey',
    title: 'You were invited to Monkey',
    preheader: (inviter: string, company: string) => `${inviter} invited you to ${company}. Activate your account with this code.`,
    intro: (inviter: string, company: string, role: string) => `${inviter} invited you to Monkey, the compliance platform of ${company}, with the role of ${role}.`,
    htmlIntro: (inviter: string, company: string, role: string) => `${inviter} invited you to Monkey, the compliance platform of <strong>${company}</strong>, with the role of <strong>${role}</strong>.`,
    yourCode: 'This is your activation code:',
    once: (expires: string) => `It works only once and expires on ${expires}.`,
    bulletOnce: (expires: string) => `It works <strong>only once</strong> and expires on <strong>${expires}</strong>.`,
    toActivate: 'To activate your account:',
    how: (email: string) => ['Open Monkey and choose to activate your account.', `Enter this code, your email (${email}) and the password you want to use.`, 'Set up your second factor when asked.'],
    monkey: 'Monkey:',
    codeLabel: 'Activation code',
    button: 'Open Monkey',
    footnote: 'If you were not expecting this invitation, ignore this message: nobody can sign in without the code. If a new code is requested, this one stops working.',
  },
} as const;

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

// MD-190 · La invitación al equipo: el único canal por el que sale el código de activación (SEG-75). Marcada `confidential` para que ningún adaptador que registre
// mensajes escriba su cuerpo. No nombra al proveedor de la sonda ni del motor de nube. En español o inglés (D111).
export function buildInvitationEmail(input: InvitationEmailInput): MailMessage {
  const lang = input.language ?? 'es';
  const c = pick(lang, COPY);
  const role = ROLE_LABEL[lang][input.role] ?? input.role;
  const expires = formatUtc(input.expiresAt, lang);
  const how = c.how(input.to);
  const lines = [c.intro(input.inviterName, input.companyName, role), '', c.yourCode, '', `    ${input.code}`, '', c.once(expires), '', c.toActivate, ...how.map((l, i) => `${i + 1}. ${l}`)];
  if (input.appUrl) lines.push('', `${c.monkey} ${input.appUrl}`);
  lines.push('', c.footnote);

  const html = renderBrandEmail({
    lang,
    title: c.title,
    preheader: c.preheader(input.inviterName, input.companyName),
    heading: c.heading,
    introHtml: c.htmlIntro(escapeHtml(input.inviterName), escapeHtml(input.companyName), escapeHtml(role)),
    highlightHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed #046cc4;border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin-bottom:8px;">${c.codeLabel}</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#01264a;">${escapeHtml(input.code)}</div>
      </td></tr></table>`,
    button: input.appUrl ? { label: c.button, url: input.appUrl } : null,
    bulletsHtml: [c.bulletOnce(escapeHtml(expires)), ...how.map(escapeHtml)],
    footnote: c.footnote,
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: c.subject(input.inviterName), text: lines.join('\n'), html, confidential: true, ...inlineLogo() };
}
