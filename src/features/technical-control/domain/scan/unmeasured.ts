import { InterpretedResult } from './scan.types';

// D159 · En estas plataformas cada verificación revisa la ORGANIZACIÓN, que existe en cuanto se conecta: si una no vuelve no es que «no aplique», es que no se pudo medir
// (permiso, licencia o dato). En las demás nubes un check sin filas puede ser un recurso que no existe (D56).
export const ORGANIZATION_WIDE_PLATFORMS: readonly string[] = ['microsoft_365'];

/**
 * Los resultados de una corrida más una fila «Sin datos» (`not_run`) por cada verificación esperada que no volvió (`MAP CALOR` de la VF18 y regla T-04: nunca es PASS).
 * La que volvió, con cualquier resultado, se deja como está.
 */
export function withUnmeasured<T extends InterpretedResult>(expected: Iterable<string>, results: readonly T[]): (T | InterpretedResult)[] {
  const arrived = new Set(results.map((r) => r.checkId));
  const missing = [...new Set(expected)].filter((id) => !arrived.has(id));
  return [
    ...results,
    ...missing.map((checkId): InterpretedResult => ({ checkId, resourceKey: null, resourceUid: null, resourceType: null, resourceName: null, regions: [], result: 'not_run', severity: null, detail: null })),
  ];
}
