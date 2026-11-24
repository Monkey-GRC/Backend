import { BOOK_PARAMETERS } from './parameters.fixtures';
import { buildEvaluationParameters, ParameterRow } from './parameters-from-rows';

const ROWS: ParameterRow[] = [
  { key: 'partial_threshold', unit: 'percent', value: 75 }, { key: 'weak_threshold', unit: 'percent', value: 40 }, { key: 'asset_coverage', unit: 'percent', value: 100 },
  { key: 'check_exception_max_days', unit: 'days', value: 90 }, { key: 'freshness_hours', unit: 'hours', value: 24 },
  { key: 'alert_days_before', unit: 'days_by_periodicity', value: { daily: 0, weekly: 2, monthly: 5, bimonthly: 10, quarterly: 15, semiannual: 20, annual: 30 } },
  { key: 'on_demand_alert_days', unit: 'days', value: 15 }, { key: 'validity_windows', unit: 'window_mode', value: 'calendar' },
  { key: 'risk_partial_mitigation_coverage', unit: 'percent', value: 60 }, { key: 'risk_demonstrated_mitigation_coverage', unit: 'percent', value: 85 },
  { key: 'impact_reduction_enabled', unit: 'boolean', value: false }, { key: 'approval_max_steps', unit: 'count', value: 5 }, { key: 'approval_max_approvers_per_step', unit: 'count', value: 3 },
  { key: 'submitter_sole_approver_allowed', unit: 'boolean', value: false }, { key: 'document_acceptance_days', unit: 'days', value: 30 }, { key: 'document_acceptance_required', unit: 'percent', value: 100 },
  { key: 'audited_period_min_months', unit: 'months', value: 6 }, { key: 'score_threshold', unit: 'percent', value: 80 }, { key: 'solid_asset_coverage', unit: 'percent', value: 100 },
];

describe('buildEvaluationParameters (RC-19)', () => {
  it('arma los parámetros con las filas de la tabla', () => {
    expect(buildEvaluationParameters(ROWS)).toEqual(BOOK_PARAMETERS);
  });

  it('una fila que falta es un error claro, no un valor por defecto', () => {
    expect(() => buildEvaluationParameters(ROWS.filter((r) => r.key !== 'freshness_hours'))).toThrow(/freshness_hours.*no existe la fila/);
  });

  it('un valor con otra forma es un error claro', () => {
    const rows = ROWS.map((r) => (r.key === 'partial_threshold' ? { ...r, value: '75' } : r));
    expect(() => buildEvaluationParameters(rows)).toThrow(/partial_threshold.*forma/);
  });

  it('PR-06 sin una periodicidad es un error claro', () => {
    const rows = ROWS.map((r) => (r.key === 'alert_days_before' ? { ...r, value: { daily: 0 } } : r));
    expect(() => buildEvaluationParameters(rows)).toThrow(/alert_days_before.*weekly/);
  });
});
