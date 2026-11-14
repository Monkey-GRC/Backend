import { escapeHtml, renderBrandEmail } from '../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../common/mail/brand-logo';
import { formatUtc, MailLanguage, pick } from '../../../common/mail/mail-language';
import type { MailMessage } from '../../../common/mail/mailer';

export type AdminInvitationEmailInput = {
  to: string;
  inviterName: string | null;
  code: string;
  expiresAt: Date;
  // Dónde está Monkey Admin. Sin él, el correo no lleva enlace.
  appUrl: string | null;
  // D111 · El idioma de quien invita: quien recibe aún no tiene cuenta.
  language?: MailLanguage;
};

const COPY = {
  es: {
    inviter: 'Tu equipo',
    subject: (inviter: string) => `${inviter} te invitó a Monkey Admin`,
    heading: 'Te invitaron a Monkey Admin',
    preheader: (inviter: string) => `${inviter} te invitó a administrar Monkey. Activa tu cuenta con este código.`,
    intro: (inviter: string) => `${inviter} te invitó a administrar Monkey, con el rol de administrador de Monkey.`,
    htmlIntro: (inviter: string) => `${inviter} te invitó a administrar Monkey, con el rol de <strong>administrador de Monkey</strong>.`,
    yourCode: 'Este es tu código de activación:',
    once: (expires: string) => `Sirve una sola vez y vence el ${expires}.`,
    bulletOnce: (expires: string) => `Sirve <strong>una sola vez</strong> y vence el <strong>${expires}</strong>.`,
    toActivate: 'Para activar tu cuenta:',
    how: (email: string) => ['Abre Monkey Admin y elige activar tu cuenta.', `Escribe este código, tu correo (${email}) y la contraseña que quieras usar.`, 'Configura tu segundo factor cuando te lo pida.'],
    monkey: 'Monkey Admin:',
    codeLabel: 'Código de activación',
    button: 'Abrir Monkey Admin',
    footnote: 'Si no esperabas esta invitación, ignora este mensaje: sin el código nadie puede entrar. Si piden un código nuevo, este deja de servir.',
  },
  en: {
    inviter: 'Your team',
    subject: (inviter: string) => `${inviter} invited you to Monkey Admin`,
    heading: 'You were invited to Monkey Admin',
    preheader: (inviter: string) => `${inviter} invited you to manage Monkey. Activate your account with this code.`,
    intro: (inviter: string) => `${inviter} invited you to manage Monkey, with the role of Monkey administrator.`,
    htmlIntro: (inviter: string) => `${inviter} invited you to manage Monkey, with the role of <strong>Monkey administrator</strong>.`,
    yourCode: 'This is your activation code:',
    once: (expires: string) => `It works only once and expires on ${expires}.`,
    bulletOnce: (expires: string) => `It works <strong>only once</strong> and expires on <strong>${expires}</strong>.`,
    toActivate: 'To activate your account:',
    how: (email: string) => ['Open Monkey Admin and choose to activate your account.', `Enter this code, your email (${email}) and the password you want to use.`, 'Set up your second factor when asked.'],
    monkey: 'Monkey Admin:',
    codeLabel: 'Activation code',
    button: 'Open Monkey Admin',
    footnote: 'If you were not expecting this invitation, ignore this message: nobody can sign in without the code. If a new code is requested, this one stops working.',
  },
} as const;

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

// D117 · La invitación a otro administrador: el único canal por el que sale el código (SEG-75, SEG-80). `confidential` para que ningún adaptador escriba su cuerpo.
// No nombra al proveedor de la sonda ni del motor de nube.
export function buildAdminInvitationEmail(input: AdminInvitationEmailInput): MailMessage {
  const lang = input.language ?? 'es';
  const c = pick(lang, COPY);
  const inviter = input.inviterName ?? c.inviter;
  const expires = formatUtc(input.expiresAt, lang);
  const how = c.how(input.to);
  const lines = [c.intro(inviter), '', c.yourCode, '', `    ${input.code}`, '', c.once(expires), '', c.toActivate, ...how.map((l, i) => `${i + 1}. ${l}`)];
  if (input.appUrl) lines.push('', `${c.monkey} ${input.appUrl}`);
  lines.push('', c.footnote);

  const html = renderBrandEmail({
    lang,
    title: c.heading,
    preheader: c.preheader(inviter),
    heading: c.heading,
    introHtml: c.htmlIntro(escapeHtml(inviter)),
    highlightHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed #046cc4;border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin-bottom:8px;">${c.codeLabel}</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#01264a;">${escapeHtml(input.code)}</div>
      </td></tr></table>`,
    button: input.appUrl ? { label: c.button, url: input.appUrl } : null,
    bulletsHtml: [c.bulletOnce(escapeHtml(expires)), ...how.map(escapeHtml)],
    footnote: c.footnote,
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: c.subject(inviter), text: lines.join('\n'), html, confidential: true, ...inlineLogo() };
}
