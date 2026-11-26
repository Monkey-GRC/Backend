// Lo que ve el cliente de una prueba (D70, D82, SEG-39). La hoja TEST no trae nombre neutro: se deriva (contracts/catalogo-maestro.md, «El nombre que ve el cliente»).
//  - T-DOC: el nombre del documento.
//  - Prueba de control: el texto de su requisito o, si ese texto es «Posible Checks …», el objetivo.
//  - Se aplica la tabla 9 de 01_DESARROLLO (marca blanca) y se valida que no quede ningún proveedor.
//  - `display_description` es el objetivo con la tabla 9.

// La regla de qué es «nombrar al proveedor» vive en un solo sitio (SEG-39): la misma que usa Monkey Admin al dar de alta una prueba.
import { whiteLabel } from '../../../src/common/text/provider-names';
import { CatalogV2 } from './types';

export { namesProvider, PROVIDER_PATTERN, whiteLabel } from '../../../src/common/text/provider-names';

const POSSIBLE_CHECKS = /^Posibles? checks?\b/i;

export type DisplayInput = {
  code: string;
  // Nombre del documento de una T-DOC.
  documentName: string | null;
  // Texto del primer requisito que lista la prueba (REQUISITOS.ID_Test), si es de control.
  requirementText: string | null;
  objective: string;
};

export function displayNameOf(t: DisplayInput): string {
  if (t.documentName) return whiteLabel(t.documentName);
  const base = t.requirementText && !POSSIBLE_CHECKS.test(t.requirementText) ? t.requirementText : t.objective;
  return whiteLabel(base);
}

export const displayDescriptionOf = (objective: string): string => whiteLabel(objective);

// Los campos de prosa del libro que llegan al cliente (SEG-39, D128). Un solo sitio: lo usan `validate.ts`, `catalog:verify` y la prueba que recorre el JSON.
// Quedan fuera las claves internas del motor (`testChecks.appliesWhen`, `testChecks.moduleRef`), que no son texto de cliente.
export const CLIENT_VISIBLE_TEXT_FIELDS: { [K in 'tests' | 'controlRequirements' | 'standardProcedures' | 'integrationCategories' | 'testChecks']: readonly (keyof CatalogV2[K][number])[] } = {
  tests: ['displayName', 'displayDescription', 'objective', 'whyItMatters', 'stepByStep', 'correctIf', 'exceptionIf', 'observationIf', 'evidenceToRetain'],
  controlRequirements: ['text', 'assemblyNote'],
  standardProcedures: ['whenUsed', 'genericSteps', 'typicalEvidence'],
  integrationCategories: ['exampleTools'],
  testChecks: ['commonObjective'],
};

/** Cada texto visible al cliente tal como sale del libro (sin tabla 9), con su ubicación para el mensaje de error. */
export function clientVisibleTexts(c: CatalogV2): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const ident = (k: string, r: Record<string, unknown>, i: number): string => String(r.code ?? r.name ?? r.testCode ?? i) + (k === 'testChecks' ? `#${i}` : '');
  for (const [coll, fields] of Object.entries(CLIENT_VISIBLE_TEXT_FIELDS)) {
    const rows: unknown = c[coll as keyof typeof CLIENT_VISIBLE_TEXT_FIELDS];
    (Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []).forEach((row, i) => {
      for (const f of fields as readonly string[]) {
        const v = row[f];
        if (typeof v === 'string' && v) out.push({ where: `${coll}[${ident(coll, row, i)}].${f}`, text: v });
      }
    });
  }
  return out;
}
