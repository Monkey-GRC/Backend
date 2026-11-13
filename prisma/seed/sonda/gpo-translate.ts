// D112 · Las guías de las políticas de Windows (CIS) tienen casi todas el MISMO formato: «To establish the recommended configuration via GP, set the following UI path to <valor>:
// <ruta>», a veces seguido de una «Note:» sobre la plantilla administrativa que provee esa ruta. En vez de traducirlas una por una, se generan con una regla determinista: la ruta va en
// un bloque de código EXACTO (nunca traducida: es lo que la persona busca en la consola) y el valor, tal como aparece en la interfaz, con su explicación en español. Lo que no encaja en
// el formato se deja para traducir a mano.
//
// Es traducción automática como cualquier otra (`translation_origin = 'machine'`): pasa por la misma validación y la pantalla la etiqueta igual.

const squash = (s: string): string => s.replace(/\s+/g, ' ').trim();

// Qué significan, en español, los valores más comunes de una directiva. Lo que no está aquí se muestra tal cual (el valor de la interfaz), sin explicación.
const UNITS: Record<string, string> = {
  'password': 'contraseña(s)',
  'day': 'día(s)',
  'minute': 'minuto(s)',
  'character': 'carácter(es)',
  'logon': 'inicio(s) de sesión',
  'invalid login attempt': 'intento(s) de inicio de sesión no válido(s)',
  'second': 'segundo(s)',
};
const PLURAL_UNITS: Record<string, string> = { days: 'días', seconds: 'segundos', minutes: 'minutos' };
const EXACT: Record<string, string> = {
  'Enabled': 'Habilitada',
  'Disabled': 'Deshabilitada',
  'Success and Failure': 'Correcto y Error',
  'include Success': 'incluir Correcto',
  'include Failure': 'incluir Error',
  'Yes': 'Sí',
  'No': 'No',
  'On (recommended)': 'Activado (recomendado)',
  'Block (default)': 'Bloquear (valor por omisión)',
  'Allow (default)': 'Permitir (valor por omisión)',
  'Not Configured': 'No configurado',
  'Always': 'Siempre',
  'Administrators': 'Administradores',
};

/** La explicación en español de un valor de directiva, o `null` si no hay una regla para él. */
export function valueGloss(value: string): string | null {
  const v = squash(value);
  if (EXACT[v]) return EXACT[v];
  let m = v.match(/^(\d+) or more ([a-z ]+?)\(s\)$/);
  if (m && UNITS[m[2].trim()]) return `${m[1]} o más ${UNITS[m[2].trim()]}`;
  m = v.match(/^(\d+) or fewer ([a-z ]+?)\(s\)(?:, but not (\d+))?$/);
  if (m && UNITS[m[2].trim()]) return `${m[1]} o menos ${UNITS[m[2].trim()]}${m[3] ? `, pero no ${m[3]}` : ''}`;
  m = v.match(/^(\d+) or fewer (days|seconds|minutes)(?:, but not (\d+))?$/);
  if (m) return `${m[1]} ${PLURAL_UNITS[m[2]]} o menos${m[3] ? `, pero no ${m[3]}` : ''}`;
  m = v.match(/^([\d,]+) KB or greater$/);
  if (m) return `${m[1]} KB o más`;
  m = v.match(/^Enabled: (.+)$/);
  if (m) return `Habilitada: ${m[1]}`;
  return null;
}

// «the Microsoft Windows 10 Release 1607 & Server 2016 Administrative Templates (or newer)» → «las Plantillas administrativas de Microsoft Windows 10 Release 1607 & Server 2016 (o posteriores)».
function templatesEs(what: string): string {
  const w = squash(what).replace(/\.$/, '');
  if (/^all versions of the Microsoft Windows Administrative Templates$/i.test(w)) return 'todas las versiones de las Plantillas administrativas de Microsoft Windows';
  const m = w.match(/^the Microsoft Windows (.+?) Administrative Templates(?: (v[\d.]+))?(?: \((?:or|and) newer\))?$/i);
  if (m) return `las Plantillas administrativas de Microsoft Windows ${m[1]}${m[2] ? ` ${m[2]}` : ''}${/\((?:or|and) newer\)/i.test(w) ? ' (o posteriores)' : ''}`;
  return w; // no se conoce la forma: se deja como viene, sin inventar
}

const TEMPLATE = '([A-Za-z0-9._\\- ]+?\\.admx\\/adml)';
const NOTE_PROVIDED = new RegExp(`^This Group Policy path (may not exist by default\\. It )?(?:is )?provided by the Group Policy template ${TEMPLATE} that is included with (.+?)\\.?$`, 'i');
const NOTE_EXTRA = new RegExp(`^This Group Policy path does not exist by default\\. An additional Group Policy template \\(${TEMPLATE}\\) is required - it is (available from Microsoft at this link|included with (.+?)|available from this TechNet blog post: (.+?))\\.?$`, 'i');

// Toda «Note:» de estas guías habla de lo mismo: de qué plantilla administrativa (.admx) provee la ruta. Si la nota sigue una forma conocida se traduce; si no, queda una nota general que
// es cierta para todas (la ruta depende de una plantilla que puede no estar instalada) y no se pierde la ruta ni el valor.
export function noteEs(note: string): string {
  const n = squash(note);
  if (!/Note #2/i.test(n)) {
    const p = n.match(NOTE_PROVIDED);
    if (p) return `Nota: ${p[1] ? 'es posible que esta ruta no exista por omisión; la' : 'esta ruta la'} proporciona la plantilla de directiva de grupo \`${p[2].trim()}\`, incluida en ${templatesEs(p[3])}.`;
    const e = n.match(NOTE_EXTRA);
    if (e) {
      const how = /available from Microsoft/i.test(e[2]) ? 'disponible para descargar en Microsoft' : e[3] ? `incluida en ${e[3]}` : `disponible en el artículo de blog de TechNet «${e[4]}»`;
      return `Nota: esta ruta no existe por omisión; hace falta una plantilla de directiva de grupo adicional (\`${e[1].trim()}\`), ${how}.`;
    }
  }
  return 'Nota: esta ruta depende de una plantilla administrativa de directiva de grupo (archivos .admx y .adml) que puede no estar instalada por omisión; si la ruta no aparece en su consola, instale las plantillas administrativas correspondientes de Microsoft.';
}

const PATH_START = '(?:Computer|User) Configuration\\\\';
const STANDARD = new RegExp(`^To (?:establish|implement) the recommended configuration via GP, set the following UI path to:? ?(.+?)[:.]\\s+(${PATH_START}.+?)\\.?$`, 's');
const CONFIGURE = new RegExp(`^To (?:establish|implement) the recommended configuration via GP, configure the following UI path(?: to a value that is consistent with the security and operational requirements of your organization)?:\\s+(${PATH_START}.+?)\\.?$`, 's');

const PATH_NOTE = 'La ruta está en inglés, tal como aparece en la consola de directivas de grupo; en un sistema con la interfaz en español, los mismos nombres aparecen traducidos.';
const INTRO = 'Para establecer la configuración recomendada mediante directiva de grupo (GPO)';

/**
 * La guía en español de una directiva de Windows, o `null` si el original no sigue el formato conocido (se traduce a mano). El texto resultante lleva la ruta en un bloque de
 * código; el validador comprueba después que esa ruta aparece igual en el original.
 */
export function translateGpoRemediation(original: string): string | null {
  const whole = squash(original);
  // La «Note:» (si hay) va aparte: no es parte de la ruta.
  const at = whole.search(/\sNote:\s/);
  const text = at === -1 ? whole : whole.slice(0, at);
  const note = at === -1 ? null : whole.slice(at).replace(/^\s*Note:\s*/, '');
  const tail = note ? `\n${noteEs(note)}` : '';
  const std = text.match(STANDARD);
  if (std) {
    const value = std[1].trim();
    const gloss = valueGloss(value);
    return `${INTRO}, fije la siguiente ruta de la interfaz en \`${value}\`${gloss ? ` (${gloss})` : ''}:\n\`\`\`\n${std[2].trim()}\n\`\`\`\n${PATH_NOTE}${tail}`;
  }
  const cfg = text.match(CONFIGURE);
  if (cfg) {
    const custom = /to a value that is consistent with/.test(text);
    return `${INTRO}, configure la siguiente ruta de la interfaz${custom ? ' con un valor acorde con los requisitos de seguridad y de operación de su organización' : ''}:\n\`\`\`\n${cfg[1].trim()}\n\`\`\`\n${PATH_NOTE}${tail}`;
  }
  return null;
}
