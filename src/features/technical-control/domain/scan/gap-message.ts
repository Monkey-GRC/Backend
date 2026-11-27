import { publicText } from '../../../../common/text/provider-names';
import { gapPriority, type GapPriority, type Severity } from './gap-priority';

// D138 punto 3, D162 · UN solo armador del mensaje de una brecha: el detalle del control y el aviso `direct_check_failed` salen de aquí. Lo que sale no nombra al proveedor de la sonda
// ni del motor (SEG-39, D70): un texto que lo nombre no sale (nulo); el título cae a uno neutro.

export type GapLanguage = 'es' | 'en';
export type TranslationOrigin = 'machine' | 'reviewed' | null;

/** El check tal como está en el catálogo. */
export type CatalogCheck = {
  titleEn: string;
  titleEs: string | null;
  condition: string | null;
  remediation: string;
  remediationEs: string | null;
  translationOrigin: TranslationOrigin;
};

export type MessageText = { text: string; language: GapLanguage; isAiGenerated: boolean };
export type GapMessage = {
  title: string;
  evaluated: MessageText | null;
  remediation: MessageText | null;
  priority: GapPriority;
  priorityBasis: { severity: Severity | null; assetCriticality: string };
};

/** El título del check en un idioma, o nulo si nombra al proveedor. */
export const checkTitle = (check: Pick<CatalogCheck, 'titleEn' | 'titleEs'>, language: GapLanguage): string | null => publicText((language === 'es' ? check.titleEs : check.titleEn)?.trim());

/** Los dos títulos del aviso: cada uno nulo si nombra al proveedor (el texto pone uno genérico). */
export const checkTitles = (check: Pick<CatalogCheck, 'titleEn' | 'titleEs'>): { en: string | null; es: string | null } => ({ en: checkTitle(check, 'en'), es: checkTitle(check, 'es') });

// En español se usa la traducción de Monkey y se marca como generada por IA mientras nadie la haya revisado; sin traducción, sale el original en inglés dicho como inglés (la pantalla lo avisa).
function translated(es: string | null | undefined, en: string | null | undefined, language: GapLanguage, origin: TranslationOrigin): MessageText | null {
  if (language === 'es') {
    const text = publicText(es?.trim());
    if (text) return { text, language: 'es', isAiGenerated: origin !== 'reviewed' };
  }
  const original = publicText(en?.trim());
  return original ? { text: original, language: 'en', isAiGenerated: false } : null;
}

export function gapMessage(input: { check: CatalogCheck; severity: Severity | null; assetCriticality: string; language: GapLanguage; fallbackTitle: string }): GapMessage {
  const { check, language } = input;
  return {
    title: checkTitle(check, language) ?? (language === 'es' ? checkTitle(check, 'en') : null) ?? input.fallbackTitle,
    // El catálogo no trae la descripción en español: sale el original en inglés, dicho como inglés.
    evaluated: translated(null, check.condition, language, check.translationOrigin),
    remediation: translated(check.remediationEs, check.remediation, language, check.translationOrigin),
    priority: gapPriority({ severity: input.severity, assetCriticality: input.assetCriticality }),
    priorityBasis: { severity: input.severity, assetCriticality: input.assetCriticality },
  };
}
