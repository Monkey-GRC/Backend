import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { statSync } from 'node:fs';
import { isIP } from 'node:net';
import { open, type CityResponse, type Reader } from 'maxmind';
import { GeoIpLookup, GeoLocation } from '../../domain/ports/geo-ip.lookup';

import { normalizeIp } from '../../../../common/http/client-ip';

const isPrivate = (ip: string): boolean => {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127);
  }
  const v6 = ip.toLowerCase();
  return v6 === '::1' || v6 === '::' || v6.startsWith('fe80') || v6.startsWith('fc') || v6.startsWith('fd');
};

// D123 · Base local GeoLite2-City (MaxMind): la IP nunca sale del Backend. Carga perezosa; sin archivo, sin resultado o con una IP privada devuelve `null`
// (un solo aviso por proceso) y nunca rompe el ingreso. Como mucho una vez por hora comprueba la fecha del archivo y, si cambió (actualización
// semanal por cron), lo vuelve a abrir sin reiniciar el Backend.
const RECHECK_MS = 60 * 60 * 1000;

@Injectable()
export class MaxmindGeoIpLookup extends GeoIpLookup {
  private readonly logger = new Logger(MaxmindGeoIpLookup.name);
  private reader: Promise<Reader<CityResponse> | null> | null = null;
  private warned = false;
  private checkedAt = 0;
  private loadedMtime: number | null = null;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async lookup(ipAddress: string): Promise<GeoLocation | null> {
    try {
      const ip = normalizeIp(ipAddress);
      if (!isIP(ip) || isPrivate(ip)) return null;
      const reader = await this.load();
      const found = reader?.get(ip);
      if (!found) return null;
      const country = found.country?.iso_code ?? null;
      const city = found.city?.names ? { es: found.city.names['es'] ?? found.city.names['en'] ?? null, en: found.city.names['en'] ?? null } : null;
      return { country, city };
    } catch (error) {
      this.warnOnce(`No se pudo ubicar la IP: ${error instanceof Error ? error.message : 'error desconocido'}`);
      return null;
    }
  }

  private load(): Promise<Reader<CityResponse> | null> {
    const now = Date.now();
    if (this.reader && now - this.checkedAt < RECHECK_MS) return this.reader;
    this.checkedAt = now;
    const path = this.config.get<string>('GEOIP_DB_PATH')?.trim() || 'geoip/GeoLite2-City.mmdb';
    const mtime = this.mtimeOf(path);
    if (!this.reader || mtime !== this.loadedMtime) {
      const previous = this.reader;
      this.loadedMtime = mtime;
      this.reader = this.openDatabase(path, mtime).then(async (opened) => opened ?? (previous ? await previous : null));
    }
    return this.reader;
  }

  private mtimeOf(path: string): number | null {
    try {
      return statSync(path).mtimeMs;
    } catch {
      return null;
    }
  }

  private async openDatabase(path: string, mtime: number | null): Promise<Reader<CityResponse> | null> {
    if (mtime === null) {
      this.warnOnce(`GeoIP: no está la base ${path}; país y ciudad de los dispositivos quedan vacíos (npm run geoip:update)`);
      return null;
    }
    try {
      return await open<CityResponse>(path);
    } catch (error) {
      this.warnOnce(`GeoIP: no se pudo abrir ${path}: ${error instanceof Error ? error.message : 'error desconocido'}`);
      return null;
    }
  }

  private warnOnce(message: string): void {
    if (this.warned) return;
    this.warned = true;
    this.logger.warn(message);
  }
}
