import type { DeviceType } from '../user-agent';

// D123 · Un navegador que la persona marcó como «recordar por 30 días»: salta el código del segundo factor, nunca la contraseña.
export const TRUSTED_DEVICE_DAYS = 30;

export type CityNames = { es: string | null; en: string | null };

export class TrustedDevice {
  constructor(
    readonly id: string,
    readonly companyId: string,
    readonly userId: string,
    readonly browser: string | null,
    readonly os: string | null,
    readonly deviceType: DeviceType | null,
    readonly ipAddress: string,
    readonly country: string | null,
    readonly city: CityNames | null,
    readonly createdAt: Date,
    readonly expiresAt: Date,
    readonly lastUsedAt: Date | null,
    readonly revokedAt: Date | null,
  ) {}

  isActive(now: Date): boolean {
    return !this.revokedAt && this.expiresAt.getTime() > now.getTime();
  }

  static expiresAtFor(createdAt: Date): Date {
    return new Date(createdAt.getTime() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);
  }

  cityIn(language: 'es' | 'en'): string | null {
    return this.city?.[language] ?? this.city?.es ?? this.city?.en ?? null;
  }
}
