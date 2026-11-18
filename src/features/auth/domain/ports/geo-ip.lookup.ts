import type { CityNames } from '../entities/trusted-device.entity';

export type GeoLocation = { country: string | null; city: CityNames | null };

// D123 · Ubica una IP con una base local: la IP nunca sale del Backend. Nunca lanza: sin base o sin resultado devuelve `null`.
export abstract class GeoIpLookup {
  abstract lookup(ipAddress: string): Promise<GeoLocation | null>;
}
