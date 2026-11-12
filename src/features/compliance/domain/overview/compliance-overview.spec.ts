import { buildOverview, readinessOfRollup } from './compliance-overview';
import { ReadoutAsset, ReadoutControl, ReadoutTest, readControl, resultKey, ResultsIndex } from '../controls/control-readout';
import { AssetResult } from '../engine/states';
import type { OverviewCriterionData, OverviewFrameworkData, Placement } from '../controls/control.repository';

// Casos del motor del comité vistos desde el resumen del servicio (MD-137): marco y categorías con controles únicos, «todo o nada» y «sin medir».
const FW = 'fw-soc2';
const framework = (patch: Partial<OverviewFrameworkData> = {}): OverviewFrameworkData => ({
  frameworkId: FW, code: 'soc2', name: 'SOC 2', catalogVersion: 3, periodStart: new Date('2026-01-01'), periodEnd: new Date('2026-12-31'), cutoffDate: new Date('2026-10-14'), ...patch,
});
const CRITERIA: OverviewCriterionData[] = [
  { criterion: 'security', mandatory: true, selected: false },
  { criterion: 'availability', mandatory: false, selected: true },
  { criterion: 'privacy', mandatory: false, selected: false },
];

const test = (id: string): ReadoutTest => ({ testId: id, code: `T-${id}`, displayName: null, displayNameEn: null, displayDescription: null, dimension: 'cloud', mandatory: true, active: true });
const control = (id: string, patch: Partial<ReadoutControl> = {}): ReadoutControl => ({
  id, serviceId: 's1', ownCode: id.toUpperCase(), name: `Control ${id}`, origin: 'catalog', type: 'automated', interpretation: 'x', catalogDescription: 'x', dimensions: [],
  tests: [test(`t-${id}`)], trustCriteria: ['security'], assignee: null, assignedUserIds: [], responsibleByDimension: {}, approval: 'approved', catalogCode: `IAC-${id}`, requirementCodes: ['CC6.1'], pointsOfFocus: [], documentary: [], ...patch,
});
const ASSETS: ReadoutAsset[] = [{ id: 'a1', name: 'cuenta-aws', type: 'cloud_service' }];
const outcome = (c: ReadoutControl, result: AssetResult | null): ResultsIndex => (result ? new Map([[resultKey(c.id, `t-${c.id}`, 'a1'), result]]) : new Map());

/** Arma el servicio: cada control con su resultado y su ubicación (marco y categoría). */
function overview(entries: Array<{ c: ReadoutControl; result: AssetResult | null; places: string[] }>, fw: OverviewFrameworkData = framework(), onlyFailingOf: string | null = null) {
  const results: ResultsIndex = new Map(entries.flatMap((e) => [...outcome(e.c, e.result)]));
  const readouts = entries.map((e) => readControl(e.c, ASSETS, results));
  const placements = new Map<string, Placement[]>(entries.map((e) => [e.c.id, e.places.map((criterion) => ({ frameworkId: FW, criterion }))]));
  return buildOverview({ readouts, frameworks: [fw], criteria: CRITERIA, placements, onlyFailingOf })[0];
}

describe('readinessOfRollup', () => {
  it('sin nada decidido es «Sin medir»; todos efectivos, «Preparado»', () => {
    expect(readinessOfRollup({ total: 4, measured: 0, done: 0, failing: 0 })).toBe('not_measured');
    expect(readinessOfRollup({ total: 0, measured: 0, done: 0, failing: 0 })).toBe('not_measured');
    expect(readinessOfRollup({ total: 4, measured: 4, done: 4, failing: 0 })).toBe('ready');
  });
  it('si nada falla pero algo sigue pendiente es «Casi listo»; con fallos, según el avance (corte del 80 %)', () => {
    expect(readinessOfRollup({ total: 4, measured: 2, done: 2, failing: 0 })).toBe('almost_ready');
    expect(readinessOfRollup({ total: 5, measured: 5, done: 4, failing: 1 })).toBe('almost_ready');
    expect(readinessOfRollup({ total: 5, measured: 5, done: 3, failing: 2 })).toBe('needs_work');
  });
});

describe('buildOverview — un servicio sin resultados', () => {
  it('queda «Sin medir» en todos los niveles y no inventa ningún cumplimiento', () => {
    const o = overview([{ c: control('1'), result: null, places: ['security'] }, { c: control('2'), result: null, places: ['security'] }]);
    expect(o.readiness).toBe('not_measured');
    expect(o.progress).toEqual({ done: 0, total: 2 });
    expect(o.coverage).toEqual({ measured: 0, applicable: 2 });
    expect(o.categories.every((c) => c.readiness === 'not_measured' && c.failingControls.length === 0)).toBe(true);
  });
});

describe('buildOverview — categorías en alcance', () => {
  it('Seguridad es obligatoria aunque no se elija; una categoría no elegida no aparece; las demás, solo si tienen controles', () => {
    const o = overview([{ c: control('1'), result: 'compliant', places: ['security'] }, { c: control('2'), result: 'compliant', places: ['privacy'] }]);
    expect(o.categories.map((c) => c.trustCriterion)).toEqual(['security']);
  });

  it('una categoría elegida con controles aparece en el orden canónico', () => {
    const o = overview([{ c: control('1'), result: 'compliant', places: ['availability'] }, { c: control('2'), result: 'compliant', places: ['security'] }]);
    expect(o.categories.map((c) => c.trustCriterion)).toEqual(['security', 'availability']);
  });
});

describe('buildOverview — todo o nada (RN-17, RN-19)', () => {
  it('un solo control que no cumple hace que el marco no cumpla, aunque el avance sea alto', () => {
    const entries = [...Array.from({ length: 4 }, (_, i) => ({ c: control(`${i + 1}`), result: 'compliant' as AssetResult, places: ['security'] })), { c: control('5'), result: 'non_compliant' as AssetResult, places: ['security'] }];
    const o = overview(entries);
    expect(o.technical.state).toBe('non_compliant');
    expect(o.progress).toEqual({ done: 4, total: 5 });
    expect(o.readiness).toBe('almost_ready'); // 80 % de avance: «Casi listo», pero el estado técnico dice que no cumple
    expect(o.technical.failing).toEqual(['IAC-5']);
  });

  it('con todos los controles efectivos el marco cumple y queda «Preparado»', () => {
    const o = overview([{ c: control('1'), result: 'compliant', places: ['security'] }, { c: control('2'), result: 'compliant', places: ['security'] }]);
    expect(o.technical.state).toBe('compliant');
    expect(o.readiness).toBe('ready');
  });

  it('lo pendiente nunca cuenta como cumplido: el marco queda en evaluación', () => {
    const o = overview([{ c: control('1'), result: 'compliant', places: ['security'] }, { c: control('2'), result: null, places: ['security'] }]);
    expect(o.technical.state).toBe('evaluating');
    expect(o.coverage).toEqual({ measured: 1, applicable: 2 });
    expect(o.technical.pending).toEqual(['IAC-2']);
    expect(o.readiness).toBe('almost_ready');
  });

  it('un control compartido entre dos categorías cuenta una sola vez en el marco', () => {
    const shared = { c: control('1'), result: 'compliant' as AssetResult, places: ['security', 'availability'] };
    const o = overview([shared, { c: control('2'), result: 'non_compliant', places: ['availability'] }]);
    expect(o.progress).toEqual({ done: 1, total: 2 });
    expect(o.technical.uniqueControls).toBe(2);
    expect(o.categories.find((c) => c.trustCriterion === 'security')!.progress).toEqual({ done: 1, total: 1 });
    expect(o.categories.find((c) => c.trustCriterion === 'availability')!.progress).toEqual({ done: 1, total: 2 });
  });
});

describe('buildOverview — qué falla', () => {
  it('lista los controles que no cumplen con su código, los requisitos que cubren y el activo afectado', () => {
    const o = overview([{ c: control('1'), result: 'non_compliant', places: ['security'] }, { c: control('2'), result: 'compliant', places: ['security'] }]);
    const failing = o.categories[0].failingControls;
    expect(failing).toHaveLength(1);
    expect(failing[0]).toMatchObject({ code: 'IAC-1', ownCode: null, requirementCodes: ['CC6.1'] });
    expect(failing[0].readout.failing).toEqual([{ dimension: 'cloud', affected: [{ kind: 'asset', id: 'a1', name: 'cuenta-aws' }] }]);
  });

  it('un control propio se nombra con su código propio y lo devuelve como own_code', () => {
    const own = control('9', { origin: 'own', catalogCode: null, ownCode: 'C09', requirementCodes: [] });
    const o = overview([{ c: own, result: 'non_compliant', places: ['security'] }]);
    expect(o.categories[0].failingControls[0]).toMatchObject({ code: 'C09', ownCode: 'C09' });
  });

  it('un responsable ve el marco completo pero solo los fallos de lo que tiene asignado', () => {
    const mine = control('1', { assignedUserIds: ['u1'] });
    const entries = [{ c: mine, result: 'non_compliant' as AssetResult, places: ['security'] }, { c: control('2'), result: 'non_compliant' as AssetResult, places: ['security'] }];
    const o = overview(entries, framework(), 'u1');
    expect(o.progress).toEqual({ done: 0, total: 2 });
    expect(o.categories[0].failingControls.map((f) => f.code)).toEqual(['IAC-1']);
  });
});

describe('buildOverview — evaluación sin definir (P26)', () => {
  it('sin período auditado ni fecha de corte el motor no ejecuta: «Sin medir» aunque haya resultados', () => {
    const o = overview([{ c: control('1'), result: 'non_compliant', places: ['security'] }], framework({ periodStart: null, cutoffDate: null }));
    expect(o.readiness).toBe('not_measured');
    expect(o.progress).toEqual({ done: 0, total: 1 });
    expect(o.categories[0].failingControls).toEqual([]);
    expect(o.technical.state).toBe('evaluating');
  });
});
