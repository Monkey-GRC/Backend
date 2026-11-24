// Los parámetros de evaluación (RC-19, contracts/catalogo-maestro.md): su clave, la forma de su valor y la validación del PATCH. Lo comparten el motor (que los lee) y catalog-admin (que los edita). Puro: sin Nest ni Prisma.
export const PARAMETER_UNITS = ['percent', 'days', 'hours', 'months', 'count', 'boolean', 'days_by_periodicity', 'window_mode'] as const;
export type ParameterUnit = (typeof PARAMETER_UNITS)[number];

export const WINDOW_MODES = ['calendar', 'rolling'] as const;
export type WindowMode = (typeof WINDOW_MODES)[number];

/** Las claves, en el orden en que las lista el contrato. */
export const PARAMETER_KEYS = [
  'partial_threshold', 'weak_threshold', 'asset_coverage', 'check_exception_max_days', 'freshness_hours', 'alert_days_before', 'on_demand_alert_days', 'validity_windows',
  'risk_partial_mitigation_coverage', 'risk_demonstrated_mitigation_coverage', 'impact_reduction_enabled', 'approval_max_steps', 'approval_max_approvers_per_step',
  'submitter_sole_approver_allowed', 'document_acceptance_days', 'document_acceptance_required', 'audited_period_min_months', 'score_threshold', 'solid_asset_coverage',
] as const;
export type ParameterKey = (typeof PARAMETER_KEYS)[number];

export type ParameterValue = number | boolean | string | Record<string, number>;

export const WINDOWED_PERIODICITIES = ['daily', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'] as const;
/** Duración de la ventana de cada periodicidad, en días (la más corta del calendario): el aviso previo es menor que ella. */
export const WINDOW_DAYS: Record<(typeof WINDOWED_PERIODICITIES)[number], number> = { daily: 1, weekly: 7, monthly: 28, bimonthly: 59, quarterly: 90, semiannual: 181, annual: 365 };

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** ¿El valor tiene la forma que dice su unidad? (no mira rangos) */
export function hasShape(unit: ParameterUnit, value: unknown): value is ParameterValue {
  switch (unit) {
    case 'percent': case 'days': case 'hours': case 'months': case 'count': return isInt(value);
    case 'boolean': return typeof value === 'boolean';
    case 'window_mode': return typeof value === 'string' && (WINDOW_MODES as readonly string[]).includes(value);
    case 'days_by_periodicity': return isRecord(value) && Object.values(value).every(isInt);
  }
}

const RANGES: Partial<Record<ParameterKey, [number, number]>> = {
  partial_threshold: [1, 100], weak_threshold: [1, 100], asset_coverage: [1, 100], check_exception_max_days: [1, 365], freshness_hours: [1, 720], on_demand_alert_days: [0, 89],
  risk_partial_mitigation_coverage: [1, 100], risk_demonstrated_mitigation_coverage: [1, 100], approval_max_steps: [1, 10], approval_max_approvers_per_step: [1, 10],
  document_acceptance_days: [1, 365], document_acceptance_required: [1, 100], audited_period_min_months: [1, 24], score_threshold: [1, 100], solid_asset_coverage: [1, 100],
};

export type ParameterError = 'value.type' | 'value.range' | 'value.order' | 'value.periodicities';

/** El valor vigente de cada parámetro numérico, para las reglas entre pares. */
export type CurrentValues = Readonly<Record<string, ParameterValue>>;

const num = (current: CurrentValues, key: ParameterKey): number => current[key] as number;

/** La validación del PATCH (contrato, tabla «Qué acepta el PATCH»). `null` si el valor es válido. */
export function validateParameterValue(key: ParameterKey, unit: ParameterUnit, value: unknown, current: CurrentValues): ParameterError | null {
  if (!hasShape(unit, value)) return 'value.type';
  if (key === 'alert_days_before') {
    const days = value as Record<string, number>;
    const keys = Object.keys(days);
    if (keys.length !== WINDOWED_PERIODICITIES.length || !WINDOWED_PERIODICITIES.every((p) => p in days)) return 'value.periodicities';
    return WINDOWED_PERIODICITIES.every((p) => days[p] >= 0 && days[p] < WINDOW_DAYS[p]) ? null : 'value.range';
  }
  const range = RANGES[key];
  if (range) {
    const n = value as number;
    if (n < range[0] || n > range[1]) return 'value.range';
  }
  const n = value as number;
  if (key === 'partial_threshold' && n <= num(current, 'weak_threshold')) return 'value.order';
  if (key === 'weak_threshold' && n >= num(current, 'partial_threshold')) return 'value.order';
  if (key === 'risk_partial_mitigation_coverage' && n >= num(current, 'risk_demonstrated_mitigation_coverage')) return 'value.order';
  if (key === 'risk_demonstrated_mitigation_coverage' && n <= num(current, 'risk_partial_mitigation_coverage')) return 'value.order';
  if (key === 'solid_asset_coverage' && n < num(current, 'asset_coverage')) return 'value.order';
  if (key === 'asset_coverage' && n > num(current, 'solid_asset_coverage')) return 'value.order';
  return null;
}
