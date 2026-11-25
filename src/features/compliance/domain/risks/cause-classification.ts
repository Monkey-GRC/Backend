import { CausePatch } from './risk.repository';

/** Un error de validación de dominio: el campo del request y el código corto del contrato. El caso de uso lo convierte en 422. */
export type ClassificationError = { field: string; code: string };

/** La clasificación (`cause_origin`, `cause_type`) de una causa del catálogo es del comité: solo se edita en las propias. Devuelve el campo que se intentó cambiar (vacío si se puede). */
export function classificationErrorsOf(cause: { fromCatalog: boolean }, patch: CausePatch): ClassificationError[] {
  if (!cause.fromCatalog) return [];
  return [patch.causeOrigin !== undefined && 'cause_origin', patch.causeType !== undefined && 'cause_type']
    .filter((f): f is string => !!f)
    .map((field) => ({ field, code: 'cause.catalog_classification' }));
}
