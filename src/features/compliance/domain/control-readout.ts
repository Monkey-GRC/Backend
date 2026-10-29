import { evaluateAutomatedTestFromAssets } from './engine/automated-test';
import { evaluateControl } from './engine/control';
import { evaluateDocumentaryTest } from './engine/documentary-test';
import type { DocumentaryEvidence } from './evidence';
import { AssetResult, ControlState, TestState } from './engine/states';

// De lo que dice la base a lo que se muestra de una acción de protección (MD-117, modelo-datos.md §9 y contracts/modules/compliance-controls.md).
// Lógica pura, sin Prisma ni Nest: recibe una foto del servicio y devuelve el estado de cada control con el motor del comité.

export type Dimension = 'policy' | 'server' | 'database' | 'app' | 'cloud';
export type ControlType = 'manual' | 'automated' | 'hybrid' | 'technical_manual';
export type Readiness = 'ready' | 'almost_ready' | 'needs_work' | 'not_measured';

// Cortes del semáforo (D62, P16): los mismos que usa el resto del producto.
export const READY_CUTOFF = 1;
export const ALMOST_READY_CUTOFF = 0.8;

/**
 * Sobre qué dimensión mide un activo (modelo-datos.md §2). `endpoint`, `network_device` y `documentation` se monitorean o se archivan pero no son
 * dimensión (D5): no entran al universo de ningún test.
 */
const DIMENSION_OF_ASSET_TYPE: Record<string, Dimension | null> = {
  server: 'server',
  database: 'database',
  cloud_service: 'cloud',
  application: 'app',
  endpoint: null,
  network_device: null,
  documentation: null,
};
export const dimensionOfAssetType = (type: string): Dimension | null => DIMENSION_OF_ASSET_TYPE[type] ?? null;

export type ReadoutTest = { testId: string; code: string; displayName: string | null; displayDescription: string | null; dimension: Dimension; mandatory: boolean; active: boolean };
export type ReadoutAsset = { id: string; name: string; type: string };
export type ReadoutDimension = { dimension: Dimension; applies: boolean; type: ControlType; reasonNotApplicable: string | null };
export type ReadoutAssignee = { userId: string; name: string | null; lastName: string | null };

export type ReadoutControl = {
  id: string;
  serviceId: string;
  ownCode: string;
  name: string;
  origin: 'catalog' | 'own';
  type: ControlType;
  interpretation: string;
  catalogDescription: string | null;
  dimensions: ReadoutDimension[];
  tests: ReadoutTest[];
  trustCriteria: string[];
  assignee: ReadoutAssignee | null;
  /** Las personas responsables del control en alguna de sus dimensiones (`assignee` es solo la primera, la que se muestra). Lo que un `funcional` ve es lo suyo (SEG-66). */
  assignedUserIds: string[];
  /** Quién es el responsable efectivo de cada dimensión del control (D96): la excepción del control o, si no hay, el responsable del servicio. */
  responsibleByDimension: Partial<Record<Dimension, string>>;
  /** Estado de aprobación de un control propio (la propuesta `create`); un control del catálogo siempre está aprobado. */
  approval: 'approved' | 'pending' | 'rejected';
  catalogCode: string | null;
  requirementCodes: string[];
  pointsOfFocus: string[];
  /** Las evidencias requeridas del control con el estado de su última entrega: de ellas sale el estado de sus pruebas documentales (D88). */
  documentary: DocumentaryEvidence[];
};

/** Último resultado de cada activo en cada test de cada control: `${controlId}|${testId}|${assetId}`. */
export type ResultsIndex = ReadonlyMap<string, AssetResult>;
export const resultKey = (controlId: string, testId: string, assetId: string) => `${controlId}|${testId}|${assetId}`;

export type FailingItem = { dimension: Dimension; affected: Array<{ kind: 'asset'; id: string; name: string } | { kind: 'test'; id: string; displayName: string | null; testCode: string }> };

export type ControlReadout = {
  control: ReadoutControl;
  readiness: Readiness;
  state: ControlState;
  progress: { done: number; total: number };
  coverage: { measured: number; applicable: number };
  failing: FailingItem[];
  tests: Array<{ test: ReadoutTest; state: TestState }>;
  approval: 'approved' | 'pending' | 'rejected';
};

/**
 * El semáforo de un control (§9 «Qué ve cada rol»): sobre el estado y el avance.
 *  · Sin Medir: nada con resultado todavía; es un hueco de cobertura, no un fallo.
 *  · Preparado: el control es efectivo (todo cumple y nada pendiente).
 *  · Casi listo: avance de 80% a menos de 100%, o todo lo medido cumple pero algo sigue pendiente.
 *  · Requiere trabajo: avance menor de 80%.
 */
export function readinessOf(input: { state: ControlState; done: number; total: number; measured: number; failingTests: number }): Readiness {
  if (input.state === 'no_tests' || input.measured === 0) return 'not_measured';
  if (input.state === 'effective') return 'ready';
  if (input.failingTests === 0) return 'almost_ready';
  return input.total > 0 && input.done / input.total >= ALMOST_READY_CUTOFF ? 'almost_ready' : 'needs_work';
}

/**
 * Estado de un test de una dimensión de activos: cada activo de ESA dimensión dice su último resultado, y el que todavía no lo dijo está pendiente
 * (lo que no se midió nunca es cumplimiento). Sin activos de la dimensión, el test no tiene sobre qué correr.
 *
 * Un test de la dimensión documental (`policy`) se resuelve por las evidencias que la persona entregó PARA ESE TEST EN ESTE CONTROL (D88, `testId` igual), con la
 * agregación de RN-04. La validación del admin_empresa es el veredicto (D96). Un documento que el catálogo sugiere para el control sin decir a qué prueba sirve (`testId` nulo) no
 * cuenta para ninguna. Sin evidencias, o sin revisar, está pendiente: nunca cumplido.
 */
function stateOfTest(control: ReadoutControl, test: ReadoutTest, assets: readonly ReadoutAsset[], results: ResultsIndex): { state: TestState; failed: ReadoutAsset[] } {
  const controlId = control.id;
  if (test.dimension === 'policy') {
    const applicable = control.documentary.filter((e) => e.testId === test.testId);
    return { state: evaluateDocumentaryTest(applicable.map((e) => e.state)), failed: [] };
  }
  const universe = assets.filter((a) => dimensionOfAssetType(a.type) === test.dimension);
  const perAsset = universe.map((a) => ({ asset: a, result: results.get(resultKey(controlId, test.testId, a.id)) ?? ('pending' as AssetResult) }));
  const state = evaluateAutomatedTestFromAssets(perAsset.map((p) => p.result)).state;
  return { state, failed: perAsset.filter((p) => p.result === 'non_compliant').map((p) => p.asset) };
}

export function readControl(control: ReadoutControl, assets: readonly ReadoutAsset[], results: ResultsIndex): ControlReadout {
  const evaluated = control.tests.map((test) => ({ test, ...stateOfTest(control, test, assets, results) }));
  const counted = control.tests.filter((t) => t.mandatory && t.active);
  // Una dimensión que el control exige y se queda sin ningún test vigente lo deja incompleto (RN-14).
  const missingDimensions = control.dimensions.filter((d) => d.applies && !counted.some((t) => t.dimension === d.dimension)).length;

  const engine = evaluateControl({
    tests: evaluated.map((e) => ({ testId: e.test.testId, state: e.state, mandatory: e.test.mandatory, active: e.test.active })),
    missingDimensions,
  });
  const countedStates = evaluated.filter((e) => e.test.mandatory && e.test.active && e.state !== 'not_applicable' && e.state !== 'deactivated');
  const done = countedStates.filter((e) => e.state === 'compliant').length;
  const failingTests = countedStates.filter((e) => e.state === 'non_compliant');
  const measured = countedStates.filter((e) => e.state === 'compliant' || e.state === 'non_compliant').length;
  const total = engine.countedTests + missingDimensions;

  // En qué falla: por dimensión, los activos que no cumplen; en la documental, la prueba (con su nombre neutro, nunca el texto del comité).
  const byDimension = new Map<Dimension, FailingItem['affected']>();
  for (const e of failingTests) {
    const list = byDimension.get(e.test.dimension) ?? [];
    if (e.test.dimension === 'policy' || e.failed.length === 0) list.push({ kind: 'test', id: e.test.testId, displayName: e.test.displayName, testCode: e.test.code });
    else for (const a of e.failed) if (!list.some((x) => x.kind === 'asset' && x.id === a.id)) list.push({ kind: 'asset', id: a.id, name: a.name });
    byDimension.set(e.test.dimension, list);
  }

  return {
    control,
    readiness: readinessOf({ state: engine.state, done, total, measured, failingTests: failingTests.length }),
    state: engine.state,
    progress: { done, total },
    coverage: { measured, applicable: total },
    failing: [...byDimension.entries()].map(([dimension, affected]) => ({ dimension, affected })),
    tests: evaluated.map((e) => ({ test: e.test, state: e.state })),
    approval: control.approval,
  };
}

/** El código interno de un control (`IAC-2`, `C10`) se ordena por su prefijo y luego por su número: `IAC-2` antes que `IAC-10`. */
export function compareOwnCode(a: string, b: string): number {
  const split = (c: string) => ({ prefix: c.replace(/\d.*$/, ''), n: Number(/\d+/.exec(c)?.[0] ?? 0) });
  const x = split(a);
  const y = split(b);
  return x.prefix !== y.prefix ? x.prefix.localeCompare(y.prefix) : x.n - y.n || a.localeCompare(b);
}
