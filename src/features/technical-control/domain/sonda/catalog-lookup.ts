import { CatalogCheckRef, CatalogLookup } from './sonda.types';

// Una política del catálogo del comité con los checks que contiene (D113). La clave natural de un check es de tres partes (`platform` + `policy_id` + `check_id`, D6);
// en la sonda, `policy_id` es el id oficial de la política (`scaId`).
export type CatalogPolicy = { scaId: string; benchmark: string; checks: { id: string; platform: string; checkId: string }[] };

// Los nombres se comparan sin mayúsculas, sin espacios de más y sin el punto final («CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.»): el comité y la sonda no los escriben igual.
const norm = (s: string): string => s.trim().replace(/\s+/g, ' ').replace(/\.$/, '').toLowerCase();

/**
 * Arma la búsqueda de un check en el catálogo. Una política se reconoce por su id (lo normal) y, si el id no está, por su NOMBRE: el comité la nombra así.
 * Es pura: el catálogo se le pasa ya leído, así que se prueba sin base de datos.
 *
 * `executed` es cuántos checks del catálogo tienen las políticas que la sonda SÍ entregó y que reconocemos: es el conjunto «ejecutado» de la corrida (D56). Lo que la sonda
 * entregó y el catálogo no conoce no cuenta aquí: se informa aparte como no mapeado.
 */
export function buildCatalogLookup(catalog: readonly CatalogPolicy[], reported: readonly { policyId: string; name: string }[]): { lookup: CatalogLookup; executed: number } {
  const byId = new Map(catalog.map((p) => [p.scaId, p]));
  const byName = new Map(catalog.map((p) => [norm(p.benchmark), p]));
  const resolve = (policyId: string, name: string): CatalogPolicy | undefined => byId.get(policyId) ?? byName.get(norm(name));

  const index = new Map<CatalogPolicy, Map<string, CatalogCheckRef>>();
  const checksOf = (p: CatalogPolicy): Map<string, CatalogCheckRef> => {
    let m = index.get(p);
    if (!m) {
      m = new Map(p.checks.map((c) => [c.checkId, { id: c.id, platform: c.platform, policyId: p.scaId, rawCheckId: c.checkId }]));
      index.set(p, m);
    }
    return m;
  };

  const known = new Set<CatalogPolicy>();
  for (const r of reported) {
    const p = resolve(r.policyId, r.name);
    if (p) known.add(p);
  }
  let executed = 0;
  for (const p of known) executed += p.checks.length;

  return {
    lookup: (policyId, name, rawCheckId) => {
      const p = resolve(policyId, name);
      return p ? (checksOf(p).get(rawCheckId) ?? null) : null;
    },
    executed,
  };
}
