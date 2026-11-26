import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Language } from './notification';
import type { Translate } from './notification-text';

// Solo lo usan las pruebas: un traductor que lee los archivos de i18n de verdad (`i18n/<lang>/notification.json`), como lo hace nestjs-i18n: la clave `notification.a.b` y `{arg}` sustituido; una
// clave que no existe devuelve la clave.
export const I18N_FILES: Record<Language, Record<string, unknown>> = {
  es: JSON.parse(readFileSync(join(process.cwd(), 'i18n', 'es', 'notification.json'), 'utf8')) as Record<string, unknown>,
  en: JSON.parse(readFileSync(join(process.cwd(), 'i18n', 'en', 'notification.json'), 'utf8')) as Record<string, unknown>,
};

const PARAMETER_FILES: Record<Language, Record<string, unknown>> = {
  es: JSON.parse(readFileSync(join(process.cwd(), 'i18n', 'es', 'evaluation_parameter.json'), 'utf8')) as Record<string, unknown>,
  en: JSON.parse(readFileSync(join(process.cwd(), 'i18n', 'en', 'evaluation_parameter.json'), 'utf8')) as Record<string, unknown>,
};

export const translatorFor =
  (lang: Language): Translate =>
  (key, args) => {
    const [namespace, ...path] = key.split('.');
    const file = namespace === 'notification' ? I18N_FILES[lang] : namespace === 'evaluation_parameter' ? PARAMETER_FILES[lang] : {};
    const value = path.reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], file);
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (_, name: string) => String(args?.[name] ?? `{${name}}`));
  };
