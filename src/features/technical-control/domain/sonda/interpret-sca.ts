import { CheckResultValue } from '../scan/scan.types';
import { scaResultToCheckResult } from './sca-result';
import { CatalogLookup, InterpretedSca, InterpretedScaRow, ScaPolicyInput, UnmappedPolicy } from './sonda.types';

// Cuando un mismo check llega dos veces, manda el peor (R-05: una falla aplicable ⇒ no cumple). `not_applicable` es lo más débil.
const PRECEDENCE: CheckResultValue[] = ['failed', 'not_run', 'invalid', 'passed', 'not_applicable'];

const asDate = (iso: string | null, fallback: Date): Date => {
  const d = iso ? new Date(iso) : null;
  // Una fecha ilegible o en el futuro no se cree: se usa el momento de la lectura.
  return d && !Number.isNaN(d.getTime()) && d.getTime() <= fallback.getTime() + 60_000 ? d : fallback;
};

/**
 * Convierte lo que entregó el trabajador en filas listas para `check_results`. Es PURA: el catálogo se le pasa como una función de búsqueda, así que
 * se prueba sin base de datos. Lo que el catálogo no conoce no se guarda ni se inventa: se informa en `unmapped` (cobertura no alcanzada, D56).
 */
export function interpretSca(input: { policies: readonly ScaPolicyInput[]; lookup: CatalogLookup; readAt: Date }): InterpretedSca {
  const rows = new Map<string, InterpretedScaRow>();
  const unmapped = new Map<string, UnmappedPolicy>();
  let duplicates = 0;

  for (const p of input.policies) {
    const evaluatedAt = asDate(p.scanEndedAt, input.readAt);
    for (const c of p.checks) {
      const ref = input.lookup(p.policyId, p.name, c.id);
      if (!ref) {
        const u = unmapped.get(p.policyId) ?? { policyId: p.policyId, policyName: p.name, checks: 0 };
        u.checks += 1;
        unmapped.set(p.policyId, u);
        continue;
      }
      const result = scaResultToCheckResult(c.result);
      const current = rows.get(ref.id);
      if (!current) {
        rows.set(ref.id, { checkId: ref.id, platform: ref.platform, policyId: ref.policyId, rawCheckId: ref.rawCheckId, result, evaluatedAt, statusDetail: c.reason });
        continue;
      }
      duplicates += 1;
      if (PRECEDENCE.indexOf(result) < PRECEDENCE.indexOf(current.result)) {
        current.result = result;
        current.statusDetail = c.reason;
      }
    }
  }
  return { rows: [...rows.values()], unmapped: [...unmapped.values()], duplicates };
}
