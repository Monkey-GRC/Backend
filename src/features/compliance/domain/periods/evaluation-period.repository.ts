import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { EvaluationPeriod } from './evaluation-period';

// Los períodos auditados de UN marco de un servicio (tenant.service_framework_periods; D87, D145, D148, MD-168, MD-500). La escritura recibe su `audit`, que se escribe en la
// MISMA transacción (SEG-36): si el rastro falla, el cambio se revierte.

export type EvaluationPeriodRecord = EvaluationPeriod & { frameworkCode: string; catalogVersion: number };

export type EvaluationPeriodRow = {
  id: string;
  status: 'open' | 'closed';
  periodStart: Date;
  periodEnd: Date;
  cutoffDate: Date | null;
  openedBy: 'user' | 'system';
  closedAt: Date | null;
};

// El período lo valida el caso de uso con los parámetros (PR-16); el repositorio los carga UNA vez dentro de su transacción y se los da. Si lanza, la transacción se revierte.
export type PeriodResolver = (parameters: EvaluationParameters) => { periodStart: Date; periodEnd: Date; cutoffDate: Date | null };

export abstract class EvaluationPeriodRepository {
  // Crea el primer período o edita el ABIERTO (los cerrados no se tocan). null si el servicio no es de la empresa o el marco no está contratado y activo en él.
  // `before` trae todo en null si todavía no había período.
  abstract set(
    scope: TenantScope,
    serviceId: string,
    frameworkCode: string,
    period: PeriodResolver,
    actor: { userId: string; meta: RequestMeta },
    audit: AuditIntent<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord }>,
  ): Promise<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord } | null>;

  // El abierto primero y después los cerrados, del más reciente al más viejo. null si el marco no está contratado y activo en el servicio.
  abstract list(scope: TenantScope, serviceId: string, frameworkCode: string): Promise<EvaluationPeriodRow[] | null>;
}

export type RolloverSummary = { opened: number; stateEvents: number };

/** Un período que la tarea abrió: lo que el rastro necesita (D145). */
export type OpenedPeriod = { serviceId: string; frameworkCode: string; previous: { periodStart: Date; periodEnd: Date }; next: { periodStart: Date; periodEnd: Date } };

// D148 · La tarea diaria. Todo lo hace por empresa, cada una en su transacción, con el sistema como actor.
export abstract class EvaluationPeriodRollover {
  // Las empresas que no están archivadas; con `only`, solo esas (`[]` = ninguna empresa). El filtro va en la consulta.
  abstract listTenantIds(only?: readonly string[]): Promise<string[]>;
  // Cierra los períodos abiertos ya terminados y abre el siguiente (D145); después vuelve a evaluar los controles de la empresa y deja el evento (D91) de lo que cambió solo por el paso del tiempo.
  // Cada período abierto se audita con `audit` (el actor lo arma el caso de uso: sistema), en la misma transacción que la apertura.
  abstract rollTenant(tenantId: string, now: Date, audit: AuditIntent<OpenedPeriod>): Promise<RolloverSummary>;
}
