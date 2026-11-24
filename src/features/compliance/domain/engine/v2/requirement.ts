import { RequirementStatus, TestStatus } from './types';

/**
 * Estado de un requisito del control a partir de sus pruebas (§9, «Requisito del control»):
 *  · Cumple: todas sus pruebas en Correcto u Observación.
 *  · No cumple: al menos una en Excepción.
 *  · Vencido: al menos una Vencida (y ninguna en Excepción).
 *  · Pendiente: al menos una Pendiente y ninguna en Excepción ni Vencida; también un requisito sin pruebas (nada lo respalda todavía).
 *  · No aplica: todas sus pruebas en No aplica, o el requisito se marcó No aplica.
 * Un requisito no aplicable sale del cálculo (D135).
 */
export function evaluateRequirement(input: { isApplicable: boolean; tests: readonly TestStatus[] }): RequirementStatus {
  if (!input.isApplicable) return 'not_applicable';
  const counted = input.tests.filter((s) => s !== 'not_applicable');
  if (input.tests.length > 0 && counted.length === 0) return 'not_applicable';
  if (counted.some((s) => s === 'exception')) return 'non_compliant';
  if (counted.some((s) => s === 'expired')) return 'expired';
  if (counted.length === 0 || counted.some((s) => s === 'pending')) return 'pending';
  return 'compliant';
}
