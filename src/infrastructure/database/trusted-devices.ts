import type { TransactionClient } from './prisma.service';

// D123, SEG-84 · Todo cambio que invalida la identidad de la persona (contraseña, segundo factor, baja de la cuenta o de la empresa) olvida sus dispositivos recordados EN LA MISMA
// transacción que lo provoca. Un solo lugar, para que ningún punto se quede sin hacerlo. Devuelve cuántos olvidó.
export async function revokeTrustedDevices(tx: TransactionClient, where: { userId: string } | { companyId: string }, at: Date): Promise<number> {
  const revoked = await tx.trustedDevice.updateMany({ where: { ...where, revokedAt: null }, data: { revokedAt: at } });
  return revoked.count;
}
