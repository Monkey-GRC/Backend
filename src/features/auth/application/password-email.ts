import { escapeHtml, renderBrandEmail } from '../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../common/mail/brand-logo';
import { MailLanguage, pick } from '../../../common/mail/mail-language';
import type { MailMessage } from '../../../common/mail/mailer';

export type PasswordEmailKind = 'changed' | 'reset';

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

const RESET = {
  es: {
    subject: 'Crea tu contraseña nueva de Monkey',
    preheader: 'Usa este enlace para crear una contraseña nueva. Vence pronto.',
    heading: 'Crea tu contraseña nueva',
    asked: 'Pediste crear una contraseña nueva para tu cuenta de Monkey.',
    htmlIntro: 'Pediste crear una contraseña nueva para tu cuenta de Monkey. Usa el botón para elegirla.',
    open: (minutes: number) => `Abre este enlace (sirve una sola vez y vence en ${minutes} minutos):`,
    finish: 'Para terminar te pediremos el código de tu app de autenticación.',
    button: 'Crear contraseña nueva',
    bulletOnce: (minutes: number) => `El enlace sirve <strong>una sola vez</strong> y vence en <strong>${minutes} minutos</strong>.`,
    footnote: 'Si no fuiste tú, ignora este mensaje: sin el enlace nadie puede cambiar tu contraseña.',
  },
  en: {
    subject: 'Create your new Monkey password',
    preheader: 'Use this link to create a new password. It expires soon.',
    heading: 'Create your new password',
    asked: 'You asked to create a new password for your Monkey account.',
    htmlIntro: 'You asked to create a new password for your Monkey account. Use the button to choose it.',
    open: (minutes: number) => `Open this link (it works only once and expires in ${minutes} minutes):`,
    finish: 'To finish, we will ask for the code from your authenticator app.',
    button: 'Create new password',
    bulletOnce: (minutes: number) => `The link works <strong>only once</strong> and expires in <strong>${minutes} minutes</strong>.`,
    footnote: 'If it was not you, ignore this message: nobody can change your password without the link.',
  },
} as const;

const CHANGED = {
  es: {
    subject: 'Cambió la contraseña de tu cuenta de Monkey',
    preheader: 'La contraseña de tu cuenta acaba de cambiar.',
    heading: 'Cambió la contraseña de tu cuenta',
    changed: 'La contraseña de tu cuenta de Monkey acaba de cambiar.',
    viaReset: 'Usaste el enlace de «¿Olvidaste tu contraseña?».',
    viaChange: 'La cambiaste desde la configuración de tu cuenta.',
    closed: 'Cerramos tus otras sesiones.',
    closedBullet: 'Cerramos tus otras sesiones abiertas.',
    footnote: 'Si no fuiste tú, pide una contraseña nueva desde «¿Olvidaste tu contraseña?» y avisa a quien administra tu cuenta.',
  },
  en: {
    subject: 'Your Monkey account password changed',
    preheader: 'Your account password has just changed.',
    heading: 'Your account password changed',
    changed: 'The password of your Monkey account has just changed.',
    viaReset: 'You used the "Forgot your password?" link.',
    viaChange: 'You changed it from your account settings.',
    closed: 'We signed out your other sessions.',
    closedBullet: 'We signed out your other open sessions.',
    footnote: 'If it was not you, ask for a new password from "Forgot your password?" and tell whoever manages your account.',
  },
} as const;

// D101 · Los dos mensajes de la contraseña, con la misma plantilla de marca que la clave de acceso. Llevan lo mínimo para actuar y no nombran al proveedor del motor (SEG-39).
// En el idioma guardado de la persona (D111). Ninguno lleva la contraseña; el del enlace lleva el token, que vive unos minutos y se gasta una vez. El logo viaja incrustado en el correo.
export function buildPasswordResetLinkEmail(input: { to: string; resetUrl: string; minutes: number; language?: MailLanguage }): MailMessage {
  const lang = input.language ?? 'es';
  const c = pick(lang, RESET);
  const text = [c.asked, '', c.open(input.minutes), input.resetUrl, '', c.finish, '', c.footnote].join('\n');
  const html = renderBrandEmail({
    lang,
    title: c.subject,
    preheader: c.preheader,
    heading: c.heading,
    introHtml: c.htmlIntro,
    button: { label: c.button, url: input.resetUrl },
    bulletsHtml: [c.bulletOnce(input.minutes), c.finish],
    footnote: c.footnote,
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: c.subject, text, html, ...inlineLogo() };
}

export function buildPasswordChangedEmail(input: { to: string; via: PasswordEmailKind; language?: MailLanguage }): MailMessage {
  const lang = input.language ?? 'es';
  const c = pick(lang, CHANGED);
  const how = input.via === 'reset' ? c.viaReset : c.viaChange;
  const text = [c.changed, how, c.closed, '', c.footnote].join('\n');
  const html = renderBrandEmail({
    lang,
    title: c.subject,
    preheader: c.preheader,
    heading: c.heading,
    introHtml: `${escapeHtml(c.changed)} ${escapeHtml(how)}`,
    bulletsHtml: [c.closedBullet],
    footnote: c.footnote,
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: c.subject, text, html, ...inlineLogo() };
}
