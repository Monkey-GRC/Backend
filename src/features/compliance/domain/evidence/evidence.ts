import { evaluateEvidence } from '../engine/documentary-test';
import type { EvidenceAttribute } from '../engine/documentary-test';

// Estado calculado de una entrega de evidencia (enums.md `evidence_state`, RN-01 a RN-03). Se DERIVA, nadie lo escribe.
export type EvidenceState = 'compliant' | 'non_compliant' | 'pending' | 'in_review' | 'expired' | 'not_applicable';

/** Quién revisa (D96): solo el admin_empresa, en una sola revisión. El funcional sube; el auditor lee. */
export type ReviewerRole = 'admin_empresa';

/** Lo que se guarda de una revisión (`evidence_reviews`). `ai_prevalidated` no se guarda: se deriva de que la entrega tenga `ai_verdict` y ninguna revisión humana. */
export type StoredReview = 'pending_review' | 'human_validated';

export type EvidenceReviewRecord = {
  reviewerRole: ReviewerRole;
  review: StoredReview;
  typeOk: EvidenceAttribute;
  periodOk: EvidenceAttribute;
  validOk: EvidenceAttribute;
  approvedOk: EvidenceAttribute;
  signedOk: EvidenceAttribute;
  contentOk: EvidenceAttribute;
  note: string | null;
  reviewedBy: { id: string; name: string | null; lastName: string | null };
  reviewedAt: Date;
};

/** Todos ven la misma revisión, la del admin_empresa (D96): ya no se esconde la de un rol al otro (SEG-61 se retiró). */
export const reviewerRoleFor = (_role: string): ReviewerRole => 'admin_empresa';

/**
 * D96 · El funcional aporta y el admin_empresa valida: el estado sale de la revisión humana (`PUT /v1/evidence-submissions/{id}/review`).
 * Sin revisión una entrega espera (`pending`) y, si la IA ya dio su sugerencia, queda `in_review`: la IA nunca produce «cumple» (RN-03).
 * `review` es la única revisión de la entrega, la del admin_empresa.
 */
export function evidenceStateOf(entrega: { aiVerdict: string | null; review?: EvidenceReviewRecord | null }): EvidenceState {
  const r = entrega.review;
  if (!r) return entrega.aiVerdict ? 'in_review' : 'pending';
  return evaluateEvidence({
    typeOk: r.typeOk,
    periodOk: r.periodOk,
    validOk: r.validOk,
    approvedOk: r.approvedOk,
    signedOk: r.signedOk,
    contentOk: r.contentOk,
    review: r.review === 'human_validated' ? 'human_validated' : entrega.aiVerdict ? 'ai_prevalidated' : 'pending_review',
  });
}

/** Lo que el motor necesita de la evidencia que se entregó para una prueba documental de un control (D88). */
export type DocumentaryEvidence = {
  /** La prueba documental a la que sirve. */
  testId: string;
  /** Estado de su entrega MÁS RECIENTE; sin entregas, `pending` (la ausencia de evidencia nunca es cumplimiento). */
  state: EvidenceState;
};
