// Calcula el estado de preparación de una cuenta de nube desde un escaneo real, SIN base de datos (herramienta de desarrollo y de demo).
//
//   npm run cloud:readiness -- <escaneo.ocsf.json> [--production]
//
// Usa el catálogo de checks y las asignaciones propuestas de prisma/seed/data/cloud-aws-checks.json. Con --production solo cuenta lo que
// el comité ratificó (hoy nada: todo es propuesta).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { interpretScan } from '../src/features/technical-control/domain/scan/interpret-scan';
import { computeReadiness, TestCheckLink } from '../src/features/technical-control/domain/scan/readiness';
import { parseOcsfFindings } from '../src/features/technical-control/infrastructure/engine/ocsf-parser';

const file = process.argv[2];
if (!file) {
  console.error('Uso: npm run cloud:readiness -- <escaneo.ocsf.json> [--production]');
  process.exit(1);
}
const includeProposed = !process.argv.includes('--production');
const seed = JSON.parse(readFileSync(resolve('prisma/seed/data/cloud-aws-checks.json'), 'utf8')) as {
  checks: { checkId: string }[];
  testChecks: { testCode: string; checkId: string; provenance: TestCheckLink['provenance'] }[];
};

const findings = parseOcsfFindings(JSON.parse(readFileSync(resolve(file), 'utf8')));
const { results, unexpectedChecks } = interpretScan({ executedCheckIds: seed.checks.map((c) => c.checkId), findings });
const out = computeReadiness(results, seed.testChecks, { includeProposed });

const label = { ready: 'Preparado', almost_ready: 'Casi listo', needs_work: 'Requiere trabajo', not_measured: 'Sin medir' } as const;
const area = { identity_access: 'Acceso e identidades', data_network: 'Protección de datos y red', logging_backup: 'Registros y respaldos' } as const;
console.log(`\nEstado de preparación: ${label[out.readiness]}   ${includeProposed ? '(incluye mapeos PROPUESTOS, no ratificados)' : '(solo ratificado)'}`);
console.log(`Cobertura: se midieron ${out.coverage.measured} de ${out.coverage.expected} comprobaciones esperadas · de lo medido, cumplen ${out.ofMeasured.compliant} y no cumplen ${out.ofMeasured.notCompliant}`);
console.log(`Requieren revisión manual: ${out.needsManualReview}\n`);
for (const a of out.areas) console.log(`  ${area[a.area].padEnd(28)} ${label[a.readiness].padEnd(17)} hallazgos abiertos: ${String(a.openFindings).padStart(3)}   sin medir: ${a.notMeasured}`);
const na = results.filter((r) => r.result === 'not_applicable').length;
console.log(`\nComprobaciones sin recursos en la cuenta (no aplican): ${na} · filas del motor: ${findings.length}${unexpectedChecks.length ? ` · ⚠ checks fuera de la corrida: ${unexpectedChecks.join(', ')}` : ''}`);
