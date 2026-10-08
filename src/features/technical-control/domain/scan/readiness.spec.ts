import { computeReadiness, TestCheckLink } from './readiness';
import { CheckResultValue, InterpretedResult } from './scan.types';

const r = (checkId: string, result: CheckResultValue, severity: string | null = 'medium', key = checkId): InterpretedResult => ({
  checkId, resourceKey: key, resourceUid: key, resourceType: 'X', resourceName: null, regions: [], result, severity, detail: null,
});
const link = (testCode: string, checkId: string, provenance: TestCheckLink['provenance'] = 'monkey_proposed'): TestCheckLink => ({ testCode, checkId, provenance });

describe('computeReadiness', () => {
  const links = [link('T-CLD-001', 'iam'), link('T-CLD-002', 'net'), link('T-CLD-003', 'log')];

  it('Preparado cuando nada falla y todo lo esperado se midió', () => {
    const out = computeReadiness([r('iam', 'passed'), r('net', 'passed'), r('log', 'passed')], links, { includeProposed: true });
    expect(out.readiness).toBe('ready');
    expect(out.coverage).toEqual({ measured: 3, expected: 3 });
  });

  it('Requiere trabajo si hay un fallo alto o crítico (R-05), aunque casi todo cumpla', () => {
    const results = [r('iam', 'failed', 'high'), ...Array.from({ length: 9 }, (_, i) => r('net', 'passed', 'medium', `n${i}`))];
    const out = computeReadiness(results, links, { includeProposed: true });
    expect(out.readiness).toBe('needs_work');
    expect(out.areas.find((a) => a.area === 'identity_access')?.readiness).toBe('needs_work');
  });

  it('Casi listo con fallos leves o con algo sin medir', () => {
    expect(computeReadiness([r('iam', 'failed', 'low'), r('net', 'passed'), r('log', 'passed')], links, { includeProposed: true }).readiness).toBe('almost_ready');
    expect(computeReadiness([r('iam', 'passed'), r('net', 'passed'), r('log', 'passed'), r('log', 'not_run', null, 'l2')], links, { includeProposed: true }).readiness).toBe('almost_ready');
  });

  it('un not_applicable no entra al denominador (R-07) ni un not_run cuenta como fallo (R-06)', () => {
    const out = computeReadiness([r('iam', 'passed'), r('net', 'not_applicable'), r('log', 'not_run')], links, { includeProposed: true });
    expect(out.ofMeasured).toEqual({ compliant: 1, notCompliant: 0 });
    expect(out.coverage).toEqual({ measured: 1, expected: 2 });
    expect(out.needsManualReview).toBe(1);
  });

  it('sin nada medido es «Sin medir», no un fallo', () => {
    const out = computeReadiness([r('iam', 'not_run')], links, { includeProposed: true });
    expect(out.readiness).toBe('not_measured');
    expect(out.areas.every((a) => a.readiness === 'not_measured')).toBe(true);
  });

  it('en modo producción solo cuenta lo que el comité ratificó', () => {
    const results = [r('iam', 'failed', 'critical')];
    expect(computeReadiness(results, links, { includeProposed: false }).readiness).toBe('not_measured');
    expect(computeReadiness(results, [link('T-CLD-001', 'iam', 'committee_ratified')], { includeProposed: false }).readiness).toBe('needs_work');
  });

  it('un check sin prueba asignada no cuenta (cobertura no alcanzada)', () => {
    const out = computeReadiness([r('huérfano', 'failed', 'critical')], links, { includeProposed: true });
    expect(out.readiness).toBe('not_measured');
    expect(out.coverage.expected).toBe(0);
  });

  it('una evaluación que alimenta dos pruebas de la misma área cuenta una vez en el área y en los totales', () => {
    const out = computeReadiness([r('mfa', 'passed')], [link('T-CLD-001', 'mfa'), link('T-CLD-011', 'mfa')], { includeProposed: true });
    expect(out.coverage.measured).toBe(1);
    expect(out.areas.find((a) => a.area === 'identity_access')?.compliant).toBe(1);
  });

  it('una evaluación que alimenta dos áreas cuenta en cada área pero una sola vez en los totales', () => {
    const out = computeReadiness([r('x', 'failed', 'low')], [link('T-CLD-001', 'x'), link('T-CLD-002', 'x')], { includeProposed: true });
    expect(out.coverage.measured).toBe(1);
    expect(out.ofMeasured.notCompliant).toBe(1);
    expect(out.areas.filter((a) => a.openFindings === 1).map((a) => a.area).sort()).toEqual(['data_network', 'identity_access']);
  });
});
