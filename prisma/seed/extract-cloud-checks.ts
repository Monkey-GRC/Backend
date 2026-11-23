// Catálogo de checks del motor de nube (D56): hoja «Checks prowler» de la VF18 → prisma/seed/data/cloud-<plataforma>-checks.json (una por plataforma, 20).
//
//   npm run cloud:extract                       # CATALOG_XLSX_PATH apunta al libro (por defecto el de Monkey-Brain-IA/assets/)
//
// Los vínculos prueba–check no se proponen aquí: los define el comité en TEST_CHECKS y los cruza `catalog:extract`. Si algo no cuadra, NO escribe.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCloudDatasets, PLATFORMS } from './cloud/build';
import { datasetPath } from './cloud/datasets';
import { CLOUD_ENGINE_VERSION, openWorkbook, readRows, SHEETS } from './catalog/workbook';

const book = openWorkbook();
console.log(`Fuente: ${book.file}\nsha256: ${book.sha256}`);
const rows = readRows(book.wb, SHEETS.cloudChecks, ['Plataforma', 'Servicio', 'Check ID', 'Título', 'Severidad', 'Remediación', 'Qué evalúa', 'SOC 2']);
const { datasets, errors } = buildCloudDatasets(rows, { engineVersion: CLOUD_ENGINE_VERSION, sourceSha256: book.sha256 });
const missing = PLATFORMS.filter((p) => !datasets.has(p));
if (missing.length) errors.push(`El libro no trae checks de: ${missing.join(', ')}.`);
if (errors.length) {
  console.error(`✗ ${errors.length} error(es); no se escribió nada:`);
  errors.slice(0, 40).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
let checks = 0;
for (const p of PLATFORMS) {
  const ds = datasets.get(p)!;
  writeFileSync(resolve(datasetPath(p)), JSON.stringify(ds, null, 2) + '\n');
  checks += ds.checks.length;
  console.log(`  ${p.padEnd(18)} checks ${String(ds.checks.length).padStart(4)} · mapeos de marcos ${String(ds.mappings.length).padStart(5)}`);
}
console.log(`✓ ${checks} checks en ${PLATFORMS.length} plataformas (motor ${CLOUD_ENGINE_VERSION})`);
