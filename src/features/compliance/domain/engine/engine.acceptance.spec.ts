import { evaluateAutomatedTestFromAssets } from './automated-test';
import { evaluateControl } from './control';
import { evaluateDocumentaryTest, evaluateEvidence } from './documentary-test';
import { evaluateCategory, evaluateFramework } from './rollup';
import { AssetResult } from './states';

// Validaciones V01 a V08 y V14 de la hoja MODELO EVALUACIÓN MONKEY, y las simulaciones de propagación, recorriendo TODOS los niveles juntos:
// activo → test → control → categoría → marco.

const servers = (compliant: number, others: AssetResult[] = []): AssetResult[] => [...Array.from({ length: compliant }, () => 'compliant' as const), ...others];
const testOf = (id: string, assets: AssetResult[]) => ({ testId: id, state: evaluateAutomatedTestFromAssets(assets).state, mandatory: true, active: true });

// Un servicio pequeño: dos controles, una categoría, un marco. `serverAssets` es lo que dijeron los servidores en T-SRV-001.
function evaluateService(serverAssets: AssetResult[], missingDimensions = 0) {
  const documentary = evaluateDocumentaryTest([
    evaluateEvidence({ typeOk: true, periodOk: true, approvedOk: true, signedOk: true, contentOk: true, validOk: true, review: 'human_validated' }),
  ]);
  const control1 = evaluateControl({ tests: [testOf('T-SRV-001', serverAssets), { testId: 'T-DOC-001', state: documentary, mandatory: true, active: true }], missingDimensions });
  const control2 = evaluateControl({ tests: [testOf('T-DB-001', servers(5))], missingDimensions: 0 });
  const controls = [
    { controlId: 'IAC-1', state: control1.state },
    { controlId: 'IAC-2', state: control2.state },
  ];
  const category = evaluateCategory({ inScope: true, controls });
  const framework = evaluateFramework([{ inScope: true, controls }]);
  return { control1, control2, category, framework };
}

describe('Propagación entre niveles (simulaciones del comité)', () => {
  it('todo en regla: el servicio cumple de punta a punta', () => {
    const r = evaluateService(servers(50));
    expect(r.control1.state).toBe('effective');
    expect(r.category.state).toBe('compliant');
    expect(r.framework.state).toBe('compliant');
  });

  it('simulación 1 y V01: un solo servidor que no cumple propaga NO CUMPLE hasta el marco', () => {
    const r = evaluateService(servers(49, ['non_compliant']));
    expect(r.control1.state).toBe('ineffective');
    expect(r.category.state).toBe('non_compliant');
    expect(r.framework.state).toBe('non_compliant');
  });

  it('simulación 2: corregir todos los activos recupera el cumplimiento; uno solo que vuelva a fallar lo rompe otra vez', () => {
    expect(evaluateService(servers(50)).framework.state).toBe('compliant');
    expect(evaluateService(servers(49, ['non_compliant'])).framework.state).toBe('non_compliant');
    expect(evaluateService(servers(50)).framework.state).toBe('compliant');
  });

  it('V03: un test con activos pendientes nunca figura como CUMPLE, y lo pendiente bloquea hasta el marco', () => {
    const r = evaluateService(servers(49, ['pending']));
    expect(evaluateAutomatedTestFromAssets(servers(49, ['pending'])).state).not.toBe('compliant');
    expect(r.control1.state).toBe('evaluating');
    expect(r.category.state).toBe('evaluating');
    expect(r.framework.state).toBe('evaluating');
  });

  it('un error técnico no es cumplimiento ni incumplimiento: deja el control en ERROR y el marco sin decidir', () => {
    const r = evaluateService(servers(49, ['error']));
    expect(r.control1.state).toBe('error');
    expect(r.framework.state).toBe('evaluating');
  });

  it('V04: ningún control EFECTIVO tiene tests incumplidos, pendientes o dimensiones sin test', () => {
    for (const assets of [servers(49, ['non_compliant']), servers(49, ['pending']), servers(49, ['error'])]) {
      expect(evaluateService(assets).control1.state).not.toBe('effective');
    }
    expect(evaluateService(servers(50), 1).control1.state).toBe('incomplete');
  });

  it('V05 y V07: ni la categoría ni el marco cumplen con controles no efectivos o pendientes', () => {
    const r = evaluateService(servers(50), 1);
    expect(r.category.state).not.toBe('compliant');
    expect(r.framework.state).not.toBe('compliant');
  });

  it('V14: un test documental sin evidencia validada por una persona nunca cumple', () => {
    expect(evaluateDocumentaryTest([])).not.toBe('compliant');
    const byAi = evaluateEvidence({ typeOk: true, periodOk: true, approvedOk: true, signedOk: true, contentOk: true, validOk: true, review: 'ai_prevalidated' });
    expect(evaluateDocumentaryTest([byAi])).not.toBe('compliant');
  });

  it('los 3 excluidos autorizados salen del universo y no rompen el cumplimiento (C5 de punta a punta)', () => {
    const r = evaluateService(servers(47, ['excluded', 'excluded', 'excluded']));
    expect(r.framework.state).toBe('compliant');
  });
});
