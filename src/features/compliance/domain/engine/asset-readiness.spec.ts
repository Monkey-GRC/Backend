import { evaluateAssetReadiness } from './asset-readiness';
import { AssetResult } from './states';

const of = (compliant: number, nonCompliant = 0, rest: AssetResult[] = []): AssetResult[] => [
  ...Array.from({ length: compliant }, () => 'compliant' as const),
  ...Array.from({ length: nonCompliant }, () => 'non_compliant' as const),
  ...rest,
];

describe('evaluateAssetReadiness (MD-139, D62)', () => {
  it('10 tests con resultado y 9 cumplen → 90% y Casi listo', () => {
    const r = evaluateAssetReadiness(of(9, 1));
    expect(r.percent).toBeCloseTo(0.9);
    expect(r.state).toBe('almost_ready');
  });

  it('10 tests con resultado y 7 cumplen → Requiere trabajo', () => {
    expect(evaluateAssetReadiness(of(7, 3)).state).toBe('needs_work');
  });

  it('el corte del 80% es inclusivo; justo debajo es Requiere trabajo', () => {
    expect(evaluateAssetReadiness(of(8, 2)).state).toBe('almost_ready');
    expect(evaluateAssetReadiness(of(79, 21)).state).toBe('needs_work');
  });

  it('100% sin nada pendiente → Preparado', () => {
    expect(evaluateAssetReadiness(of(10)).state).toBe('ready');
  });

  it('100% de lo medido con tests pendientes → Casi listo y muestra su cobertura', () => {
    const r = evaluateAssetReadiness(of(8, 0, ['pending', 'pending']));
    expect(r.state).toBe('almost_ready');
    expect(r.percent).toBe(1);
    expect(r.coverage).toBeCloseTo(0.8);
    expect(r.withoutResult).toBe(2);
  });

  it('sin ningún resultado → Sin medir, sin inventar un porcentaje', () => {
    expect(evaluateAssetReadiness(['pending', 'pending'])).toMatchObject({ state: 'not_measured', percent: null });
    expect(evaluateAssetReadiness([])).toMatchObject({ state: 'not_measured', percent: null, coverage: null });
  });

  it('un test con error técnico no cuenta ni como cumplido ni como incumplido, y no baja el porcentaje', () => {
    const r = evaluateAssetReadiness(of(9, 0, ['error']));
    expect(r.percent).toBe(1);
    expect(r.nonCompliant).toBe(0);
    expect(r.state).toBe('almost_ready'); // pero tampoco es Preparado: falta medir
  });

  it('un test excluido o que no aplica sale del universo', () => {
    const r = evaluateAssetReadiness(of(5, 0, ['excluded', 'not_applicable']));
    expect(r.state).toBe('ready');
    expect(r.coverage).toBe(1);
  });

  it('un activo con todos sus tests excluidos queda Sin medir, no Preparado', () => {
    expect(evaluateAssetReadiness(['excluded', 'excluded']).state).toBe('not_measured');
  });
});
