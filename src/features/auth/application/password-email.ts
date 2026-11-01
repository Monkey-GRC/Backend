import { escapeHtml, renderBrandEmail } from '../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../common/mail/brand-logo';
import type { MailMessage } from '../../../common/mail/mailer';

export type PasswordEmailKind = 'changed' | 'reset';

const inlineLogo = () => {
  const logo = loadBrandLogo();
  return logo ? { inlineImages: [logo] } : {};
};

// D101 · Los dos mensajes de la contraseña, con la misma plantilla de marca que la clave de acceso. Llevan lo mínimo para actuar y no nombran al proveedor del motor (SEG-39).
// Solo español por ahora. Ninguno lleva la contraseña; el del enlace lleva el token, que vive unos minutos y se gasta una vez. El logo viaja incrustado en el correo.
export function buildPasswordResetLinkEmail(input: { to: string; resetUrl: string; minutes: number }): MailMessage {
  const text = [
    'Pediste crear una contraseña nueva para tu cuenta de Monkey.',
    '',
    `Abre este enlace (sirve una sola vez y vence en ${input.minutes} minutos):`,
    input.resetUrl,
    '',
    'Para terminar te pediremos el código de tu app de autenticación.',
    '',
    'Si no fuiste tú, ignora este mensaje: sin el enlace nadie puede cambiar tu contraseña.',
  ].join('\n');
  const html = renderBrandEmail({
    title: 'Crea tu contraseña nueva de Monkey',
    preheader: 'Usa este enlace para crear una contraseña nueva. Vence pronto.',
    heading: 'Crea tu contraseña nueva',
    introHtml: 'Pediste crear una contraseña nueva para tu cuenta de Monkey. Usa el botón para elegirla.',
    button: { label: 'Crear contraseña nueva', url: input.resetUrl },
    bulletsHtml: [`El enlace sirve <strong>una sola vez</strong> y vence en <strong>${input.minutes} minutos</strong>.`, 'Para terminar te pediremos el código de tu app de autenticación.'],
    footnote: 'Si no fuiste tú, ignora este mensaje: sin el enlace nadie puede cambiar tu contraseña.',
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: 'Crea tu contraseña nueva de Monkey', text, html, ...inlineLogo() };
}

export function buildPasswordChangedEmail(input: { to: string; via: PasswordEmailKind }): MailMessage {
  const how = input.via === 'reset' ? 'Usaste el enlace de «¿Olvidaste tu contraseña?».' : 'La cambiaste desde la configuración de tu cuenta.';
  const text = [
    'La contraseña de tu cuenta de Monkey acaba de cambiar.',
    how,
    'Cerramos tus otras sesiones.',
    '',
    'Si no fuiste tú, pide una contraseña nueva desde «¿Olvidaste tu contraseña?» y avisa a quien administra tu cuenta.',
  ].join('\n');
  const html = renderBrandEmail({
    title: 'Cambió la contraseña de tu cuenta de Monkey',
    preheader: 'La contraseña de tu cuenta acaba de cambiar.',
    heading: 'Cambió la contraseña de tu cuenta',
    introHtml: `La contraseña de tu cuenta de Monkey acaba de cambiar. ${escapeHtml(how)}`,
    bulletsHtml: ['Cerramos tus otras sesiones abiertas.'],
    footnote: 'Si no fuiste tú, pide una contraseña nueva desde «¿Olvidaste tu contraseña?» y avisa a quien administra tu cuenta.',
    logoCid: loadBrandLogo() ? BRAND_LOGO_CID : null,
  });
  return { to: input.to, subject: 'Cambió la contraseña de tu cuenta de Monkey', text, html, ...inlineLogo() };
}
