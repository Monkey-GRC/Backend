import { interpretTestResult } from './interpret-evaluations';
import { CheckResultValue, InterpretedResult } from './scan.types';

const r = (checkId: string, result: CheckResultValue, resourceKey: string | null = `arn:${checkId}`): InterpretedResult => ({
  checkId,
  resourceKey,
  resourceUid: resourceKey,
  resourceType: null,
  resourceName: null,
  regions: [],
  result,
  severity: null,
  detail: null,
});
const test = new Set(['a', 'b']);

describe('interpretTestResult (DT-50, §9)', () => {
  it('cumple solo si todo lo que la sonda decidió pasó', () => {
    expect(interpretTestResult(test, [r('a', 'passed'), r('b', 'passed')])).toEqual({ result: 'compliant', rawProbeResult: 'ok', diagnosticPercentage: 100 });
  });

  it('un solo fallo lo deja en no cumple, aunque el resto pase o esté pendiente', () => {
    expect(interpretTestResult(test, [r('a', 'passed'), r('b', 'failed'), r('b', 'not_run', 'otro')])).toMatchObject({ result: 'non_compliant', rawProbeResult: 'fail', diagnosticPercentage: 50 });
  });

  it('lo que la sonda no pudo decidir es pendiente y nunca cuenta como cumplido', () => {
    expect(interpretTestResult(test, [r('a', 'passed'), r('b', 'not_run')])).toMatchObject({ result: 'pending', rawProbeResult: null });
    expect(interpretTestResult(test, [r('a', 'invalid')])).toMatchObject({ result: 'pending', rawProbeResult: null, diagnosticPercentage: null });
  });

  it('sin filas para sus checks, el test no aplica al activo', () => {
    expect(interpretTestResult(test, [])).toEqual({ result: 'not_applicable', rawProbeResult: null, diagnosticPercentage: null });
    expect(interpretTestResult(test, [r('a', 'not_applicable', null)]).result).toBe('not_applicable');
  });

  it('ignora los checks que no alimentan al test', () => {
    expect(interpretTestResult(test, [r('z', 'failed'), r('a', 'passed')]).result).toBe('compliant');
  });

  it('una evaluación repetida cuenta una vez', () => {
    expect(interpretTestResult(test, [r('a', 'failed'), r('a', 'failed')]).diagnosticPercentage).toBe(0);
    expect(interpretTestResult(test, [r('a', 'passed'), r('a', 'passed'), r('b', 'failed')]).diagnosticPercentage).toBe(50);
  });
});
