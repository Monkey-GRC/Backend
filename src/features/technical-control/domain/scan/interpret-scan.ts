import { CheckResultValue, EngineFinding, InterpretedResult } from './scan.types';

// Dos filas son la MISMA evaluación si el recurso solo difiere en la región (p. ej. la configuración de un servicio de la cuenta, repetida
// por cada región declarada). D53: un check de cuenta cuenta como una evaluación, no como una por región.
export function resourceKey(uid: string, region: string): string {
  return region ? uid.split(`:${region}:`).join(':{region}:') : uid;
}

const STATUS_TO_RESULT: Record<EngineFinding['status'], CheckResultValue> = {
  passed: 'passed',
  failed: 'failed',
  manual: 'not_run', // el motor no puede decidirlo: lo revisa una persona (modelo-datos.md §3.3)
  // Un silencio hecho en el motor NO se cree: sigue contando como fallo hasta que Monkey lo excluya con justificación aprobada (P14 D4).
  muted: 'failed',
  unknown: 'invalid',
};

// Cuando las filas de una misma evaluación discrepan, manda la peor (R-05: una falla aplicable ⇒ no cumple).
const PRECEDENCE: CheckResultValue[] = ['failed', 'not_run', 'invalid', 'passed'];
const SEVERITY_RANK = ['informational', 'low', 'medium', 'high', 'critical'];
const worstSeverity = (a: string | null, b: string | null) => (SEVERITY_RANK.indexOf(b ?? '') > SEVERITY_RANK.indexOf(a ?? '') ? b : a);

export type InterpretedScan = {
  results: InterpretedResult[];
  // Checks que el motor devolvió y que no estaban en la corrida: se informan, no se descartan en silencio (DT-50).
  unexpectedChecks: string[];
};

/**
 * El motor omite los checks que no encontraron recursos, así que un check SIN filas no es un check que pasó ni uno que no corrió:
 * el conjunto ejecutado es el catálogo de la corrida. Los que no devuelven filas quedan `not_applicable` (R-07), y no cuentan.
 */
export function interpretScan(input: { executedCheckIds: readonly string[]; findings: readonly EngineFinding[] }): InterpretedScan {
  const executed = new Set(input.executedCheckIds);
  const unexpected = new Set<string>();
  const groups = new Map<string, InterpretedResult>();
  const checksWithRows = new Set<string>();

  for (const f of input.findings) {
    if (!executed.has(f.checkId)) {
      unexpected.add(f.checkId);
      continue;
    }
    checksWithRows.add(f.checkId);
    const key = resourceKey(f.resource.uid, f.region);
    const id = `${f.checkId}|${key}`;
    const result = STATUS_TO_RESULT[f.status];
    const current = groups.get(id);
    if (!current) {
      groups.set(id, {
        checkId: f.checkId,
        resourceKey: key,
        resourceUid: f.resource.uid,
        resourceType: f.resource.type,
        resourceName: f.resource.name,
        regions: f.region ? [f.region] : [],
        result,
        severity: f.severity,
        detail: f.detail,
      });
      continue;
    }
    if (f.region && !current.regions.includes(f.region)) current.regions.push(f.region);
    if (PRECEDENCE.indexOf(result) < PRECEDENCE.indexOf(current.result)) {
      current.result = result;
      current.detail = f.detail;
    }
    current.severity = worstSeverity(current.severity, f.severity);
  }

  const results = [...groups.values()];
  for (const checkId of input.executedCheckIds) {
    if (checksWithRows.has(checkId)) continue;
    results.push({ checkId, resourceKey: null, resourceUid: null, resourceType: null, resourceName: null, regions: [], result: 'not_applicable', severity: null, detail: null });
  }
  return { results, unexpectedChecks: [...unexpected].sort() };
}
