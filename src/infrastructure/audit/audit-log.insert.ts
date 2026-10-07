import { Prisma } from '../../../generated/prisma/client';
import { AuditEntry } from '../../common/audit/audit-log.writer';
import { PrismaService, TransactionClient } from '../database/prisma.service';

// Inserta una fila de audit_logs con el cliente que se le dé: el de una transacción abierta (la forma que garantiza
// que la acción y su rastro se confirman o se revierten juntos, SEG-36) o el cliente suelto (intentos fallidos).
//
// createMany, no create: un INSERT … RETURNING exige pasar también la política de lectura, y una acción de
// plataforma sin tenant no la pasa (schema-implementacion.md §5, excepción 5).
export async function insertAuditLog(
  db: TransactionClient | PrismaService,
  entry: AuditEntry | AuditEntry[],
): Promise<void> {
  const entries = Array.isArray(entry) ? entry : [entry];
  await db.auditLog.createMany({
    data: entries.map((e) => ({
      tenantId: e.tenantId,
      userId: e.userId,
      attemptedEmail: e.attemptedEmail ?? null,
      action: e.action,
      resource: e.resource,
      result: e.result,
      ipAddress: e.ipAddress,
      userAgent: e.userAgent,
      beforeState: (e.beforeState as Prisma.InputJsonObject | undefined) ?? Prisma.DbNull,
      afterState: (e.afterState as Prisma.InputJsonObject | undefined) ?? Prisma.DbNull,
    })),
  });
}
