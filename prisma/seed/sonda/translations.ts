import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { namesProvider } from '../../../src/common/text/provider-names';

// D113 · La guía de corrección en español de los checks de la sonda de servidores. La escribe Monkey (traducción automática, sin revisar: `translation_origin = 'machine'`) y una
// persona la puede revisar después. Vive en un archivo POR POLÍTICA (`data/sonda-es/<policyId>.json`): se agrega una política sin tocar las demás y cada archivo se revisa solo.
//
// Formato del texto: párrafos separados por salto de línea, viñetas con «- », y los COMANDOS en un bloque con tres comillas invertidas (```) o, si son cortos, entre comillas
// invertidas. La pantalla muestra el bloque como código (se lee y se copia aparte) y nunca lo interpreta como HTML.
export type SondaTranslationFile = { policyId: string; translations: { checkId: string; remediationEs: string }[] };

// Lo que el catálogo trae de cada check de una política (de `data/sonda-checks.json.gz`).
export type SourceCheck = { remediation: string | null; remediationEs: string | null };
export type SourcePolicy = Map<string, SourceCheck>;

export const SONDA_SOURCE_PATH = 'prisma/seed/data/sonda-checks.json.gz';
export const SONDA_TRANSLATIONS_DIR = 'prisma/seed/data/sonda-es';

// Todo el catálogo de la sonda como `política → check → texto`.
export function loadSondaSource(path = SONDA_SOURCE_PATH): Map<string, SourcePolicy> {
  const data = JSON.parse(gunzipSync(readFileSync(resolve(path))).toString('utf8')) as { checks: { policyId: string; checkId: string; remediation: string | null; remediationEs: string | null }[] };
  const out = new Map<string, SourcePolicy>();
  for (const c of data.checks) {
    if (!out.has(c.policyId)) out.set(c.policyId, new Map());
    out.get(c.policyId)!.set(c.checkId, { remediation: c.remediation, remediationEs: c.remediationEs });
  }
  return out;
}

export function loadTranslationFiles(dir = SONDA_TRANSLATIONS_DIR): { file: string; content: SondaTranslationFile }[] {
  const base = resolve(dir);
  let names: string[] = [];
  try {
    names = readdirSync(base).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return names.sort().map((file) => ({ file, content: JSON.parse(readFileSync(resolve(base, file), 'utf8')) as SondaTranslationFile }));
}

const squash = (s: string): string => s.replace(/\s+/g, ' ').trim();
const FENCE = /```[^\n]*\n([\s\S]*?)```/g;
const INLINE = /`([^`\n]+)`/g;

/**
 * Los comandos y rutas que la traducción dejó entre comillas invertidas. De un bloque de código se toma CADA LÍNEA (un comando por línea, así varios seguidos no dependen de cómo el
 * original los separe); del código en línea, el fragmento entero.
 */
export function codeSegments(text: string): string[] {
  const blocks = [...text.matchAll(FENCE)].flatMap((m) => m[1].split(/\r?\n/));
  const inline = [...text.replace(FENCE, ' ').matchAll(INLINE)].map((m) => m[1]);
  return [...blocks, ...inline].map(squash).filter((s) => s.length > 0);
}

/**
 * Comprueba un archivo de traducciones contra el catálogo. Devuelve los problemas; vacío = se puede cargar.
 *
 * La regla que más importa es la **fidelidad de los comandos**: un comando mal copiado, traducido o «corregido» le haría un daño real al servidor del cliente. Por eso todo lo que
 * la traducción pone como código tiene que aparecer, igual (salvo espacios), en el texto original en inglés.
 */
export function validateSondaTranslations(file: SondaTranslationFile, source: Map<string, SourcePolicy>): string[] {
  const problems: string[] = [];
  const policy = source.get(file.policyId);
  if (!policy) return [`${file.policyId}: la política no existe en el catálogo`];
  const seen = new Set<string>();
  for (const t of file.translations) {
    const id = `${file.policyId}/${t.checkId}`;
    if (seen.has(t.checkId)) problems.push(`${id}: repetido`);
    seen.add(t.checkId);
    const original = policy.get(t.checkId);
    if (!original) {
      problems.push(`${id}: no existe en el catálogo`);
      continue;
    }
    if (!original.remediation?.trim()) problems.push(`${id}: el original no trae guía, no hay qué traducir`);
    // Lo que el comité ya trae en español no se pisa.
    if (original.remediationEs?.trim()) problems.push(`${id}: ya trae guía en español del comité, no se pisa`);
    const es = t.remediationEs ?? '';
    if (!es.trim()) {
      problems.push(`${id}: falta la guía`);
      continue;
    }
    if (namesProvider(es)) problems.push(`${id}: nombra al proveedor de la sonda`);
    if ((es.match(/```/g) ?? []).length % 2 !== 0) problems.push(`${id}: un bloque de código sin cerrar (\`\`\`)`);
    // El original viene de un PDF: parte las palabras al final de línea con un guion y un espacio («chacha20- poly1305»). Se repara solo para comparar, en AMBOS lados (así un « - » legítimo
    // no estorba); la traducción lleva el nombre bien escrito.
    const fix = (s: string): string => squash(s).replace(/-\s(?=[a-z0-9@])/g, '-');
    const haystack = fix(original.remediation ?? '');
    for (const code of codeSegments(es)) {
      if (!haystack.includes(fix(code))) problems.push(`${id}: el código «${code.slice(0, 70)}» no aparece igual en el original`);
    }
  }
  return problems;
}
