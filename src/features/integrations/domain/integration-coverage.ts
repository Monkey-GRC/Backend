import { CoverageRecord, IntegrationCoverage } from './entities/integration.entities';

// Lo que la integración ALIMENTA, no lo que aprueba: que un control cumpla lo decide el cálculo con todas sus pruebas y evidencias (regla 4). Los controles se cuentan sin repetir,
// en total y por marco.
export function deriveCoverage(record: CoverageRecord | null): IntegrationCoverage | null {
  if (!record) return null;
  const byFramework = new Map<string, { name: string; controls: Set<string> }>();
  for (const l of record.frameworkLinks) {
    const entry = byFramework.get(l.frameworkCode) ?? { name: l.frameworkName, controls: new Set<string>() };
    entry.controls.add(l.controlId);
    byFramework.set(l.frameworkCode, entry);
  }
  return {
    tests: [...record.tests].sort((a, b) => a.code.localeCompare(b.code)),
    controlsCount: new Set(record.controlIds).size,
    frameworks: [...byFramework]
      .map(([code, f]) => ({ code, name: f.name, controlsCount: f.controls.size }))
      .sort((a, b) => a.code.localeCompare(b.code)),
  };
}
