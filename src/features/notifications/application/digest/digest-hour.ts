import type { ConfigService } from '@nestjs/config';

const DEFAULT_DIGEST_HOUR_UTC = 12;

/** La hora (UTC) desde la que sale el resumen diario (`NOTIFICATION_DIGEST_HOUR_UTC`, 12 por omisión). Un valor que no es un entero de 0 a 23 es un error de configuración: no se corrige en silencio. */
export function digestHourUtc(config: ConfigService): number {
  const raw = config.get<string>('NOTIFICATION_DIGEST_HOUR_UTC')?.trim();
  if (!raw) return DEFAULT_DIGEST_HOUR_UTC;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 23) throw new Error('NOTIFICATION_DIGEST_HOUR_UTC debe ser un entero entre 0 y 23');
  return value;
}
