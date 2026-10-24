import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { effectiveCutoff, isPeriodDefined } from '../../domain/evaluation-period';
import { AssessmentFilters, AssessmentRecord, FrameworkAssessmentRepository, NewAssessment } from '../../domain/repositories/framework-assessment.repository';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
const ASSESSMENT = { id: true, serviceFrameworkId: true, assessorRole: true, verdict: true, rationale: true, issuedAt: true, issuedByUser: PERSON } as const;
const FRAMEWORK = (frameworkCode: string, companyId: string, serviceId: string) =>
  ({ serviceId, status: 'active', framework: { code: frameworkCode }, service: { organization: { companyId } } }) as const;
const FRAMEWORK_SELECT = { id: true, serviceId: true, periodStart: true, periodEnd: true, cutoffDate: true, framework: { select: { code: true } }, catalogVersion: { select: { number: true } } } as const;
type FrameworkRow = { id: string; serviceId: string; periodStart: Date | null; periodEnd: Date | null; cutoffDate: Date | null; framework: { code: string }; catalogVersion: { number: number } };
type AssessmentRow = { id: string; assessorRole: AssessmentRecord['assessorRole']; verdict: AssessmentRecord['verdict']; rationale: string; issuedAt: Date; issuedByUser: { id: string; name: string | null; lastName: string | null } };

const toRecord = (fw: FrameworkRow, a: AssessmentRow, isCurrent: boolean): AssessmentRecord => ({
  id: a.id, serviceId: fw.serviceId, frameworkCode: fw.framework.code, assessorRole: a.assessorRole, verdict: a.verdict, rationale: a.rationale,
  // Una evaluación solo se emite con el período definido y la fecha de corte congelada: no son nulos.
  evaluation: { catalogVersion: fw.catalogVersion.number, periodStart: fw.periodStart!, periodEnd: fw.periodEnd!, cutoffDate: fw.cutoffDate! },
  issuedBy: { id: a.issuedByUser.id, name: a.issuedByUser.name ?? '', lastName: a.issuedByUser.lastName ?? '' }, issuedAt: a.issuedAt, isCurrent,
});

@Injectable()
export class FrameworkAssessmentPrismaRepository extends FrameworkAssessmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  issue(scope: TenantScope, serviceId: string, frameworkCode: string, input: NewAssessment, audit: Parameters<FrameworkAssessmentRepository['issue']>[4]): Promise<AssessmentRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.serviceFramework.findFirst({ where: FRAMEWORK(frameworkCode, scope.companyId, serviceId), select: FRAMEWORK_SELECT });
      if (!found) return null;
      // Sin período no hay evaluación: no se ejecuta ni se emite sobre ella (REQ-004, D87).
      if (!isPeriodDefined(found)) throw new DomainError('EVALUATION_NOT_DEFINED');

      // Emitir congela la fecha de corte: la evaluación dice sobre qué datos se hizo, y «hoy» cambiaría mañana.
      let framework: FrameworkRow = found;
      if (!found.cutoffDate) {
        const cutoff = effectiveCutoff(found, input.today)!.date;
        framework = await tx.serviceFramework.update({ where: { id: found.id }, data: { cutoffDate: cutoff }, select: FRAMEWORK_SELECT });
      }
      const row = await tx.frameworkAssessment.create({
        data: { tenantId: scope.companyId, serviceFrameworkId: found.id, assessorRole: input.assessorRole, verdict: input.verdict, rationale: input.rationale, issuedBy: input.issuedBy },
        select: ASSESSMENT,
      });
      const record = toRecord(framework, row, true);
      await insertAuditLog(tx, audit(record));
      return record;
    });
  }

  list(scope: TenantScope, serviceId: string, frameworkCode: string, filters: AssessmentFilters, page: number, pageSize: number): Promise<Page<AssessmentRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const framework = await tx.serviceFramework.findFirst({ where: FRAMEWORK(frameworkCode, scope.companyId, serviceId), select: FRAMEWORK_SELECT });
      if (!framework) return null;
      const all = await this.assessmentsOf(tx, framework.id);
      // La vigente es la última de ese rol sobre esta evaluación del servicio.
      const currentOf = new Map<string, string>();
      for (const a of all) if (!currentOf.has(a.assessorRole)) currentOf.set(a.assessorRole, a.id);
      const visible = all
        .filter((a) => (filters.assessorRole ? a.assessorRole === filters.assessorRole : true))
        .filter((a) => (filters.current ? currentOf.get(a.assessorRole) === a.id : true));
      const items = visible.slice((page - 1) * pageSize, page * pageSize).map((a) => toRecord(framework, a, currentOf.get(a.assessorRole) === a.id));
      return { items, total: visible.length, page, pageSize };
    });
  }

  /** De la más reciente a la más antigua. Son pocas por evaluación del servicio: se pagina en memoria. */
  private assessmentsOf(tx: TransactionClient, serviceFrameworkId: string): Promise<AssessmentRow[]> {
    return tx.frameworkAssessment.findMany({ where: { serviceFrameworkId }, orderBy: [{ issuedAt: 'desc' }, { id: 'desc' }], select: ASSESSMENT });
  }
}
