import { Injectable, Logger } from '@nestjs/common';
import { AuditEntry, AuditLogWriter } from '../../common/audit/audit-log.writer';
import { PrismaService } from '../database/prisma.service';
import { insertAuditLog } from './audit-log.insert';

// Escritor de mejor esfuerzo, en su propia transacción: para lo que no acompaña a una acción revertible (intentos
// fallidos). Las acciones que cambian datos NO lo usan: pasan una `AuditIntent` al repositorio para que el rastro
// se escriba en la misma transacción que el efecto (SEG-36).
@Injectable()
export class AuditLogPrismaWriter extends AuditLogWriter {
  private readonly logger = new Logger(AuditLogPrismaWriter.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async write(entry: AuditEntry): Promise<void> {
    try {
      if (entry.tenantId) {
        await this.prisma.withScope(
          { companyId: entry.tenantId, userId: entry.userId ?? undefined },
          (tx) => insertAuditLog(tx, entry),
        );
      } else {
        await insertAuditLog(this.prisma, entry);
      }
    } catch (error) {
      // Un fallo del audit trail no puede tumbar el login, pero no se silencia.
      this.logger.error(`No se pudo escribir audit_logs (${entry.action})`, error as Error);
    }
  }
}
