// D111 · El idioma de un correo. Quien lo recibe lo tiene guardado (`users.preferred_language`) o, si aún no tiene cuenta, es el de quien lo envía (su `Accept-Language`).
export type MailLanguage = 'es' | 'en';

/** Cualquier valor (`en`, `en-US`, `es-CO`, nada) al idioma del correo; lo desconocido sale en español. */
export const mailLanguageOf = (raw: string | null | undefined): MailLanguage => (raw?.trim().toLowerCase().startsWith('en') ? 'en' : 'es');

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * La fecha de un correo, siempre en UTC (el correo no sabe en qué zona está quien lo lee, así que dice cuál usa):
 * `es` «dd/mm/aaaa hh:mm UTC» · `en` «Nov 12, 2026, 14:03 UTC».
 */
export function formatUtc(date: Date, lang: MailLanguage): string {
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  if (lang === 'en') return `${MONTHS_EN[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}, ${time} UTC`;
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${time} UTC`;
}

/** El texto de cada idioma, con el español de respaldo. */
export const pick = <ES, EN>(lang: MailLanguage, texts: { es: ES; en: EN }): ES | EN => (lang === 'en' ? texts.en : texts.es);
