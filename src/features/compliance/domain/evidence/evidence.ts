import { isOwnerOf, Parties } from '../controls/control-access';
import { evaluateEvidence } from '../engine/documentary-test';
import type { EvidenceAttribute } from '../engine/documentary-test';

// Estado calculado de una entrega de evidencia (enums.md `evidence_state`, RN-01 a RN-03). Se DERIVA, nadie lo escribe.
export type EvidenceState = 'compliant' | 'non_compliant' | 'pending' | 'in_review' | 'expired' | 'not_applicable';

/** Quién revisa (D96, D102): el `responsable` dueño del control y el `admin_empresa`, una revisión por rol. El delegado sube; el auditor lee. */
export type ReviewerRole = 'admin_empresa' | 'responsable';

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

/**
 * D102 · Con qué rol puede revisar una entrega quien llama, o `null` si no puede. El `admin_empresa` siempre (también lo que subió él: P34). El `responsable` solo si es el dueño
 * ACTIVO del control y no subió él la entrega. El `delegado`, el `auditor` y el `admin_monkey` no revisan. El rol lo fija el servidor, nunca el cuerpo.
 */
export function reviewerRoleFor(p: { role: string; userId: string }, access: Parties, submittedBy: string): ReviewerRole | null {
  if (p.role === 'admin_empresa') return 'admin_empresa';
  if (p.role === 'responsable' && isOwnerOf(p.userId, access) && submittedBy !== p.userId) return 'responsable';
  return null;
}

// De más a menos decisivo: un rechazo gana, luego lo vencido, lo validado, lo que espera la revisión de una persona y lo pendiente.
const COMBINE_ORDER: readonly EvidenceState[] = ['non_compliant', 'expired', 'compliant', 'in_review', 'pending'];

/**
 * D102 · El estado de una entrega es la COMBINACIÓN de las revisiones de cada rol: algún rechazo → no cumple (o vencida); sin rechazos y con al menos una validación → cumple; sin
 * ninguna revisión, `pending` o `in_review` si la IA ya sugirió. La IA nunca produce «cumple» (RN-03). Cada revisión se evalúa sola con los seis atributos (RN-01 a RN-03).
 */
export function evidenceStateOf(entrega: { aiVerdict: string | null; reviews?: readonly EvidenceReviewRecord[] }): EvidenceState {
  const states = (entrega.reviews ?? []).map((r) =>
    evaluateEvidence({
      typeOk: r.typeOk, periodOk: r.periodOk, validOk: r.validOk, approvedOk: r.approvedOk, signedOk: r.signedOk, contentOk: r.contentOk,
      review: r.review === 'human_validated' ? 'human_validated' : entrega.aiVerdict ? 'ai_prevalidated' : 'pending_review',
    }),
  );
  if (states.length === 0) return entrega.aiVerdict ? 'in_review' : 'pending';
  return COMBINE_ORDER.find((s) => states.includes(s)) ?? 'pending';
}

/** La revisión que explica por qué no cumple (D102): la más reciente de las que rechazan o vencen; sin ninguna, `null`. De ahí sale la nota que lee quien subió. */
export function rejectingReview(reviews: readonly EvidenceReviewRecord[]): EvidenceReviewRecord | null {
  const rejecting = reviews.filter((r) => ['non_compliant', 'expired'].includes(evidenceStateOf({ aiVerdict: null, reviews: [r] })));
  return [...rejecting].sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime())[0] ?? null;
}

/** Lo que el motor necesita de la evidencia que se entregó para una prueba documental de un control (D88). */
export type DocumentaryEvidence = {
  /** La prueba documental a la que sirve. */
  testId: string;
  /** Estado de su entrega MÁS RECIENTE; sin entregas, `pending` (la ausencia de evidencia nunca es cumplimiento). */
  state: EvidenceState;
};

/**
 * Valor neutro de `validity_within_period` cuando el requerimiento no fija otro período: se guarda el marcador y la etiqueta se traduce al responder (`evidence.validity.within_period`).
 * Un período concreto (p. ej. `2026-Q4`) es un dato y se devuelve tal cual.
 */
export const WITHIN_EVALUATION_PERIOD = 'within_evaluation_period';
