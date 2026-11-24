import { EvaluationParameters } from '../engine/v2/parameters';
import { BOOK_PARAMETERS } from '../engine/v2/parameters.fixtures';
import { AssetResult } from '../engine/states';
import { Periodicity, TestType } from '../engine/v2/types';
import { NO_LINKS, ReadoutAsset, ReadoutControl, ReadoutData, ReadoutRequirement, ReadoutSignals, ReadoutTest, ResultsIndex, TestLinks, resultKey } from './control-readout';

// Armado de controles y de la foto de un servicio para las pruebas del motor v2. Solo lo usan las pruebas.
// Los valores del libro, desde un único fixture de pruebas.
export const PARAMS: EvaluationParameters = BOOK_PARAMETERS;
export const NOW = new Date('2026-11-23T12:00:00Z');

export const links = (patch: Partial<TestLinks> = {}): TestLinks => ({ ...NO_LINKS, ...patch });

export const readoutTest = (id: string, type: TestType, patch: Partial<ReadoutTest> = {}): ReadoutTest => ({
  testId: id, code: `T-${id}`, displayName: null, displayNameEn: null, displayDescription: null, testType: type, dimension: type === 'technical' ? 'server' : 'policy', mandatory: true, active: true,
  ...(type === 'technical' ? { links: links({ directCheckCount: 1, directKeys: [`check:${id}`] }) } : {}), ...patch,
});

export const requirement = (id: string, tests: ReadoutTest[], patch: Partial<ReadoutRequirement> = {}): ReadoutRequirement => ({
  id, code: `REQ-${id}`, text: `Requisito ${id}`, type: tests[0]?.testType === 'technical' ? 'technical' : 'documentary', periodicity: null, isApplicable: true, tests, ...patch,
});

export const control = (requirements: ReadoutRequirement[], patch: Partial<ReadoutControl> = {}): ReadoutControl => ({
  id: 'c1', serviceId: 's1', ownCode: 'C01', name: 'Control', origin: 'catalog', type: 'hybrid', interpretation: 'x', catalogDescription: 'x', dimensions: [],
  tests: requirements.flatMap((r) => r.tests), trustCriteria: ['security'], access: { owner: null, executor: null }, approval: 'approved', catalogCode: 'IAC-1', requirementCodes: ['CC6.1'],
  pointsOfFocus: [], evidence: [], catalogControlId: 'cat-c1', periodicity: null, requirements, ...patch,
});

export const asset = (id: string, type = 'server'): ReadoutAsset => ({ id, name: `activo-${id}`, type });
export const servers = (n: number): ReadoutAsset[] => Array.from({ length: n }, (_, i) => asset(`a${i + 1}`));

export const signals = (patch: Partial<ReadoutSignals> = {}): ReadoutSignals => ({
  now: NOW, parameters: PARAMS, resultDates: new Map(), exceptions: new Set(), complementaryFails: new Set(), moduleFacts: new Map(), verdicts: new Map(), ...patch,
});

/** Resultado por activo de una prueba técnica de un control: `compliant` los primeros `pass`, etc. Todos fechados «hace una hora». */
export function serverResults(controlId: string, testId: string, assets: readonly ReadoutAsset[], results: ReadonlyArray<AssetResult | null>): { results: Map<string, AssetResult>; dates: Map<string, Date> } {
  const map = new Map<string, AssetResult>();
  const dates = new Map<string, Date>();
  assets.forEach((a, i) => {
    const r = results[i];
    if (r) {
      map.set(resultKey(controlId, testId, a.id), r);
      dates.set(resultKey(controlId, testId, a.id), new Date(NOW.getTime() - 3_600_000));
    }
  });
  return { results: map, dates };
}

export const repeat = <T>(n: number, value: T): T[] => Array.from({ length: n }, () => value);

export function data(controls: ReadoutControl[], assets: ReadoutAsset[], extra: { results?: ResultsIndex; signals?: Partial<ReadoutSignals> } = {}): ReadoutData {
  return { controls, assets, results: extra.results ?? new Map(), signals: signals(extra.signals) };
}

export const periodic = (periodicity: Periodicity | null): Pick<ReadoutRequirement, 'periodicity'> => ({ periodicity });
