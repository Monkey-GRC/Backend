import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EvaluationPeriodRecord, EvaluationPeriodRepository } from '../../domain/repositories/evaluation-period.repository';

const SELECT = { id: true, periodStart: true, periodEnd: true, cutoffDate: true, framework: { select: { code: true } }, catalogVersion: { select: { number: true } } } as const;


@Injectable()
export class EvaluationPeriodPrismaRepository extends EvaluationPeriodRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  set(
    scope: TenantScope,
    serviceId: string,
    frameworkCode: string,
    period: { periodStart: Date; periodEnd: Date; cutoffDate: Date | null },
    audit: Parameters<EvaluationPeriodRepository['set']>[4],
  ): Promise<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // El servicio es de la empresa y el marco está contratado y activo en él; si no, no hay nada que encontrar (404, sin distinguir cuál faltó).
      const found = await tx.serviceFramework.findFirst({
        where: { serviceId, status: 'active', framework: { code: frameworkCode }, service: { organization: { companyId: scope.companyId } } },
        select: SELECT,
      });
      if (!found) return null;
      const record = (r: typeof found): EvaluationPeriodRecord => ({
        frameworkCode: r.framework.code, catalogVersion: r.catalogVersion.number, periodStart: r.periodStart, periodEnd: r.periodEnd, cutoffDate: r.cutoffDate,
      });
      const before = record(found);
      const row = await tx.serviceFramework.update({ where: { id: found.id }, data: { periodStart: period.periodStart, periodEnd: period.periodEnd, cutoffDate: period.cutoffDate }, select: SELECT });
      const after = record(row);
      await insertAuditLog(tx, audit({ before, after }));
      return { before, after };
    });
  }
}
