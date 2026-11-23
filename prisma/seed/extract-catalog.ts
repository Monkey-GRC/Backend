// Libro VF18 del comité → prisma/seed/data/catalog-v2.json (versionado en git). RC-01.
//
//   npm run catalog:extract
//   CATALOG_XLSX_PATH="/ruta/al/TSC INTERGRAL SOC 2 DETALLADO VF18_DEV.xlsx" npm run catalog:extract
//
// Requiere los catálogos de checks ya extraídos del MISMO libro (`npm run sonda:extract -- <ruleset/sca>` y `npm run cloud:extract`): el cruce de TEST_CHECKS
// se hace contra ellos y se rechaza un dataset que salga de otro libro (sha256 distinto). Solo dev: el libro está en .gitignore. La salida es determinista
// (sin fechas): si el libro no cambia, el JSON no cambia. Si algo falla, NO escribe.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildCatalog, Sheets } from './catalog/build';
import { buildChecksIndex, readCloudDatasets, readSondaDataset } from './catalog/checks-index';
import { Row, text } from './catalog/parse';
import { CATALOG_V2_JSON } from './catalog/types';
import { validateCatalog } from './catalog/validate';
import { CLOUD_ENGINE_VERSION, openWorkbook, readRows, SHEETS, SONDA_VERSION } from './catalog/workbook';

function main() {
  const book = openWorkbook();
  console.log(`Fuente: ${book.file}\nsha256: ${book.sha256}`);
  const rows = (sheet: string, cols: string[], headerRow = 1): Row[] => readRows(book.wb, sheet, cols, headerRow);

  const sheets: Sheets = {
    matrix: rows(SHEETS.matrix, ['TSC Ref', 'Criterio', 'POC #', 'Punto de Enfoque (Completo)']).filter((r) => text(r['TSC Ref'])),
    controlRows: rows(SHEETS.controls, ['TSC Ref', 'Categoría TSC', 'Categoría (corto)', 'Dominio', 'POC #', 'ID', 'Control', 'Descripción', 'Documentos', 'Test', 'TIPO CONTROL', 'Periodicidad del Control', 'ROL RESPONSABLE SUGERIDO', 'ID_Causa'], 2).filter((r) => text(r['TSC Ref'])),
    requirements: rows(SHEETS.requirements, ['ID_Requisito', 'ID_Control', 'Punto L', 'Texto del requisito', 'Tipo de requisito', 'ID_Documento', 'ID_Test', 'Periodicidad', 'Obligatorio']).filter((r) => text(r['ID_Requisito'])),
    tests: rows(SHEETS.tests, ['ID_Test', 'ID_Control', 'Tipo de test', 'Dimensión', '¿Qué se asegura?', 'Fuente principal', 'Procedimiento estándar', 'Nivel', 'Automatización']).filter((r) => text(r['ID_Test'])),
    testChecks: rows(SHEETS.testChecks, ['ID_Test', 'Herramienta', 'Plataforma / Política', 'Check ID', 'Rol', 'Plataforma', 'Servicio / Política', 'Objetivo común', 'Aplica cuando']).filter((r) => text(r['ID_Test'])),
    procedures: rows(SHEETS.procedures, ['Código', 'Nombre', 'Cuándo se usa', 'Pasos genéricos', 'Evidencia típica']).filter((r) => text(r['Código'])),
    // La fila «N/A» de INTEGRACIONES (solo trae la lista de validación) no es una categoría.
    integrations: rows(SHEETS.integrations, ['Categoría', 'Controles que alimenta', 'Qué evidencia aporta', 'Procedimiento']).filter((r) => text(r['Categoría'])),
    documents: rows(SHEETS.documents, ['Código', 'Tipo', 'Documento relacionado', 'Códigos de control relacionados', 'ID_Test documental', 'Origen']).filter((r) => text(r['Código'])),
    mappings: rows(SHEETS.mappings, ['ID_Control', 'Marco', 'Requisito del marco', 'Tipo de relación', 'Justificación']).filter((r) => text(r['ID_Control'])),
    risks: rows(SHEETS.risks, ['ID_Riesgo', 'Criterio', 'Probabilidad inherente [CATEGORÍA]', 'Impacto inherente [CATEGORÍA]', 'Valor riesgo inherente (1-25)', 'Nivel riesgo inherente', 'ID_Causa']).filter((r) => /^R\d+$/.test(text(r['ID_Riesgo']))),
    causes: rows(SHEETS.causes, ['ID_Causa', 'Origen', 'Tipo_Causa', 'Descripción_Causa', 'ID_Riesgo', 'ID_Control']).filter((r) => /^F\d+$/.test(text(r['ID_Causa']))),
  };
  console.log(
    'Filas leídas: ' +
      Object.entries(sheets)
        .map(([k, v]) => `${k} ${v.length}`)
        .join(' · '),
  );

  const sonda = readSondaDataset();
  const cloud = readCloudDatasets();
  const stale = [sonda.meta.sourceSha256, ...[...cloud.values()].map((d) => d.sourceSha256)].some((sha) => sha !== book.sha256);
  if (stale) {
    console.error('✗ Los catálogos de checks (sonda o motor de nube) salieron de otro libro: corre npm run sonda:extract -- <ruleset/sca> y npm run cloud:extract.');
    process.exit(1);
  }

  const { catalog, errors, warnings } = buildCatalog(sheets, { sourceFile: book.file, sourceSha256: book.sha256, sondaVersion: SONDA_VERSION, cloudEngineVersion: CLOUD_ENGINE_VERSION }, buildChecksIndex(sonda, cloud));
  const verdict = validateCatalog(catalog);
  const all = [...errors, ...verdict.errors];
  catalog.meta.warnings = [...warnings, ...verdict.warnings];
  console.log('\nCifras obtenidas:', catalog.meta.counts);
  catalog.meta.warnings.forEach((w) => console.warn('  ⚠ ' + w));
  if (all.length) {
    console.error(`\n✗ ${all.length} error(es) en el catálogo; NO se escribió el JSON:`);
    all.slice(0, 80).forEach((m) => console.error('  - ' + m));
    if (all.length > 80) console.error(`  … y ${all.length - 80} más`);
    process.exit(1);
  }

  const out = resolve(CATALOG_V2_JSON);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`\n✓ Catálogo v2 consistente. Escrito ${CATALOG_V2_JSON}`);
}

main();
