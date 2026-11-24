import { CurrentValues, ParameterKey, ParameterUnit, validateParameterValue } from './parameter-definitions';

// Los valores del libro (§9), solo para armar el «valor vigente» de las reglas entre parámetros.
const CURRENT: CurrentValues = {
  partial_threshold: 75, weak_threshold: 40, asset_coverage: 100, solid_asset_coverage: 100, risk_partial_mitigation_coverage: 60, risk_demonstrated_mitigation_coverage: 85,
};
const check = (key: ParameterKey, unit: ParameterUnit, value: unknown, current: CurrentValues = CURRENT) => validateParameterValue(key, unit, value, current);
const ALERT = { daily: 0, weekly: 2, monthly: 5, bimonthly: 10, quarterly: 15, semiannual: 20, annual: 30 };

describe('validateParameterValue (RC-19)', () => {
  it.each(['calendar', 'rolling'])('PR-07 acepta %s', (mode) => expect(check('validity_windows', 'window_mode', mode)).toBeNull());
  it.each([true, false])('PR-10 y PR-13 aceptan %s', (v) => {
    expect(check('impact_reduction_enabled', 'boolean', v)).toBeNull();
    expect(check('submitter_sole_approver_allowed', 'boolean', v)).toBeNull();
  });

  it.each([
    ['partial_threshold', 80], ['weak_threshold', 30], ['asset_coverage', 90], ['check_exception_max_days', 365], ['freshness_hours', 720], ['on_demand_alert_days', 0], ['on_demand_alert_days', 89],
    ['approval_max_steps', 10], ['approval_max_approvers_per_step', 1], ['document_acceptance_days', 1], ['audited_period_min_months', 24], ['score_threshold', 100],
  ] as const)('%s acepta %s', (key, value) => {
    const unit: ParameterUnit = key === 'check_exception_max_days' || key === 'on_demand_alert_days' || key === 'document_acceptance_days' ? 'days' : key === 'freshness_hours' ? 'hours' : key === 'audited_period_min_months' ? 'months' : key.startsWith('approval') ? 'count' : 'percent';
    expect(check(key, unit, value)).toBeNull();
  });

  it.each([
    ['partial_threshold', 'percent', '80'], ['partial_threshold', 'percent', 80.5], ['partial_threshold', 'percent', null], ['impact_reduction_enabled', 'boolean', 1], ['alert_days_before', 'days_by_periodicity', 5],
    ['alert_days_before', 'days_by_periodicity', { ...ALERT, daily: 'x' }], ['validity_windows', 'window_mode', 'moving'],
  ] as const)('%s con %j no tiene la forma de su unidad: value.type', (key, unit, value) => {
    expect(check(key, unit, value)).toBe('value.type');
  });

  it.each([
    ['partial_threshold', 'percent', 0], ['partial_threshold', 'percent', 101], ['asset_coverage', 'percent', 0], ['check_exception_max_days', 'days', 366], ['freshness_hours', 'hours', 721],
    ['on_demand_alert_days', 'days', 90], ['on_demand_alert_days', 'days', -1], ['approval_max_steps', 'count', 11], ['audited_period_min_months', 'months', 25], ['document_acceptance_required', 'percent', 0],
  ] as const)('%s con %s fuera de rango: value.range', (key, unit, value) => {
    expect(check(key, unit, value)).toBe('value.range');
  });

  describe('reglas entre parámetros, contra el valor vigente del otro', () => {
    it('PR-01 debe quedar por encima de PR-02', () => {
      expect(check('partial_threshold', 'percent', 40)).toBe('value.order');
      expect(check('partial_threshold', 'percent', 41)).toBeNull();
    });
    it('PR-02 debe quedar por debajo de PR-01', () => {
      expect(check('weak_threshold', 'percent', 75)).toBe('value.order');
      expect(check('weak_threshold', 'percent', 74)).toBeNull();
    });
    it('PR-08 por debajo de PR-09 y PR-09 por encima de PR-08', () => {
      expect(check('risk_partial_mitigation_coverage', 'percent', 85)).toBe('value.order');
      expect(check('risk_partial_mitigation_coverage', 'percent', 84)).toBeNull();
      expect(check('risk_demonstrated_mitigation_coverage', 'percent', 60)).toBe('value.order');
      expect(check('risk_demonstrated_mitigation_coverage', 'percent', 61)).toBeNull();
    });
    it('Sólido no puede quedar por debajo de PR-03 (ni PR-03 por encima de Sólido)', () => {
      expect(check('solid_asset_coverage', 'percent', 99)).toBe('value.order');
      expect(check('solid_asset_coverage', 'percent', 100)).toBeNull();
      expect(check('asset_coverage', 'percent', 95, { ...CURRENT, solid_asset_coverage: 90 })).toBe('value.order');
      expect(check('asset_coverage', 'percent', 90, { ...CURRENT, solid_asset_coverage: 90 })).toBeNull();
    });
    it('el rango se comprueba antes que el orden', () => {
      expect(check('partial_threshold', 'percent', 0)).toBe('value.range');
    });
  });

  describe('PR-06 · días de aviso por periodicidad', () => {
    const run = (value: unknown) => check('alert_days_before', 'days_by_periodicity', value);
    it('acepta los valores del libro y el tope de cada ventana menos uno', () => {
      expect(run(ALERT)).toBeNull();
      expect(run({ daily: 0, weekly: 6, monthly: 27, bimonthly: 58, quarterly: 89, semiannual: 180, annual: 364 })).toBeNull();
    });
    it.each([
      ['daily', 1], ['weekly', 7], ['monthly', 28], ['bimonthly', 59], ['quarterly', 90], ['semiannual', 181], ['annual', 365], ['weekly', -1],
    ] as const)('%s con %s: value.range', (p, days) => {
      expect(run({ ...ALERT, [p]: days })).toBe('value.range');
    });
    it('falta una periodicidad: value.periodicities', () => {
      const { annual: _annual, ...rest } = ALERT;
      expect(run(rest)).toBe('value.periodicities');
    });
    it('sobra una periodicidad (permanent no tiene ventana): value.periodicities', () => {
      expect(run({ ...ALERT, permanent: 0 })).toBe('value.periodicities');
      expect(run({ ...ALERT, on_demand: 3 })).toBe('value.periodicities');
    });
  });
});
