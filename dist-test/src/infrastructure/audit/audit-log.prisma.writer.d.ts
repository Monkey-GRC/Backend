import { AuditEntry, AuditLogWriter } from '../../common/audit/audit-log.writer';
import { PrismaService } from '../database/prisma.service';
export declare class AuditLogPrismaWriter extends AuditLogWriter {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    write(entry: AuditEntry): Promise<void>;
}
