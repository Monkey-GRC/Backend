import { formatUtc, mailLanguageOf, pick } from './mail-language';

const date = new Date(Date.UTC(2026, 10, 5, 14, 3));

describe('idioma de los correos (D111)', () => {
  it('cualquier valor se reduce a es o en; lo desconocido sale en español', () => {
    expect([undefined, null, '', 'es', 'es-CO', 'fr', 'en', 'EN-us', ' en '].map(mailLanguageOf)).toEqual(['es', 'es', 'es', 'es', 'es', 'es', 'en', 'en', 'en']);
  });

  it('las fechas siguen el idioma y siempre dicen UTC', () => {
    expect(formatUtc(date, 'es')).toBe('05/11/2026 14:03 UTC');
    expect(formatUtc(date, 'en')).toBe('Nov 5, 2026, 14:03 UTC');
  });

  it('pick elige el texto del idioma', () => {
    expect(pick('en', { es: 'hola', en: 'hello' })).toBe('hello');
    expect(pick('es', { es: 'hola', en: 'hello' })).toBe('hola');
  });
});
