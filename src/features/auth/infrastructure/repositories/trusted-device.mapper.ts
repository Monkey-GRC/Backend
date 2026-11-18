import { deviceTypeOfOs, DeviceType } from '../../domain/user-agent';
import { CityNames, TrustedDevice } from '../../domain/entities/trusted-device.entity';

type DeviceRow = {
  id: string;
  companyId: string;
  userId: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  ipAddress: string;
  country: string | null;
  city: unknown;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

const toCity = (value: unknown): CityNames | null => {
  if (!value || typeof value !== 'object') return null;
  const names = value as Record<string, unknown>;
  const pick = (key: string) => (typeof names[key] === 'string' ? (names[key] as string) : null);
  return { es: pick('es'), en: pick('en') };
};

const TYPES: readonly string[] = ['computer', 'mobile', 'tablet'];
// Las filas anteriores a `device_type` lo deducen del sistema guardado.
const toDeviceType = (row: DeviceRow): DeviceType | null => (row.deviceType && TYPES.includes(row.deviceType) ? (row.deviceType as DeviceType) : deviceTypeOfOs(row.os));

export const toTrustedDevice = (row: DeviceRow): TrustedDevice =>
  new TrustedDevice(row.id, row.companyId, row.userId, row.browser, row.os, toDeviceType(row), row.ipAddress, row.country?.trim() || null, toCity(row.city), row.createdAt, row.expiresAt, row.lastUsedAt, row.revokedAt);
