import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { isIP } from 'node:net';
import { open, type CityResponse, type Reader } from 'maxmind';
import { GeoIpLookup, GeoLocation } from '../../domain/ports/geo-ip.lookup';

const isPrivate = (ip: string): boolean => {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127);
  }
  const v6 = ip.toLowerCase();
  return v6 === '::1' || v6 === '::' || v6.startsWith('fe80') || v6.startsWith('fc') || v6.startsWith('fd');
};

// D123 · Base local GeoLite2-City (MaxMind): la IP nunca sale del Backend. Carga perezosa; sin archivo, sin resultado o con una IP privada devuelve `null`
// (un solo aviso por proceso) y nunca rompe el ingreso.
@Injectable()
export class MaxmindGeoIpLookup extends GeoIpLookup {
  private readonly logger = new Logger(MaxmindGeoIpLookup.name);
  private reader: Promise<Reader<CityResponse> | null> | null = null;
  private warned = false;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async lookup(ipAddress: string): Promise<GeoLocation | null> {
    try {
      const ip = ipAddress.startsWith('::ffff:') ? ipAddress.slice(7) : ipAddress;
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
    this.reader ??= this.openDatabase();
    return this.reader;
  }

  private async openDatabase(): Promise<Reader<CityResponse> | null> {
    const path = this.config.get<string>('GEOIP_DB_PATH')?.trim() || 'geoip/GeoLite2-City.mmdb';
    if (!existsSync(path)) {
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
