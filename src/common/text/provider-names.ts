// El proveedor de las sondas es confidencial frente al cliente (SEG-39, D70): ningún texto que ve el cliente lo nombra. Aquí viven las palabras, en un solo sitio:
// lo usan `catalog:load`, el alta de pruebas y los hallazgos de nube (D90).
export const PROVIDER_PATTERN = /wazuh|prowler/i;

export const namesProvider = (text: string): boolean => PROVIDER_PATTERN.test(text);

// El texto tal cual si es neutro; null si nombra al proveedor (quien lo muestra elige qué poner en su lugar).
export const publicText = (text: string | null | undefined): string | null => {
  if (!text) return null;
  return namesProvider(text) ? null : text;
};

// Tabla 9 de 01_DESARROLLO (marca blanca): el libro del comité es interno y queda intacto en la base; todo texto que llega al cliente pasa por aquí al salir (D128).
// En el orden en que se aplica (lo más específico primero). Gramática: «de Prowler» → «del motor de nube», «a Prowler» → «al motor de nube».
const WHITE_LABEL: readonly (readonly [RegExp, string])[] = [
  [/Posibles? checks? (?:de )?Wazuh/gi, 'Verificaciones automáticas de la sonda'],
  [/Posibles? checks? (?:de )?Prowler/gi, 'Verificaciones automáticas del motor de nube'],
  [/\bWazuh Syscollector\b/gi, 'inventario de la sonda'],
  [/\bdel Wazuh\b/gi, 'de la sonda'],
  [/\bel Wazuh\b/gi, 'la sonda'],
  [/\bal Wazuh\b/gi, 'a la sonda'],
  [/\bun Wazuh\b/gi, 'una sonda'],
  [/\b(del|el|al|un) Prowler\b/gi, '$1 motor de nube'],
  [/\bdel Syscollector\b/gi, 'del inventario de la sonda'],
  [/\bel Syscollector\b/gi, 'el inventario de la sonda'],
  [/Wazuh\s*\+\s*Prowler/gi, 'sonda y motor de nube'],
  [/Wazuh\s+y\s+Prowler/gi, 'la sonda y el motor de nube'],
  [/Wazuh\s*\/\s*OSSEC/gi, 'la sonda/OSSEC'],
  [/\bWazuh (HIDS|FIM)\b/gi, '$1 de la sonda'],
  [/\bWazuh \(Syscollector\)/gi, 'la sonda (inventario)'],
  [/\b(agentes?) (?:de )?Wazuh\b/gi, '$1 de la sonda'],
  [/\b(pol[ií]ticas?) (?:de )?Wazuh\b/gi, '$1 de la sonda'],
  [/\bWazuh SCA\b/gi, 'evaluación de configuración de la sonda'],
  [/\bm[oó]dulos? (?:de )?Wazuh\b/gi, 'módulo de la sonda'],
  [/\binventario de Syscollector\b/gi, 'inventario de la sonda'],
  [/\bde Syscollector\b/gi, 'del inventario de la sonda'],
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
  // «la sonda» al inicio de una frase, de una línea o de un paso numerado se escribe con mayúscula.
  return out.replace(/(^|[.:!?]\s+|\n\s*(?:\d+[-.)]\s*)?)(la sonda|el motor de nube|sonda y motor de nube)/g, (_m, pre: string, w: string) => pre + w.charAt(0).toUpperCase() + w.slice(1));
}

// Para los mapeadores que sirven texto del libro al cliente: la tabla 9 y, si aun así nombra al proveedor, null.
export const clientText = (text: string | null | undefined): string | null => {
  if (!text) return null;
  return publicText(whiteLabel(text));
};
