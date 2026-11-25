import { ControlType } from './types';

export type DimensionType = 'manual' | 'automated' | 'hybrid';

// control_dimensions.type de la v1 a partir del tipo del control (contrato, «Puentes con el código v1»).
const OF_CONTROL: Record<ControlType, DimensionType> = { manual: 'manual', automated: 'automated', it_dependent_manual: 'hybrid' };
// MD-499 · Las cuatro dimensiones nuevas (RC-05) toman su tipo de las FUENTES de sus pruebas en el control: todas document/manual → manual; todas automáticas
// (probe, cloud_engine, probe_and_cloud_engine, integration) → automated; mezcla → hybrid. Las cinco de siempre conservan el tipo derivado del control.
const BY_SOURCE: readonly string[] = ['network', 'endpoint', 'physical', 'process'];
const MANUAL_SOURCES: readonly string[] = ['document', 'manual'];

export function dimensionTypeOf(dimension: string, controlType: ControlType, sourcesOfItsTests: readonly string[]): DimensionType {
  if (!BY_SOURCE.includes(dimension) || sourcesOfItsTests.length === 0) return OF_CONTROL[controlType];
  const manual = sourcesOfItsTests.filter((s) => MANUAL_SOURCES.includes(s)).length;
  if (manual === sourcesOfItsTests.length) return 'manual';
  return manual === 0 ? 'automated' : 'hybrid';
}
