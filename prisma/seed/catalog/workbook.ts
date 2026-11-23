// Lectura del libro VF18: hojas, encabezados y versiones. Es la única parte del extractor que toca el archivo.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import * as XLSX from 'xlsx';
import { Row } from './parse';

export const DEFAULT_XLSX = '../Monkey-Brain-IA/assets/TSC INTERGRAL SOC 2 DETALLADO VF18_DEV.xlsx';
// Versiones de los catálogos de checks que trae el libro (DEV-15).
export const SONDA_VERSION = '4.14.7';
export const CLOUD_ENGINE_VERSION = '5.45.0';

export const SHEETS = {
  matrix: '8_MATRIZ_MAESTRA',
  controls: 'Controles Monkey',
  requirements: 'REQUISITOS',
  tests: 'TEST',
  testChecks: 'TEST_CHECKS',
  procedures: 'PROCEDIMIENTOS',
  integrations: 'INTEGRACIONES',
  documents: 'Documentos',
  mappings: 'MAPEO_MARCOS',
  risks: 'Riesgos',
  causes: 'Causas',
  sondaChecks: 'Checks Wazuh',
  cloudChecks: 'Checks prowler',
} as const;

export type Workbook = { wb: XLSX.WorkBook; file: string; sha256: string };

export function openWorkbook(path = process.env.CATALOG_XLSX_PATH ?? DEFAULT_XLSX): Workbook {
  const full = resolve(path);
  const bytes = readFileSync(full);
  return { wb: XLSX.read(bytes), file: basename(full), sha256: createHash('sha256').update(bytes).digest('hex') };
}

/** Filas de una hoja. El encabezado está en la fila 1, salvo en Controles Monkey (fila 2) (DEV-04). Los espacios sobrantes de los encabezados se recortan. */
export function readRows(wb: XLSX.WorkBook, sheet: string, mustHave: string[], headerRow = 1): Row[] {
  const ws = wb.Sheets[sheet];
  if (!ws) throw new Error(`No existe la hoja "${sheet}". Hojas: ${wb.SheetNames.join(', ')}`);
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  const header = (grid[headerRow - 1] ?? []).map((h) => (h === null || h === undefined ? '' : String(h).trim()));
  const missing = mustHave.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`Hoja "${sheet}": el encabezado de la fila ${headerRow} no trae ${missing.join(', ')}. Trae: ${JSON.stringify(header.filter(Boolean).slice(0, 14))}`);
  return grid.slice(headerRow).map((cells) => {
    const row: Row = {};
    header.forEach((h, i) => {
      if (h && !(h in row)) row[h] = cells[i] ?? null;
    });
    return row;
  });
}
