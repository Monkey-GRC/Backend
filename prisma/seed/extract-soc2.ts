// Excel del comité → prisma/seed/data/soc2-catalog.json (versionado en git).
//
//   npm run catalog:extract
//   CATALOG_XLSX_PATH="/ruta/al/TSC INTEGRAL SOC 2 DETALLADO VF.xlsx" npm run catalog:extract
//
// Solo dev: el Excel está en .gitignore. El JSON resultante es la fuente del seed, y lleva el sha256
// del archivo del que salió. La salida es determinista (sin fechas): si el Excel no cambia, el JSON
// no cambia.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import * as XLSX from 'xlsx';
import { buildCatalog, Row } from './soc2/build';
import { CATALOG_JSON } from './soc2/types';
import { validateCatalog } from './soc2/validate';

const SHEET_RELATIONS = 'Controles Monkey';
const SHEET_CONTROLS = 'Tabla controles SOC 2';
const SHEET_RISKS = 'Riesgos';
const SHEET_CAUSES = 'Causas';
const SHEET_TESTS = 'Pruebas';
const SHEET_MATRIX = 'Análisis TEST x Control';
const DEFAULT_XLSX = '../Monkey-Brain-IA/assets/TSC INTERGRAL SOC 2 DETALLADO VF.xlsx';

function readSheet(wb: XLSX.WorkBook, name: string, mustHave: string[]): Row[] {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`No existe la hoja "${name}". Hojas: ${wb.SheetNames.join(', ')}`);
  // La hoja de controles del comité trae 4 filas de título antes del encabezado: se busca la fila que lo contiene.
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  const header = grid.findIndex((r) => mustHave.every((c) => r.includes(c)));
  if (header < 0) throw new Error(`Hoja "${name}": no se encontró un encabezado con ${mustHave.join(', ')}`);
  return XLSX.utils.sheet_to_json<Row>(ws, { range: header, defval: null });
}

// La hoja "Causas" trae DOS tablas lado a lado: causas (columnas 0-6) y relaciones riesgo ↔ causa (7-12).
function readCauses(wb: XLSX.WorkBook): { causes: Row[]; riskCauses: Row[] } {
  const ws = wb.Sheets[SHEET_CAUSES];
  if (!ws) throw new Error(`No existe la hoja "${SHEET_CAUSES}"`);
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  const h = grid[0] ?? [];
  const want = ['ID_Causa', 'Causa', 'Categoria_Falla', 'Descripcion', 'Activo', 'json_fragment', 'Controles_Aplicables', 'ID_Rel', 'ID_Riesgo', 'Riesgo', 'ID_Causa', 'Causa'];
  if (want.some((c, i) => h[i] !== c)) throw new Error(`Hoja "${SHEET_CAUSES}": el encabezado no es el esperado: ${JSON.stringify(h.slice(0, 12))}`);
  const causes: Row[] = [];
  const riskCauses: Row[] = [];
  for (const r of grid.slice(1)) {
    if (/^F\d+$/.test(String(r[0] ?? ''))) {
      causes.push({ ID_Causa: r[0], Causa: r[1], Categoria_Falla: r[2], Descripcion: r[3], Activo: r[4], Controles_Aplicables: r[6] });
    }
    if (/^RC\d+$/.test(String(r[7] ?? ''))) riskCauses.push({ ID_Rel: r[7], ID_Riesgo: r[8], ID_Causa: r[10] });
  }
  return { causes, riskCauses };
}

function main() {
  const xlsxPath = resolve(process.env.CATALOG_XLSX_PATH ?? DEFAULT_XLSX);
  const bytes = readFileSync(xlsxPath);
  const sha = createHash('sha256').update(bytes).digest('hex');
  console.log(`Fuente: ${basename(xlsxPath)}\nsha256: ${sha}`);

  const wb = XLSX.read(bytes);
  const relations = readSheet(wb, SHEET_RELATIONS, ['TSC Ref', 'POC #', 'ID']);
  const controls = readSheet(wb, SHEET_CONTROLS, ['ID', 'Control', 'Descripción', 'Dominio']);
  const risks = readSheet(wb, SHEET_RISKS, ['ID_Riesgo', 'Criterio']).filter((r) => /^R\d+$/.test(String(r['ID_Riesgo'] ?? '')));
  const { causes, riskCauses } = readCauses(wb);
  const tests = readSheet(wb, SHEET_TESTS, ['ID TEST', 'DIMENSIÓN']).filter((r) => r['ID TEST']);
  const matrix = readSheet(wb, SHEET_MATRIX, ['ID Control', 'Total TEST']).filter((r) => /^[A-Z]{3}-\d+$/.test(String(r['ID Control'] ?? '')));
  console.log(
    `Filas leídas: ${relations.length} relaciones, ${controls.length} controles, ${risks.length} riesgos, ${causes.length} causas, ` +
      `${riskCauses.length} relaciones riesgo↔causa, ${tests.length} pruebas, ${matrix.length} filas de la matriz de pruebas`,
  );

  const { catalog, errors } = buildCatalog(
    { relations, controls, risks, causes, riskCauses, tests, matrix },
    {
      sourceFile: basename(xlsxPath),
      sourceSha256: sha,
      sheets: { requirementsAndRelations: SHEET_RELATIONS, controls: SHEET_CONTROLS, risks: SHEET_RISKS, causes: SHEET_CAUSES, tests: SHEET_TESTS, testMatrix: SHEET_MATRIX },
    },
  );
  const all = [...errors, ...validateCatalog(catalog)];
  if (all.length) {
    console.error(`\n✗ ${all.length} error(es) en el catálogo; NO se escribió el JSON:`);
    for (const m of all) console.error('  - ' + m);
    process.exit(1);
  }

  const out = resolve(CATALOG_JSON);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n');
  console.log('\n✓ Catálogo consistente. Conteos:', catalog.meta.counts);
  console.log('\nConstancia sobre la fuente:');
  for (const n of catalog.meta.sourceNotes) console.log('  · ' + n);
  console.log(`✓ Escrito ${CATALOG_JSON}`);
}

main();
