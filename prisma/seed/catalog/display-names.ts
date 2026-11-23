// Lo que ve el cliente de una prueba (D70, D82, SEG-39). La hoja TEST no trae nombre neutro: se deriva (contracts/catalogo-maestro.md, «El nombre que ve el cliente»).
//  - T-DOC: el nombre del documento.
//  - Prueba de control: el texto de su requisito o, si ese texto es «Posible Checks …», el objetivo.
//  - Se aplica la tabla 9 de 01_DESARROLLO (marca blanca) y se valida que no quede ningún proveedor.
//  - `display_description` es el objetivo con la tabla 9.

// La regla de qué es «nombrar al proveedor» vive en un solo sitio (SEG-39): la misma que usa Monkey Admin al dar de alta una prueba.
export { namesProvider, PROVIDER_PATTERN } from '../../../src/common/text/provider-names';

const POSSIBLE_CHECKS = /^Posible Checks\b/i;

// Tabla 9, en el orden en que se aplica (lo más específico primero). Gramática: «de Prowler» → «del motor de nube», «a Prowler» → «al motor de nube».
const WHITE_LABEL: readonly (readonly [RegExp, string])[] = [
  [/Posible Checks (?:de )?Wazuh/gi, 'Verificaciones automáticas de la sonda'],
  [/Posible Checks (?:de )?Prowler/gi, 'Verificaciones automáticas del motor de nube'],
  [/Wazuh\s*\+\s*Prowler/gi, 'sonda y motor de nube'],
  [/Wazuh\s+y\s+Prowler/gi, 'la sonda y el motor de nube'],
  [/Wazuh\s*\/\s*OSSEC/gi, 'la sonda/OSSEC'],
  [/\b(agentes?) (?:de )?Wazuh\b/gi, '$1 de la sonda'],
  [/\bWazuh SCA\b/gi, 'evaluación de configuración de la sonda'],
  [/\bm[oó]dulos? (?:de )?Wazuh\b/gi, 'módulo de la sonda'],
  [/\bSyscollector\b/gi, 'inventario de la sonda'],
  [/\bde Prowler\b/gi, 'del motor de nube'],
  [/\ba Prowler\b/gi, 'al motor de nube'],
  [/\bProwler\b/gi, 'el motor de nube'],
  [/\bWazuh\b/gi, 'la sonda'],
];

/** Aplica la tabla 9: el texto del libro → lo que ve el cliente. */
export function whiteLabel(s: string): string {
  let out = s;
  for (const [re, to] of WHITE_LABEL) out = out.replace(re, to);
  // «la sonda» al inicio de una frase se escribe con mayúscula.
  return out.replace(/(^|[.:!?]\s+)(la sonda|el motor de nube|sonda y motor de nube)/g, (_m, pre: string, w: string) => pre + w.charAt(0).toUpperCase() + w.slice(1));
}

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
