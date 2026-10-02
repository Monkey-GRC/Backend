import { Global, Module } from '@nestjs/common';
import { AuditLogWriter } from '../../common/audit/audit-log.writer';
import { AuditLogPrismaWriter } from './audit-log.prisma.writer';

@Global()
@Module({
  providers: [{ provide: AuditLogWriter, useClass: AuditLogPrismaWriter }],
  exports: [AuditLogWriter],
})
export class AuditModule {}
