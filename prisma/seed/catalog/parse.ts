// Analizadores del libro (DEV-04, DEV-05, DEV-06). Puros: reciben valores de celda y devuelven datos o null.

export type Row = Record<string, unknown>;

/** Texto de una celda, con saltos de línea normalizados y sin espacios en los extremos. Vacío si no hay valor. */
export function text(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\r\n?/g, '\n').trim();
}

export const textOrNull = (v: unknown): string | null => text(v) || null;

// Separador de cada columna que trae varios códigos (tabla 7 de 01_DESARROLLO). Un valor puede contener comas («Logs, SIEM y monitoreo»): por eso no se parte
// ninguna columna de nombres, y las de códigos solo parten donde el separador es el que declara el libro.
export const SEMICOLON = ';';
export const COMMA = ',';

export function splitList(v: unknown, sep: typeof SEMICOLON | typeof COMMA): string[] {
  return text(v)
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parte por `sep` respetando valores conocidos que contienen el separador («Logs, SIEM y monitoreo»). Se prueban de mayor a menor longitud. */
export function splitKnown(v: unknown, sep: typeof SEMICOLON | typeof COMMA, known: readonly string[]): string[] {
  let rest = text(v);
  const out: string[] = [];
  const withSep = known.filter((k) => k.includes(sep)).sort((a, b) => b.length - a.length);
  for (const k of withSep) {
    if (rest.includes(k)) {
      out.push(k);
      rest = rest.split(k).join(sep);
    }
  }
  return [...out, ...rest.split(sep).map((s) => s.trim()).filter(Boolean)];
}

/** «4 - Probable» → 4. */
export function leadingNumber(v: unknown): number | null {
  const m = /^\s*(\d+)\b/.exec(text(v));
  return m ? Number(m[1]) : null;
}

/** «L3» → 3. */
export function pointOfL(v: unknown): number | null {
  const m = /^L(\d+)$/.exec(text(v));
  return m ? Number(m[1]) : null;
}

/** «A1.1 POC 2» → { requirementCode: 'A1.1', pointNumber: 2 }. */
export function parseRequirementRef(v: unknown): { requirementCode: string; pointNumber: number } | null {
  const m = /^(\S+)\s+POC\s+(\d+)$/.exec(text(v));
  return m ? { requirementCode: m[1], pointNumber: Number(m[2]) } : null;
}

/** «Cambios detectados (dueño MNT-3)» → «MNT-3». */
export function ownerControlOf(objective: unknown): string | null {
  const m = /due[ñn]o\s+([A-Z]{3}-\d+)/.exec(text(objective));
  return m ? m[1] : null;
}

/** El prefijo del código de un criterio TSC: CC6.1 → CC, PI1.2 → PI, A1.1 → A. */
export function tscPrefix(code: string): string | null {
  const m = /^([A-Z]+)\d+\.\d+$/.exec(code);
  return m ? m[1] : null;
}

/** El motor de nube escribe SOC 2 como `cc_6_6`, `cc_a_1_1`, `cc_c_1_1`, `pi_1_3`; el catálogo, como `CC6.6`, `A1.1`, `C1.1`, `PI1.3`. */
export function normalizeSoc2Requirement(id: string): string | null {
  let m = /^cc_(\d+)_(\d+)$/.exec(id);
  if (m) return `CC${m[1]}.${m[2]}`;
  m = /^cc_a_(\d+)_(\d+)$/.exec(id);
  if (m) return `A${m[1]}.${m[2]}`;
  m = /^cc_c_(\d+)_(\d+)$/.exec(id);
  if (m) return `C${m[1]}.${m[2]}`;
  m = /^pi_(\d+)_(\d+)$/.exec(id);
  if (m) return `PI${m[1]}.${m[2]}`;
  return null;
}
