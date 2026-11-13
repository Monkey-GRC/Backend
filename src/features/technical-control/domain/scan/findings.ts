import { publicText } from '../../../../common/text/provider-names';

// D90 · Qué falló y cómo corregirlo. Convierte las filas `failed` de la última evaluación en hallazgos: uno por check, con los recursos afectados y la guía de
// corrección en el idioma de la persona. Lo que sale no nombra al proveedor de la sonda ni trae el texto crudo de cada recurso (SEG-39, D70).

export const MAX_RESOURCES_PER_FINDING = 50;

export type FindingLanguage = 'es' | 'en';
export type TranslationOrigin = 'machine' | 'reviewed' | null;

// Una fila fallida tal como sale de la base: el check, su guía y el recurso afectado.
export type FailedRow = {
  checkUuid: string;
  severity: string | null;
  titleEn: string;
  titleEs: string | null;
  remediation: string;
  remediationEs: string | null;
  translationOrigin: TranslationOrigin;
  resourceName: string | null;
  resourceUid: string | null;
  region: string | null;
};

export type FindingResource = { name: string | null; uid: string | null; region: string | null };
export type FindingRemediation = { text: string; language: FindingLanguage; isAiGenerated: boolean };
export type Finding = {
  id: string;
  title: string;
  // Nulo: el motor que midió no califica sus checks (la sonda de servidores no trae severidad). No se inventa una: la pantalla no muestra nivel y el hallazgo va después de los calificados.
  severity: string | null;
  resources: FindingResource[];
  resourcesTotal: number;
  remediation: FindingRemediation | null;
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'informational'];
const rank = (s: string | null): number => {
  if (s === null) return SEVERITY_ORDER.length + 1; // sin calificar: después de todo lo calificado
  const i = SEVERITY_ORDER.indexOf(s);
  return i === -1 ? SEVERITY_ORDER.length : i;
};
// Sin dato no hay severidad (nulo); un valor que no es de la escala se trata como media (como siempre).
const normalizeSeverity = (s: string | null): string | null => {
  const v = s?.trim().toLowerCase();
  if (!v) return null;
  return SEVERITY_ORDER.includes(v) ? v : 'medium';
};

// La guía en el idioma pedido. En español se usa la traducción de Monkey y se marca como generada por IA mientras nadie la haya revisado; sin traducción, sale el
// original en inglés dicho como inglés (la pantalla lo avisa). Un texto que nombre al proveedor no sale nunca: sin guía neutra, no hay guía.
function remediationOf(row: FailedRow, language: FindingLanguage): FindingRemediation | null {
  if (language === 'es') {
    const es = publicText(row.remediationEs?.trim());
    if (es) return { text: es, language: 'es', isAiGenerated: row.translationOrigin !== 'reviewed' };
  }
  const en = publicText(row.remediation?.trim());
  return en ? { text: en, language: 'en', isAiGenerated: false } : null;
}

const titleOf = (row: FailedRow, language: FindingLanguage, fallback: string): string => {
  const preferred = language === 'es' ? publicText(row.titleEs?.trim()) : null;
  return preferred ?? publicText(row.titleEn?.trim()) ?? fallback;
};

export function buildFindings(rows: FailedRow[], language: FindingLanguage, fallbackTitle: string): Finding[] {
  const byCheck = new Map<string, { first: FailedRow; severity: string | null; seen: Set<string>; resources: FindingResource[] }>();
  for (const row of rows) {
    const severity = normalizeSeverity(row.severity);
    const entry = byCheck.get(row.checkUuid) ?? { first: row, severity, seen: new Set<string>(), resources: [] };
    if (rank(severity) < rank(entry.severity)) entry.severity = severity;
    // El mismo recurso en dos regiones o dos cuentas cuenta una vez por identificador y región.
    const key = `${row.resourceUid ?? row.resourceName ?? ''}|${row.region ?? ''}`;
    if (!entry.seen.has(key)) {
      entry.seen.add(key);
      if (row.resourceUid || row.resourceName) entry.resources.push({ name: row.resourceName, uid: row.resourceUid, region: row.region });
    }
    byCheck.set(row.checkUuid, entry);
  }
  return [...byCheck.entries()]
    .map(([id, e]): Finding => {
      const sorted = [...e.resources].sort((a, b) => (a.name ?? a.uid ?? '').localeCompare(b.name ?? b.uid ?? ''));
      return {
        id,
        title: titleOf(e.first, language, fallbackTitle),
        severity: e.severity,
        resources: sorted.slice(0, MAX_RESOURCES_PER_FINDING),
        resourcesTotal: e.resources.length,
        remediation: remediationOf(e.first, language),
      };
    })
    .sort((a, b) => rank(a.severity) - rank(b.severity) || a.title.localeCompare(b.title));
}
