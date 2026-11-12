import { I18nContext } from 'nestjs-i18n';
import { RESPONSIBLES_GROUP_NAME } from './responsibles-group';

// Texto de un catálogo que vive en la base en español: si hay clave i18n (por código del catálogo) se traduce al idioma de la petición; si no, se devuelve el de la base.
export function translateOr(key: string, fallback: string): string {
  const v = I18nContext.current()?.t(key) as unknown;
  return typeof v === 'string' && v !== key ? v : fallback;
}

export function translateListOr(key: string, fallback: string[]): string[] {
  const v = I18nContext.current()?.t(key) as unknown;
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : fallback;
}

/** El nombre del grupo por omisión está reservado (ver `responsibles-group.ts`): si coincide, es el de omisión y se traduce. */
export const groupDisplayName = (name: string): string => (name === RESPONSIBLES_GROUP_NAME ? translateOr('group.responsibles_default_name', name) : name);

type CapabilityTexts = { catalogCode: string; category: string; method: string; requiredPermissions: string[]; baseFrequency: string; generatedEvidence: string };

/** Los textos de una conexión (ac_01…ac_06) en el idioma de la petición, por su `catalog_code` (`capability.<code>.*`); la base, en español, es el respaldo. Cierra DT-21 en `category`. */
export function capabilityTexts(c: CapabilityTexts) {
  const key = (k: string) => `capability.${c.catalogCode}.${k}`;
  return {
    category: translateOr(key('category'), c.category),
    method: translateOr(key('method'), c.method),
    required_permissions: translateListOr(key('required_permissions'), c.requiredPermissions),
    base_frequency: translateOr(key('base_frequency'), c.baseFrequency),
    generated_evidence: translateOr(key('generated_evidence'), c.generatedEvidence),
  };
}
