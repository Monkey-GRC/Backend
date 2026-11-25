import { escapeHtml, renderBrandEmail } from '../../../../common/mail/brand-email';
import { BRAND_LOGO_CID, loadBrandLogo } from '../../../../common/mail/brand-logo';
import type { MailMessage } from '../../../../common/mail/mailer';
import type { Language } from '../../domain/notification';
import { formatDay, type Translate } from '../../domain/notification-text';

// D143, D151 · El resumen diario por correo: una línea por aviso (su título, que lleva el código del control, y el servicio), máximo 20 con «y N más», un botón a la campana y cómo apagarlo.
// Los textos salen de i18n (`notification.digest.*`) en el idioma de la persona. El título de cada aviso ya viene traducido y limpio de proveedor (SEG-39); el cuerpo nunca se registra.
export type DigestLine = { title: string; serviceName: string | null };

export type DigestEmailInput = { to: string; lang: Language; date: string; lines: readonly DigestLine[]; total: number; appUrl: string | undefined };

const lineText = (l: DigestLine) => (l.serviceName ? `${l.title} · ${l.serviceName}` : l.title);

export function buildDigestEmail(input: DigestEmailInput, t: Translate): MailMessage {
  const { lang, total } = input;
  const date = formatDay(input.date, lang);
  const key = (name: string) => `notification.digest.${name}`;
  const one = total === 1;
  const subject = t(key(one ? 'subject_one' : 'subject'), { count: total, date });
  const heading = t(key(one ? 'heading_one' : 'heading'), { count: total });
  const more = total > input.lines.length ? t(key('more'), { more: total - input.lines.length }) : null;
  const intro = t(key('intro'));
  const footnote = t(key('footnote'));
  const button = t(key('button'));

  const text = [heading, '', intro, ...input.lines.map((l) => `- ${lineText(l)}`), ...(more ? [`- ${more}`] : []), '', ...(input.appUrl ? [`${button}: ${input.appUrl}`, ''] : []), footnote].join('\n');
  const logo = loadBrandLogo();
  const html = renderBrandEmail({
    title: subject,
    preheader: t(key('preheader')),
    heading,
    introHtml: escapeHtml(intro),
    button: input.appUrl ? { label: button, url: input.appUrl } : null,
    bulletsHtml: [...input.lines.map((l) => escapeHtml(lineText(l))), ...(more ? [escapeHtml(more)] : [])],
    footnote,
    logoCid: logo ? BRAND_LOGO_CID : null,
    lang,
  });
  return { to: input.to, subject, text, html, ...(logo ? { inlineImages: [logo] } : {}) };
}
