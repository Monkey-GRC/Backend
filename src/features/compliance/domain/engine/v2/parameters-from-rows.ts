import { hasShape, WindowMode, ParameterKey, PARAMETER_UNITS, ParameterUnit, WINDOWED_PERIODICITIES } from '../../../../../common/evaluation-parameters/parameter-definitions';
import type { EvaluationParameters } from './parameters';
import type { Periodicity } from './types';

export type ParameterRow = { key: string; unit: string; value: unknown };

const fail = (key: string, why: string): never => {
  throw new Error(`Parámetro de evaluación «${key}» inválido en catalog.evaluation_parameters: ${why}`);
};

/** Arma `EvaluationParameters` con las filas de la tabla. Falta una fila o tiene otra forma: error interno claro, nunca un valor por defecto escrito en código. */
export function buildEvaluationParameters(rows: readonly ParameterRow[]): EvaluationParameters {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const raw = (key: ParameterKey): unknown => {
    const row = byKey.get(key);
    if (!row) return fail(key, 'no existe la fila');
    const unit = row.unit as ParameterUnit;
    if (!(PARAMETER_UNITS as readonly string[]).includes(unit) || !hasShape(unit, row.value)) return fail(key, `el valor no tiene la forma de su unidad (${row.unit})`);
    return row.value;
  };
  const int = (key: ParameterKey): number => {
    const v = raw(key);
    return typeof v === 'number' ? v : fail(key, 'se esperaba un número entero');
  };
  const bool = (key: ParameterKey): boolean => {
    const v = raw(key);
    return typeof v === 'boolean' ? v : fail(key, 'se esperaba verdadero o falso');
  };
  const alertDays = (): Partial<Record<Periodicity, number>> => {
    const v = raw('alert_days_before');
    if (typeof v !== 'object' || v === null) return fail('alert_days_before', 'se esperaba un objeto por periodicidad');
    const days = v as Record<string, number>;
    for (const p of WINDOWED_PERIODICITIES) if (typeof days[p] !== 'number') fail('alert_days_before', `falta la periodicidad ${p}`);
    return Object.fromEntries(WINDOWED_PERIODICITIES.map((p) => [p, days[p]]));
  };
  const windows = (): WindowMode => {
    const v = raw('validity_windows');
    return v === 'calendar' || v === 'rolling' ? v : fail('validity_windows', 'modo de ventana desconocido');
  };

  return {
    partialThreshold: int('partial_threshold'),
    weakThreshold: int('weak_threshold'),
    assetCoverage: int('asset_coverage'),
    checkExceptionMaxDays: int('check_exception_max_days'),
    freshnessHours: int('freshness_hours'),
    scoreThreshold: int('score_threshold'),
    alertDaysBefore: alertDays(),
    onDemandAlertDays: int('on_demand_alert_days'),
    auditedPeriodMinMonths: int('audited_period_min_months'),
    solidAssetCoverage: int('solid_asset_coverage'),
    validityWindows: windows(),
    riskPartialMitigationCoverage: int('risk_partial_mitigation_coverage'),
    riskDemonstratedMitigationCoverage: int('risk_demonstrated_mitigation_coverage'),
    impactReductionEnabled: bool('impact_reduction_enabled'),
    approvalMaxSteps: int('approval_max_steps'),
    approvalMaxApproversPerStep: int('approval_max_approvers_per_step'),
    submitterSoleApproverAllowed: bool('submitter_sole_approver_allowed'),
    documentAcceptanceDays: int('document_acceptance_days'),
    documentAcceptanceRequired: int('document_acceptance_required'),
  };
}
