import { Prisma } from '../../../../../generated/prisma/client';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { TrustedDevice } from '../../domain/entities/trusted-device.entity';
import { toTrustedDevice } from './trusted-device.mapper';

// D123 · Revoca UN dispositivo aún no revocado que cumpla `where`. `null` si no hubo cambio (otra petición llegó primero): quien llama escribe el rastro solo si devuelve el dispositivo.
export async function revokeActiveDevice(tx: TransactionClient, where: Prisma.TrustedDeviceWhereInput, at: Date): Promise<TrustedDevice | null> {
  const found = await tx.trustedDevice.findFirst({ where: { ...where, revokedAt: null } });
  if (!found) return null;
  const done = await tx.trustedDevice.updateMany({ where: { id: found.id, revokedAt: null }, data: { revokedAt: at } });
  return done.count === 0 ? null : toTrustedDevice({ ...found, revokedAt: at });
}
