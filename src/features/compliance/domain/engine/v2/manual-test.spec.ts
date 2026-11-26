import { NOW } from '../../controls/readout.fixtures';
import { evaluateManualTest, ManualEvidence } from './manual-test';
import { Periodicity } from './types';

const ev = (state: ManualEvidence['state'], submittedAt: string | null = '2026-11-10T00:00:00Z'): ManualEvidence => ({ state, submittedAt: submittedAt ? new Date(submittedAt) : null });
const run = (evidence: ManualEvidence[], periodicity: Periodicity | null = 'quarterly', result: Parameters<typeof evaluateManualTest>[0]['result'] = null, requiresResult = false) => evaluateManualTest({ evidence, periodicity, now: NOW, result, requiresResult });

describe('pruebas manuales · evidencia documental (D132: cuenta si no fue devuelta)', () => {
  it('validada → Correcto', () => expect(run([ev('compliant')]).status).toBe('correct'));
  it('rechazada → Excepción', () => expect(run([ev('non_compliant')]).status).toBe('exception'));
  it('sin entrega → Pendiente', () => expect(run([]).status).toBe('pending'));
  it('sin revisar o en revisión → Pendiente: la IA nunca cumple', () => {
    expect(run([ev('pending')]).status).toBe('pending');
    expect(run([ev('in_review')]).status).toBe('pending');
  });
  it('fuera de su ventana → Vencido', () => {
    expect(run([ev('compliant', '2026-09-15T00:00:00Z')], 'quarterly').status).toBe('expired');
    expect(run([ev('compliant', '2026-09-15T00:00:00Z')], 'annual').status).toBe('correct');
    expect(run([ev('compliant', '2025-09-15T00:00:00Z')], 'annual').status).toBe('expired');
  });
  it('una entrega vencida por su vigencia (validez) → Vencido', () => expect(run([ev('expired')]).status).toBe('expired'));
  it('con varias evidencias decide la peor: un rechazo gana, luego lo vencido, luego lo pendiente', () => {
    expect(run([ev('compliant'), ev('non_compliant')]).status).toBe('exception');
    expect(run([ev('compliant'), ev('expired')]).status).toBe('expired');
    expect(run([ev('compliant'), ev('pending')]).status).toBe('pending');
    expect(run([ev('compliant'), ev('compliant')]).status).toBe('correct');
  });
  it('todo «no aplica» → No aplica; nunca produce Observación', () => {
    expect(run([ev('not_applicable')]).status).toBe('not_applicable');
    expect(run([ev('compliant')]).status).not.toBe('observation');
  });
  it('window_end es el cierre de la ventana vigente; en la anual, 12 meses desde la última evidencia válida', () => {
    expect(run([ev('compliant')], 'quarterly').windowEnd).toBe('2026-12-31');
    expect(run([ev('compliant', '2026-03-15T00:00:00Z')], 'annual').windowEnd).toBe('2027-03-14');
    expect(run([ev('compliant')], 'permanent').windowEnd).toBeNull();
    expect(run([], 'quarterly').windowEnd).toBe('2026-12-31');
  });
});

describe('pruebas manuales · el resultado del responsable (D140 puntos 1 y 2)', () => {
  const at = new Date('2026-11-12T00:00:00Z');
  it('el resultado decide: Correcto, Observación o Excepción', () => {
    expect(run([], 'quarterly', { result: 'correct', at }, true).status).toBe('correct');
    expect(run([], 'quarterly', { result: 'observation', at }, true).status).toBe('observation');
    expect(run([], 'quarterly', { result: 'exception', at }, true).status).toBe('exception');
  });
  it('una evidencia devuelta gana sobre un resultado correcto', () => {
    expect(run([ev('non_compliant')], 'quarterly', { result: 'correct', at }, true).status).toBe('exception');
  });
  it('un resultado de otra ventana vence', () => {
    expect(run([], 'quarterly', { result: 'correct', at: new Date('2026-08-01T00:00:00Z') }, true).status).toBe('expired');
  });
  it('sin resultado, una prueba que lo exige sigue pendiente aunque haya evidencia; la documental sigue a su evidencia', () => {
    expect(run([ev('compliant')], 'quarterly', null, true).status).toBe('pending');
    expect(run([ev('compliant')], 'quarterly', null, false).status).toBe('correct');
    expect(run([ev('non_compliant')], 'quarterly', null, true).status).toBe('exception');
  });
  it('un resultado correcto es la fecha desde la que corre la ventana anual', () => {
    expect(run([], 'annual', { result: 'correct', at: new Date('2026-03-15T00:00:00Z') }, true).windowEnd).toBe('2027-03-14');
  });
});
