import { changesSince, PARAMETER_LOOKBACK_DAYS, parameterChangeNotifications, type ParameterChange } from './parameter-change-notifications';

const NOW = new Date('2026-11-25T12:00:00Z');
const day = (d: string) => new Date(`${d}T10:00:00Z`);
const change = (over: Partial<ParameterChange> = {}): ParameterChange => ({ id: 'ch1', key: 'freshness_hours', code: 'PR-05', previousValue: 24, newValue: 48, changedAt: day('2026-11-24'), ...over });
const input = (over: Record<string, unknown> = {}) => ({ companyId: 'co', companyCreatedAt: day('2026-01-01'), changes: [change()], adminIds: ['a1', 'a2'], now: NOW, ...over });

describe('parameterChangeNotifications (D153)', () => {
  it('un aviso por administrador y cambio, de tipo empresa, con la clave del cambio y los valores', () => {
    const drafts = parameterChangeNotifications(input());
    expect(drafts.map((d) => d.userId)).toEqual(['a1', 'a2']);
    expect(drafts[0]).toMatchObject({
      companyId: 'co', type: 'check_parameters_changed', targetKind: 'company', targetId: 'co', dueAt: null, dedupeKey: 'check_parameters_changed:ch1',
      params: { parameter_key: 'freshness_hours', parameter_code: 'PR-05', previous_value: 24, new_value: 48 },
    });
  });

  it('un cambio anterior al alta de la empresa no se avisa', () => {
    expect(parameterChangeNotifications(input({ companyCreatedAt: day('2026-11-25') }))).toEqual([]);
    expect(parameterChangeNotifications(input({ companyCreatedAt: day('2026-11-24') }))).toHaveLength(2);
  });

  it('solo se releen los cambios de los últimos días, y nunca más viejos que la empresa', () => {
    expect(PARAMETER_LOOKBACK_DAYS).toBe(3);
    expect(parameterChangeNotifications(input({ changes: [change({ changedAt: day('2026-11-20') })] }))).toEqual([]);
    expect(parameterChangeNotifications(input({ changes: [change({ changedAt: day('2026-11-23') })] }))).toHaveLength(2);
    expect(changesSince(day('2026-01-01'), NOW).toISOString()).toBe('2026-11-22T12:00:00.000Z');
    expect(changesSince(day('2026-11-24'), NOW).toISOString()).toBe('2026-11-24T10:00:00.000Z');
  });

  it('cada cambio tiene su propia clave; la misma entrada da las mismas claves (releer no duplica)', () => {
    const changes = [change(), change({ id: 'ch2', key: 'asset_coverage', code: 'PR-03', changedAt: day('2026-11-25') })];
    const keys = parameterChangeNotifications(input({ changes })).map((d) => d.dedupeKey);
    expect(new Set(keys)).toEqual(new Set(['check_parameters_changed:ch1', 'check_parameters_changed:ch2']));
    expect(parameterChangeNotifications(input({ changes })).map((d) => d.dedupeKey)).toEqual(keys);
  });

  it('sin administradores activos no hay avisos', () => {
    expect(parameterChangeNotifications(input({ adminIds: [] }))).toEqual([]);
  });
});
