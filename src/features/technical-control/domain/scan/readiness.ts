import { InterpretedResult } from './scan.types';

// Las pruebas de nube del comité, agrupadas en lenguaje de negocio (contracts/modules/control-tecnico.md). Agrupación propuesta por
// desarrollo; falta ratificarla con el comité.
export const READINESS_AREAS = {
  identity_access: ['T-CLD-001', 'T-CLD-011'],
  data_network: ['T-CLD-002'],
  logging_backup: ['T-CLD-003', 'T-CLD-008', 'T-CLD-009', 'T-CLD-010'],
} as const;
export type ReadinessArea = keyof typeof READINESS_AREAS;
export type Readiness = 'ready' | 'almost_ready' | 'needs_work' | 'not_measured';

export type TestCheckLink = { testCode: string; checkId: string; provenance: 'engine_native' | 'monkey_proposed' | 'committee_ratified' };

export type AreaReadiness = { area: ReadinessArea; readiness: Readiness; openFindings: number; notMeasured: number; compliant: number };
export type AssetReadiness = {
  readiness: Readiness;
  coverage: { measured: number; expected: number };
  ofMeasured: { compliant: number; notCompliant: number };
  areas: AreaReadiness[];
  needsManualReview: number;
};

const SEVERE = new Set(['high', 'critical']);
const evaluationId = (r: InterpretedResult) => `${r.checkId}|${r.resourceKey}`;

/**
 * Estado de preparación de UN activo de nube, derivado de sus resultados (nunca almacenado: §9).
 *
 * Umbrales PROVISIONALES (propuesta de desarrollo, falta el comité): el modelo fija el estado binario del control (R-05) pero no cuándo
 * algo es «Casi listo». Mientras tanto:
 *  - `needs_work`  → hay un fallo de severidad alta o crítica.
 *  - `almost_ready`→ solo hay fallos leves, o algo sin medir.
 *  - `ready`       → nada falla y todo lo esperado se midió.
 *  - `not_measured`→ no hay nada medido: es un hueco de cobertura, no un fallo (R-06).
 * `includeProposed = false` es el modo de producción: solo cuenta lo que el comité ratificó (D56).
 */
export function computeReadiness(results: readonly InterpretedResult[], links: readonly TestCheckLink[], opts: { includeProposed: boolean }): AssetReadiness {
  const usable = links.filter((l) => opts.includeProposed || l.provenance === 'committee_ratified');
  const testsByCheck = new Map<string, Set<string>>();
  for (const l of usable) {
    if (!testsByCheck.has(l.checkId)) testsByCheck.set(l.checkId, new Set());
    testsByCheck.get(l.checkId)!.add(l.testCode);
  }
  const evaluable = results.filter((r) => r.result !== 'not_applicable' && testsByCheck.has(r.checkId));

  const areas: AreaReadiness[] = (Object.keys(READINESS_AREAS) as ReadinessArea[]).map((area) => {
    const tests = new Set<string>(READINESS_AREAS[area]);
    const mine = evaluable.filter((r) => [...testsByCheck.get(r.checkId)!].some((t) => tests.has(t)));
    const compliant = mine.filter((r) => r.result === 'passed').length;
    const failed = mine.filter((r) => r.result === 'failed');
    const notMeasured = mine.filter((r) => r.result === 'not_run' || r.result === 'invalid').length;
    const measured = compliant + failed.length;
    let readiness: Readiness;
    if (measured === 0) readiness = 'not_measured';
    else if (failed.some((r) => SEVERE.has(r.severity ?? ''))) readiness = 'needs_work';
    else if (failed.length > 0 || notMeasured > 0) readiness = 'almost_ready';
    else readiness = 'ready';
    return { area, readiness, openFindings: failed.length, notMeasured, compliant };
  });

  // Totales del activo: una evaluación cuenta UNA vez aunque alimente varias pruebas.
  const unique = new Map(evaluable.map((r) => [evaluationId(r), r]));
  const all = [...unique.values()];
  const compliant = all.filter((r) => r.result === 'passed').length;
  const notCompliant = all.filter((r) => r.result === 'failed').length;
  const pending = all.filter((r) => r.result === 'not_run' || r.result === 'invalid').length;

  let readiness: Readiness;
  if (areas.every((a) => a.readiness === 'not_measured')) readiness = 'not_measured';
  else if (areas.some((a) => a.readiness === 'needs_work')) readiness = 'needs_work';
  else if (areas.some((a) => a.readiness !== 'ready')) readiness = 'almost_ready';
  else readiness = 'ready';

  return {
    readiness,
    coverage: { measured: compliant + notCompliant, expected: compliant + notCompliant + pending },
    ofMeasured: { compliant, notCompliant },
    areas,
    needsManualReview: all.filter((r) => r.result === 'not_run').length,
  };
}
