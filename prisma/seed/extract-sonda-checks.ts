// Catálogo de políticas y checks de servidores (D113): hoja «Checks Wazuh» de la VF18 + conjunto de reglas de la sonda → `prisma/seed/data/sonda-checks.json.gz`.
//
//   npm run sonda:extract -- <carpeta ruleset/sca de la sonda> [referencia]
//
// Solo dev: el libro NO está en el repo (`CATALOG_XLSX_PATH`, por defecto el de Monkey-Brain-IA/assets/). El archivo resultante, comprimido (9 MB → ~1 MB), es la fuente
// del seed y lleva el sha256 del Excel. Si algo no cuadra (una política sin su par en la sonda, una que no se reconoce…), NO escribe nada.
//
// La carpeta de políticas de la sonda se baja del repositorio público en la etiqueta de la versión que se usa (p. ej. v4.14.7), solo `ruleset/sca`:
//   git clone --depth 1 --filter=blob:none --sparse --branch v4.14.7 https://github.com/wazuh/wazuh.git <carpeta nueva y vacía>
//   git -C <carpeta> sparse-checkout set ruleset/sca
// Los archivos se tratan como DATOS: solo se lee su texto, nunca se ejecutan.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { openWorkbook, readRows, SHEETS, SONDA_VERSION } from './catalog/workbook';
import { buildSondaDataset, RulesetPolicy } from './sonda/build';
import { parsePolicyHeader } from './sonda/ruleset';

export const SONDA_DATA = 'prisma/seed/data/sonda-checks.json.gz';

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.yml') ? [join(dir, e.name)] : []));

function main() {
  const scaDir = process.argv[2];
  if (!scaDir) {
    console.error('Uso: npm run sonda:extract -- <carpeta ruleset/sca de la sonda> [referencia]');
    process.exit(1);
  }
  const book = openWorkbook();
  console.log(`Fuente: ${book.file}\nsha256: ${book.sha256}`);

  const ruleset: RulesetPolicy[] = [];
  for (const f of walk(resolve(scaDir))) {
    const p = parsePolicyHeader(readFileSync(f, 'utf8'), basename(f));
    if (!p) {
      console.error(`✗ No se pudo leer la cabecera de ${basename(f)}`);
      process.exit(1);
    }
    ruleset.push(p);
  }
  console.log(`Políticas de la sonda: ${ruleset.length}`);

  const rows = readRows(book.wb, SHEETS.sondaChecks, ['Plataforma', 'Política', 'Check ID', 'Título', 'Condición', 'Remediación', 'Regla de verificación', 'SOC 2', 'TSC']);
  const matrix = readRows(book.wb, SHEETS.matrix, ['TSC Ref', 'POC #']);

  const ds = buildSondaDataset({
    rows,
    ruleset,
    soc2RequirementCodes: new Set(matrix.map((r) => String(r['TSC Ref']))),
    source: { file: book.file, sha256: book.sha256, sondaVersion: SONDA_VERSION, rulesetRef: process.argv[3] ?? `v${SONDA_VERSION}` },
  });

  mkdirSync(dirname(resolve(SONDA_DATA)), { recursive: true });
  const json = JSON.stringify(ds);
  writeFileSync(resolve(SONDA_DATA), gzipSync(Buffer.from(json, 'utf8'), { level: 9 }));
  console.log(`\n✓ ${SONDA_DATA}  (${(json.length / 1048576).toFixed(1)} MB sin comprimir)`);
  console.log(ds.meta.counts);
  ds.warnings.forEach((w) => console.warn('  ⚠ ' + w));
}

main();
