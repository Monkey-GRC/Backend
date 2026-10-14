import { EvidenceReview, EvidenceState, TestState } from './states';

/** `true` sí, `false` no, `null` todavía sin valorar. */
export type EvidenceAttribute = boolean | null;

export type EvidenceInput = {
  /** Una evidencia que no aplica al test no cuenta. */
  applicable?: boolean;
  typeOk: EvidenceAttribute;
  periodOk: EvidenceAttribute;
  approvedOk: EvidenceAttribute;
  signedOk: EvidenceAttribute;
  contentOk: EvidenceAttribute;
  /** La vigencia se evalúa aparte (RN-02): vencida no es lo mismo que incorrecta. */
  validOk: EvidenceAttribute;
  review: EvidenceReview;
};

/**
 * Estado de UNA evidencia (RN-01 a RN-03).
 *
 * Algún atributo de tipo, período, aprobación, firma o contenido en «No» → no cumple. La vigencia en «No» → vencida. Algún atributo sin valorar →
 * pendiente. Solo una evidencia **validada por una persona** puede cumplir; la que pre-validó la IA queda en revisión (RN-03).
 */
export function evaluateEvidence(e: EvidenceInput): EvidenceState {
  if (e.applicable === false) return 'not_applicable';
  const content = [e.typeOk, e.periodOk, e.approvedOk, e.signedOk, e.contentOk];
  if (content.some((a) => a === false)) return 'non_compliant';
  if (e.validOk === false) return 'expired';
  if (content.some((a) => a === null) || e.validOk === null) return 'pending';
  if (e.review === 'human_validated') return 'compliant';
  if (e.review === 'ai_prevalidated') return 'in_review';
  return 'pending';
}

// Prioridad de la agregación (RN-04): el primero que aparezca decide.
const PRIORITY: ReadonlyArray<[EvidenceState, TestState]> = [
  ['non_compliant', 'non_compliant'],
  ['expired', 'expired'],
  ['in_review', 'in_review'],
  ['pending', 'pending'],
];

/**
 * Estado de un test documental a partir del estado de sus evidencias (RN-04): NO CUMPLE > VENCIDA > EN REVISIÓN > PENDIENTE > CUMPLE.
 * Sin evidencias es `pending`: la ausencia de evidencia nunca es cumplimiento.
 *
 * Supuesto de desarrollo: si todas las evidencias son «no aplica» el test es `not_applicable`; el Excel del comité no lo dice.
 */
export function evaluateDocumentaryTest(evidences: readonly EvidenceState[]): TestState {
  const counted: EvidenceState[] = evidences.filter((s) => s !== 'not_applicable');
  if (evidences.length === 0) return 'pending';
  if (counted.length === 0) return 'not_applicable';
  for (const [evidence, test] of PRIORITY) if (counted.includes(evidence)) return test;
  return 'compliant';
}
