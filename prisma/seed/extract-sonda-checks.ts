// Catálogo de políticas y checks de servidores (D112): Excel del comité + conjunto de reglas de la sonda → `prisma/seed/data/sonda-checks.json.gz`.
//
//   npm run sonda:extract -- <carpeta ruleset/sca de la sonda> [referencia]
//
// Solo dev: el Excel NO está en el repo (`SONDA_XLSX_PATH`, por defecto el de la raíz de Monkey). El archivo resultante, comprimido (9 MB → ~1 MB), es la fuente
// del seed y lleva el sha256 del Excel. Si algo no cuadra (una política sin su par en la sonda, una que no se reconoce…), NO escribe nada.
//
// La carpeta de políticas de la sonda se baja del repositorio público en la etiqueta de la versión que se usa (p. ej. v4.14.6), solo `ruleset/sca`:
//   git clone --depth 1 --filter=blob:none --sparse --branch v4.14.6 https://github.com/wazuh/wazuh.git <carpeta nueva y vacía>
//   git -C <carpeta> sparse-checkout set ruleset/sca
// Los archivos se tratan como DATOS: solo se lee su texto, nunca se ejecutan.
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import * as XLSX from 'xlsx';
import { buildSondaDataset, RulesetPolicy } from './sonda/build';
import { parsePolicyHeader } from './sonda/ruleset';

export const SONDA_DATA = 'prisma/seed/data/sonda-checks.json.gz';
const SONDA_VERSION = '4.14.6';

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.yml') ? [join(dir, e.name)] : []));

function main() {
  const scaDir = process.argv[2];
  if (!scaDir) {
    console.error('Uso: npm run sonda:extract -- <carpeta ruleset/sca de la sonda> [referencia]');
    process.exit(1);
  }
  const xlsxPath = resolve(process.env.SONDA_XLSX_PATH ?? '../TSC INTERGRAL SOC 2 DETALLADO VF2.xlsx');
  const bytes = readFileSync(xlsxPath);
  const sha = createHash('sha256').update(bytes).digest('hex');
  console.log(`Fuente: ${basename(xlsxPath)}\nsha256: ${sha}`);

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

  const sheet = XLSX.read(bytes, { type: 'buffer' }).Sheets['Checks'];
  if (!sheet) throw new Error('El Excel no tiene la hoja «Checks».');
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const soc2 = JSON.parse(readFileSync(resolve('prisma/seed/data/soc2-catalog.json'), 'utf8')) as { requirements: { code: string }[] };

  const ds = buildSondaDataset({
    rows,
    ruleset,
    soc2RequirementCodes: new Set(soc2.requirements.map((r) => r.code)),
    source: { file: basename(xlsxPath), sha256: sha, sondaVersion: SONDA_VERSION, rulesetRef: process.argv[3] ?? `v${SONDA_VERSION}` },
  });

  mkdirSync(dirname(resolve(SONDA_DATA)), { recursive: true });
  const json = JSON.stringify(ds);
  writeFileSync(resolve(SONDA_DATA), gzipSync(Buffer.from(json, 'utf8'), { level: 9 }));
  console.log(`\n✓ ${SONDA_DATA}  (${(json.length / 1048576).toFixed(1)} MB sin comprimir)`);
  console.log(ds.meta.counts);
  ds.warnings.forEach((w) => console.warn('  ⚠ ' + w));
}

main();
