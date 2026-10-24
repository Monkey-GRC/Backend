import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { DomainError } from '../../../../common/errors/domain-error';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EvaluationPeriodRecord, EvaluationPeriodRepository } from '../../domain/repositories/evaluation-period.repository';

const SELECT = { id: true, periodStart: true, periodEnd: true, cutoffDate: true, framework: { select: { code: true } }, catalogVersion: { select: { number: true } } } as const;

const sameDay = (a: Date | null, b: Date | null) => (a?.getTime() ?? null) === (b?.getTime() ?? null);
const samePeriod = (a: { periodStart: Date | null; periodEnd: Date | null; cutoffDate: Date | null }, b: { periodStart: Date; periodEnd: Date; cutoffDate: Date | null }) =>
  sameDay(a.periodStart, b.periodStart) && sameDay(a.periodEnd, b.periodEnd) && sameDay(a.cutoffDate, b.cutoffDate);

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
      // MD-155 · Con una evaluación del consultor o del auditor emitida sobre este período, ya no se cambia: dijeron sobre qué datos opinaron. Repetir lo mismo no cambia nada.
      if ((await tx.frameworkAssessment.count({ where: { serviceFrameworkId: found.id } })) > 0 && !samePeriod(found, period)) throw new DomainError('EVALUATION_ALREADY_ISSUED');
      const row = await tx.serviceFramework.update({ where: { id: found.id }, data: { periodStart: period.periodStart, periodEnd: period.periodEnd, cutoffDate: period.cutoffDate }, select: SELECT });
      const after = record(row);
      await insertAuditLog(tx, audit({ before, after }));
      return { before, after };
    });
  }
}
