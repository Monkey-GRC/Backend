import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CityNames, TrustedDevice } from '../entities/trusted-device.entity';

export type NewTrustedDevice = {
  userId: string;
  tokenHash: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  ipAddress: string;
  country: string | null;
  city: CityNames | null;
  createdAt: Date;
  expiresAt: Date;
};

// Lo que acompaña a la sesión en su misma transacción (D123): recordar el dispositivo que se acaba de verificar, o anotar el último ingreso de uno ya recordado.
export type DeviceEffect =
  | { kind: 'trust'; device: NewTrustedDevice; audit: AuditIntent<TrustedDevice> }
  | { kind: 'use'; deviceId: string; at: Date; ipAddress: string; country: string | null; city: CityNames | null };

// Lo que cierra la sesión (logout) lleva consigo el olvido del dispositivo de la cookie, si es de la misma persona.
export type DeviceForget = { tokenHash: string; audit: AuditIntent<TrustedDevice> };

export abstract class TrustedDeviceRepository {
  // Solo uno vigente (no vencido ni revocado) y de ESA persona: el scope ya viene de su contraseña o su sesión.
  abstract findActiveByTokenHash(scope: TenantScope, userId: string, tokenHash: string, now: Date): Promise<TrustedDevice | null>;

  // Cerrar sesión sin sesión (venció o no hay cookie de sesión): el dispositivo se halla solo por su huella y se revoca con su rastro, en una transacción. `false` si no hay uno vigente.
  abstract revokeByTokenHash(tokenHash: string, now: Date, audit: AuditIntent<TrustedDevice>): Promise<boolean>;

  // ¿Hay un dispositivo vigente con esa huella, de quien sea? La función de la base ya filtra vencidos y revocados. Solo para decidir si la cookie se borra al cerrar sesión; no devuelve datos.
  abstract existsActiveByTokenHash(tokenHash: string): Promise<boolean>;

  abstract listActive(scope: TenantScope, userId: string, now: Date): Promise<TrustedDevice[]>;

  // `null` si no existe, ya no está vigente o es de otra persona. Con `audit` en la misma transacción.
  abstract revokeOne(scope: TenantScope, userId: string, deviceId: string, now: Date, audit: AuditIntent<TrustedDevice>): Promise<TrustedDevice | null>;

  // Devuelve cuántos olvidó; el rastro solo se escribe si fueron más de cero.
  abstract revokeAll(scope: TenantScope, userId: string, now: Date, audit: AuditIntent<{ count: number }>): Promise<number>;
}
