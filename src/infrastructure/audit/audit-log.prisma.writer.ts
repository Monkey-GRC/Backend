import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { AuditEntry, AuditLogWriter } from '../../common/audit/audit-log.writer';
import { PrismaService, TransactionClient } from '../database/prisma.service';

@Injectable()
export class AuditLogPrismaWriter extends AuditLogWriter {
  private readonly logger = new Logger(AuditLogPrismaWriter.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async write(entry: AuditEntry): Promise<void> {
    // createMany, no create: un INSERT … RETURNING exige pasar también la política de lectura,
    // y una acción sin tenant no la pasa (schema-implementacion.md §5, excepción 5).
    const insert = (db: TransactionClient | PrismaService) =>
      db.auditLog.createMany({
        data: [
          {
            tenantId: entry.tenantId,
            userId: entry.userId,
            attemptedEmail: entry.attemptedEmail ?? null,
            action: entry.action,
            resource: entry.resource,
            result: entry.result,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            beforeState: (entry.beforeState as Prisma.InputJsonObject | undefined) ?? Prisma.DbNull,
            afterState: (entry.afterState as Prisma.InputJsonObject | undefined) ?? Prisma.DbNull,
          },
        ],
      });

    try {
      if (entry.tenantId) {
        await this.prisma.withScope(
          { companyId: entry.tenantId, userId: entry.userId ?? undefined },
          (tx) => insert(tx),
        );
      } else {
        await insert(this.prisma);
      }
    } catch (error) {
      // Un fallo del audit trail no puede tumbar el login, pero no se silencia.
      this.logger.error(`No se pudo escribir audit_logs (${entry.action})`, error as Error);
    }
  }
}
