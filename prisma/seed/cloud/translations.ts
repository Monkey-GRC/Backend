import { namesProvider } from '../../../src/common/text/provider-names';

// D90 · La traducción al español de la guía de corrección de los checks de nube. La escribe Monkey (traducción automática, sin revisar: `translation_origin = 'machine'`)
// y una persona la puede revisar después. Lo que llega al cliente nunca nombra al proveedor de la sonda (D70).
export type CheckTranslation = { checkId: string; titleEs: string; remediationEs: string };

export function validateTranslations(items: CheckTranslation[], knownCheckIds: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const t of items) {
    if (seen.has(t.checkId)) problems.push(`${t.checkId}: repetido`);
    seen.add(t.checkId);
    if (!knownCheckIds.has(t.checkId)) problems.push(`${t.checkId}: no existe en el catálogo`);
    if (!t.titleEs?.trim()) problems.push(`${t.checkId}: falta el título`);
    if (!t.remediationEs?.trim()) problems.push(`${t.checkId}: falta la guía`);
    if (namesProvider(t.titleEs ?? '') || namesProvider(t.remediationEs ?? '')) problems.push(`${t.checkId}: nombra al proveedor de la sonda`);
  }
  return problems;
}