import { gapScopeOf } from './control-readout';
import { asset, control, data, links, NOW, readoutTest, requirement } from './readout.fixtures';

// MD-502 (D138 punto 3) · Las brechas de una prueba salen de la MISMA lectura que el motor: lo que aquí es `fail` es lo que deja la prueba en Excepción.
describe('gapScopeOf', () => {
  const items = [
    { role: 'direct' as const, check: { id: 'k1', titleEs: null, titleEn: 'K1' }, moduleRef: null, owner: null, key: 'check:k1' },
    { role: 'complementary' as const, check: { id: 'k2', titleEs: null, titleEn: 'K2' }, moduleRef: null, owner: null, key: 'check:k2' },
    { role: 'dependency' as const, check: { id: 'k3', titleEs: null, titleEn: 'K3' }, moduleRef: null, owner: { controlId: 'x', code: 'X' }, key: 'check:k3' },
  ];
  const TEST = readoutTest('mfa', 'technical', { links: links({ directCheckCount: 1, complementaryCheckIds: ['k2'], items }) });
  const read = (opts: { result?: 'compliant' | 'non_compliant'; exception?: boolean; at?: Date; periodicity?: 'daily' | null } = {}) => {
    const c = control([requirement('r1', [TEST], { periodicity: opts.periodicity ?? null })]);
    const key = 'c1|mfa|a1';
    const d = data([c], [asset('a1'), asset('a2')], {
      results: new Map(opts.result ? [[key, opts.result]] : []),
      signals: { resultDates: new Map([[key, opts.at ?? NOW]]), exceptions: new Set(opts.exception ? ['mfa|a1'] : []) },
    });
    return { c, d, scope: gapScopeOf(c, 'mfa', d) };
  };

  it('da los checks con su rol (sin las dependencias) y el activo en FAIL', () => {
    const { scope } = read({ result: 'non_compliant' });
    expect(scope?.checks.map((c) => `${c.id}:${c.role}`)).toEqual(['k1:direct', 'k2:complementary']);
    expect(scope?.assets).toEqual([
      { id: 'a1', name: 'activo-a1', direct: 'fail' },
      { id: 'a2', name: 'activo-a2', direct: null },
    ]);
  });

  it('con una excepción vigente el activo es fail_with_exception', () => {
    expect(read({ result: 'non_compliant', exception: true }).scope?.assets[0].direct).toBe('fail_with_exception');
  });

  it('un PASS o un resultado vencido (sin datos) no es brecha', () => {
    expect(read({ result: 'compliant' }).scope?.assets[0].direct).toBeNull();
    expect(read({ result: 'non_compliant', at: new Date('2020-01-01T00:00:00Z'), periodicity: 'daily' }).scope?.assets[0].direct).toBeNull();
  });

  it('el control que no lleva la prueba no tiene alcance', () => {
    const { c, d } = read();
    expect(gapScopeOf(c, 'otra', d)).toBeNull();
  });

  it('sin plan aprobado y vigente no hay plan', () => {
    expect(read({ result: 'non_compliant' }).scope?.plan).toBeNull();
  });

  it('el plan aprobado y vigente de la prueba trae su responsable y su fecha; uno pendiente o invalidado, no', () => {
    const { c, d } = read({ result: 'non_compliant' });
    const plan = (patch: Record<string, unknown>) => ({
      id: 'p', testId: 'mfa', requirementId: null, what: 'x', assignee: { id: 'u1', name: 'Pedro', lastName: 'Ruiz' }, dueDate: new Date('2026-12-15T00:00:00Z'), proposedBy: { id: 'u2', name: null, lastName: null }, proposedAt: NOW,
      windowStart: null, invalidatedAt: null, status: 'approved' as const, decidedBy: null, decidedAt: null, decisionReason: null, ...patch,
    });
    const extras = (plans: ReturnType<typeof plan>[]) => ({ applicability: new Map(), overrides: [], plans, occurrences: new Map(), declarations: new Map() });
    expect(gapScopeOf({ ...c, extras: extras([plan({})]) }, 'mfa', d)?.plan).toEqual({ assignee: { id: 'u1', name: 'Pedro', lastName: 'Ruiz' }, dueDate: new Date('2026-12-15T00:00:00Z') });
    expect(gapScopeOf({ ...c, extras: extras([plan({ status: 'pending' })]) }, 'mfa', d)?.plan).toBeNull();
    expect(gapScopeOf({ ...c, extras: extras([plan({ invalidatedAt: NOW })]) }, 'mfa', d)?.plan).toBeNull();
  });
});
