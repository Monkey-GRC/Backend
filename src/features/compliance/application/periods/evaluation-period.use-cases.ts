import { Injectable, Logger } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { EffectiveCutoff, effectiveCutoff, FRAMEWORKS_WITH_MIN_PERIOD, utcDay } from '../../domain/periods/evaluation-period';
import { EvaluationPeriodRecord, EvaluationPeriodRepository, EvaluationPeriodRollover, EvaluationPeriodRow, RolloverSummary } from '../../domain/periods/evaluation-period.repository';
import { EvaluationParametersPort } from '../../domain/engine/v2/parameters';
import { SetEvaluationPeriodDto } from './evaluation-period.dto';
import { validateEvaluationPeriod } from './evaluation-period.validation';

// MD-168 · D87 · MD-500 · D145 · Declarar el período auditado (el abierto) y, si se quiere, congelar la fecha de corte de un marco del servicio. Solo `admin_empresa` (lo impone @Roles en la ruta).
// Sin una fecha de corte guardada la efectiva es «hoy»; la respuesta dice cuál es y si está congelada.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const snapshot = (serviceId: string, r: EvaluationPeriodRecord) => ({
  service_id: serviceId, framework_code: r.frameworkCode, period_start: day(r.periodStart), period_end: day(r.periodEnd), cutoff_date: day(r.cutoffDate),
});

export type EvaluationPeriodView = { frameworkCode: string; catalogVersion: number; periodStart: Date; periodEnd: Date; cutoff: EffectiveCutoff };

@Injectable()
export class SetEvaluationPeriodUseCase {
  constructor(private readonly repo: EvaluationPeriodRepository, private readonly parameters: EvaluationParametersPort) {}

  async execute(p: Principal, serviceId: string, frameworkCode: string, dto: SetEvaluationPeriodDto, meta: RequestMeta, now: Date = new Date()): Promise<EvaluationPeriodView> {
    // PR-16 · En SOC 2 el período dura como mínimo `auditedPeriodMinMonths`; los demás marcos no tienen mínimo.
    const minMonths = FRAMEWORKS_WITH_MIN_PERIOD.includes(frameworkCode) ? (await this.parameters.load()).auditedPeriodMinMonths : null;
    const period = validateEvaluationPeriod(dto, now, minMonths);
    const done = await this.repo.set(scopeOf(p), serviceId, frameworkCode, period, { userId: p.userId, meta }, ({ before, after }): AuditEntry => ({
      tenantId: p.companyId, userId: p.userId, action: 'evaluation_period.set', resource: 'service_framework', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: snapshot(serviceId, before), afterState: snapshot(serviceId, after),
    }));
    if (!done) throw new DomainError('NOT_FOUND');
    const { after } = done;
    // Con inicio y fin recién guardados el período está definido, así que hay una fecha de corte efectiva.
    return { frameworkCode: after.frameworkCode, catalogVersion: after.catalogVersion, periodStart: after.periodStart!, periodEnd: after.periodEnd!, cutoff: effectiveCutoff(after, utcDay(now))! };
  }
}

// D145 · El histórico de períodos del marco: `admin_empresa` y `auditor` (lo impone @Roles en la ruta).
@Injectable()
export class ListEvaluationPeriodsUseCase {
  constructor(private readonly repo: EvaluationPeriodRepository) {}

  async execute(p: Principal, serviceId: string, frameworkCode: string): Promise<EvaluationPeriodRow[]> {
    const rows = await this.repo.list(scopeOf(p), serviceId, frameworkCode);
    if (!rows) throw new DomainError('NOT_FOUND');
    return rows;
  }
}

// D148 · La pasada diaria. Cada empresa en su transacción: si una falla, se registra y sigue con la siguiente; la siguiente pasada la reintenta (todo es idempotente).
export type RolloverResult = RolloverSummary & { tenants: number; failed: number };

@Injectable()
export class RollEvaluationPeriodsUseCase {
  private readonly logger = new Logger(RollEvaluationPeriodsUseCase.name);

  constructor(private readonly rollover: EvaluationPeriodRollover) {}

  async execute(now: Date = new Date()): Promise<RolloverResult> {
    const result: RolloverResult = { tenants: 0, failed: 0, opened: 0, stateEvents: 0 };
    for (const tenantId of await this.rollover.listTenantIds()) {
      try {
        const done = await this.rollover.rollTenant(tenantId, now, (o): AuditEntry => ({
          tenantId, userId: null, action: 'evaluation_period.opened', resource: 'service_framework', result: 'success', ipAddress: '', userAgent: 'system',
          beforeState: { service_id: o.serviceId, framework_code: o.frameworkCode, period_start: day(o.previous.periodStart), period_end: day(o.previous.periodEnd) },
          afterState: { service_id: o.serviceId, framework_code: o.frameworkCode, period_start: day(o.next.periodStart), period_end: day(o.next.periodEnd), cutoff_date: null, opened_by: 'system' },
        }));
        result.tenants++;
        result.opened += done.opened;
        result.stateEvents += done.stateEvents;
      } catch (error) {
        result.failed++;
        this.logger.error(`Falló la pasada de períodos de la empresa ${tenantId}: ${(error as Error).message}`);
      }
    }
    return result;
  }
}
