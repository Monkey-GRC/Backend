import { escapeHtml, renderBrandEmail } from '../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../common/mail/brand-logo';
import { formatUtc, MailLanguage, pick } from '../../../common/mail/mail-language';
import type { MailMessage } from '../../../common/mail/mailer';

export type AccessKeyEmailInput = {
  companyName: string;
  adminEmail: string;
  code: string;
  expiresAt: Date;
  // Dónde se canjea (Monkey Platform). Sin él, el correo no lleva enlace.
  redeemUrl: string | null;
  // D111 · El idioma de quien registra la empresa (su `Accept-Language`): quien recibe la clave aún no tiene cuenta.
  language?: MailLanguage;
};

// El texto de cada idioma. `strong` marca lo que el HTML resalta.
const COPY = {
  es: {
    subject: 'Tu clave de acceso a Monkey',
    heading: 'Tu clave de acceso',
    preheader: (company: string) => `Tu clave de acceso para crear la cuenta de ${company}.`,
    intro: (company: string) => `Monkey registró a ${company}. Esta es la clave de acceso para crear la cuenta del administrador de la empresa:`,
    htmlIntro: (company: string) => `Monkey registró a <strong>${company}</strong>. Usa esta clave para crear la cuenta del administrador de la empresa.`,
    use: (email: string, expires: string) => `Úsala una sola vez, con este mismo correo (${email}). Vence el ${expires}.`,
    activateHere: 'Actívala aquí:',
    codeLabel: 'Clave de acceso',
    button: 'Activar mi cuenta',
    bulletOnce: (email: string) => `Úsala <strong>una sola vez</strong>, con este mismo correo (${email}).`,
    bulletExpires: (expires: string) => `Vence el <strong>${expires}</strong>.`,
    footnote: 'Si no esperabas este mensaje, ignóralo: sin la clave nadie puede entrar. Si pides una clave nueva, esta deja de servir.',
  },
  en: {
    subject: 'Your Monkey access key',
    heading: 'Your access key',
    preheader: (company: string) => `Your access key to create the account for ${company}.`,
    intro: (company: string) => `Monkey registered ${company}. This is the access key to create the company administrator's account:`,
    htmlIntro: (company: string) => `Monkey registered <strong>${company}</strong>. Use this key to create the company administrator's account.`,
    use: (email: string, expires: string) => `Use it only once, with this same email (${email}). It expires on ${expires}.`,
    activateHere: 'Activate it here:',
    codeLabel: 'Access key',
    button: 'Activate my account',
    bulletOnce: (email: string) => `Use it <strong>only once</strong>, with this same email (${email}).`,
    bulletExpires: (expires: string) => `It expires on <strong>${expires}</strong>.`,
    footnote: 'If you were not expecting this message, ignore it: nobody can sign in without the key. If a new key is requested, this one stops working.',
  },
} as const;

// D99 · El mensaje que lleva la clave de acceso al administrador de la empresa. Lleva lo mínimo para actuar y no nombra al proveedor del motor (SEG-39). En español o inglés (D111).
export function buildAccessKeyEmail(input: AccessKeyEmailInput): MailMessage {
  const lang = input.language ?? 'es';
  const c = pick(lang, COPY);
  const expires = formatUtc(input.expiresAt, lang);
  const lines = [c.intro(input.companyName), '', `    ${input.code}`, '', c.use(input.adminEmail, expires)];
  if (input.redeemUrl) lines.push('', `${c.activateHere} ${input.redeemUrl}`);
  lines.push('', c.footnote);
  return { to: input.adminEmail, subject: c.subject, text: lines.join('\n'), html: buildHtml(input, lang), ...inlineLogo() };
}

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

function buildHtml(input: AccessKeyEmailInput, lang: MailLanguage): string {
  const c = pick(lang, COPY);
  const company = escapeHtml(input.companyName);
  return renderBrandEmail({
    lang,
    title: c.subject,
    preheader: c.preheader(input.companyName),
    heading: c.heading,
    introHtml: c.htmlIntro(company),
    highlightHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf1ff;border:1px dashed #046cc4;border-radius:12px;"><tr><td align="center" style="padding:22px 12px;">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#667085;margin-bottom:8px;">${c.codeLabel}</div>
        <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#01264a;">${escapeHtml(input.code)}</div>
      </td></tr></table>`,
    button: input.redeemUrl ? { label: c.button, url: input.redeemUrl } : null,
    bulletsHtml: [c.bulletOnce(escapeHtml(input.adminEmail)), c.bulletExpires(escapeHtml(formatUtc(input.expiresAt, lang)))],
    footnote: c.footnote,
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
}
