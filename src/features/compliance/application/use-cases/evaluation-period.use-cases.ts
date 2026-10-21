import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { EffectiveCutoff, effectiveCutoff, utcDay } from '../../domain/evaluation-period';
import { EvaluationPeriodRecord, EvaluationPeriodRepository } from '../../domain/repositories/evaluation-period.repository';
import { SetEvaluationPeriodDto } from '../dtos/evaluation-period.dto';
import { validateEvaluationPeriod } from '../evaluation-period.validation';

// MD-168 · D87 · Declarar el período auditado y, si se quiere, congelar la fecha de corte de un marco del servicio. Solo `admin_empresa` (lo impone @Roles en la ruta).
// Sin una fecha de corte guardada la efectiva es «hoy»; la respuesta dice cuál es y si está congelada.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const snapshot = (serviceId: string, r: EvaluationPeriodRecord) => ({
  service_id: serviceId, framework_code: r.frameworkCode, period_start: day(r.periodStart), period_end: day(r.periodEnd), cutoff_date: day(r.cutoffDate),
});

export type EvaluationPeriodView = { frameworkCode: string; catalogVersion: number; periodStart: Date; periodEnd: Date; cutoff: EffectiveCutoff };

@Injectable()
export class SetEvaluationPeriodUseCase {
  constructor(private readonly repo: EvaluationPeriodRepository) {}

  async execute(p: Principal, serviceId: string, frameworkCode: string, dto: SetEvaluationPeriodDto, meta: RequestMeta, now: Date = new Date()): Promise<EvaluationPeriodView> {
    const period = validateEvaluationPeriod(dto, now);
    const done = await this.repo.set(scopeOf(p), serviceId, frameworkCode, period, ({ before, after }): AuditEntry => ({
      tenantId: p.companyId, userId: p.userId, action: 'evaluation_period.set', resource: 'service_framework', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: snapshot(serviceId, before), afterState: snapshot(serviceId, after),
    }));
    if (!done) throw new DomainError('NOT_FOUND');
    const { after } = done;
    // Con inicio y fin recién guardados el período está definido, así que hay una fecha de corte efectiva.
    return { frameworkCode: after.frameworkCode, catalogVersion: after.catalogVersion, periodStart: after.periodStart!, periodEnd: after.periodEnd!, cutoff: effectiveCutoff(after, utcDay(now))! };
  }
}
