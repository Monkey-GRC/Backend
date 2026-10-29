import { Prisma } from '../../../../../generated/prisma/client';
import { EvidenceReviewRecord, EvidenceState, ReviewerRole, evidenceStateOf } from '../../domain/evidence';

// Lo que se lee de una revisión (`evidence_reviews`, D96). Se pide solo la del admin_empresa, que es la única que cuenta: las filas viejas de consultor y auditor no se leen.
export const REVIEW_SELECT = {
  reviewerRole: true, review: true, typeOk: true, periodOk: true, validOk: true, approvedOk: true, signedOk: true, contentOk: true, note: true, reviewedAt: true,
  reviewedByUser: { select: { id: true, name: true, lastName: true } },
} as const;
export type ReviewRow = Prisma.EvidenceReviewGetPayload<{ select: typeof REVIEW_SELECT }>;

/** `where` de las revisiones de un rol, para anidarlo en `submissions: { select: { reviews: … } }`. */
export const reviewsOf = (role: ReviewerRole) => ({ where: { reviewerRole: role }, select: REVIEW_SELECT }) as const;

export const toReviewRecord = (r: ReviewRow): EvidenceReviewRecord => ({
  reviewerRole: 'admin_empresa', review: r.review, typeOk: r.typeOk, periodOk: r.periodOk, validOk: r.validOk, approvedOk: r.approvedOk, signedOk: r.signedOk,
  contentOk: r.contentOk, note: r.note, reviewedBy: r.reviewedByUser, reviewedAt: r.reviewedAt,
});

// `version` es texto en el modelo ("1", "2"…): se ordena y se compara como número.
export const versionOf = (v: string): number => Number(v) || 0;

/**
 * El estado de un requerimiento es el de su entrega MÁS RECIENTE (D88): una versión nueva reemplaza a la anterior en el cálculo, y las anteriores quedan como
 * histórico. Sin entregas es `pending`: la ausencia de evidencia nunca es cumplimiento.
 */
export function requirementState(submissions: ReadonlyArray<{ version: string; aiVerdict: string | null; reviews: ReviewRow[] }>): EvidenceState {
  const latest = [...submissions].sort((a, b) => versionOf(b.version) - versionOf(a.version))[0];
  if (!latest) return 'pending';
  return evidenceStateOf({ aiVerdict: latest.aiVerdict, review: latest.reviews[0] ? toReviewRecord(latest.reviews[0]) : null });
}
