import { NOW } from '../../controls/readout.fixtures';
import { evaluateManualTest, ManualEvidence } from './manual-test';
import { Periodicity } from './types';

const ev = (state: ManualEvidence['state'], submittedAt: string | null = '2026-11-10T00:00:00Z'): ManualEvidence => ({ state, submittedAt: submittedAt ? new Date(submittedAt) : null });
const run = (evidence: ManualEvidence[], periodicity: Periodicity | null = 'quarterly', verdict: Parameters<typeof evaluateManualTest>[0]['verdict'] = null) => evaluateManualTest({ evidence, periodicity, now: NOW, verdict });

describe('pruebas manuales · puente DT-114', () => {
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
  it('un veredicto aprobado (D85, D121) da su resultado; un rechazo del veredicto o de la evidencia gana', () => {
    const at = new Date('2026-11-12T00:00:00Z');
    expect(run([], 'quarterly', { result: 'compliant', at }).status).toBe('correct');
    expect(run([], 'quarterly', { result: 'non_compliant', at }).status).toBe('exception');
    expect(run([ev('non_compliant')], 'quarterly', { result: 'compliant', at }).status).toBe('exception');
    expect(run([], 'quarterly', { result: 'compliant', at: new Date('2026-08-01T00:00:00Z') }).status).toBe('expired');
  });
});
