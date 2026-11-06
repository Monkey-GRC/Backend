import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

const logger = new Logger('AppUrl');

// Una dirección de app (PLATFORM_APP_URL, ADMIN_APP_URL) que va a un enlace de correo: debe ser http(s). Sin valor → undefined, sin ruido. Un valor inválido (sin esquema,
// `javascript:`, con espacios…) también devuelve undefined —el correo sale sin enlace en vez de llevar uno roto o peligroso— y deja un aviso, sin el valor. Sin barras al final.
export function appUrl(config: ConfigService, key: string): string | undefined {
  const raw = config.get<string>(key)?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname && !/\s/.test(raw)) return raw.replace(/\/+$/, '');
  } catch {
    // cae al aviso de abajo
  }
  logger.warn(`${key} no es una dirección http(s) válida: los correos salen sin enlace.`);
  return undefined;
}

export const platformAppUrl = (config: ConfigService): string | undefined => appUrl(config, 'PLATFORM_APP_URL');
