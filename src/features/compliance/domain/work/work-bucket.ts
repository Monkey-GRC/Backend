import type { EvidenceState } from '../evidence/evidence';

// D122 · En qué bucket de «Mi trabajo» cae un control visto desde quien pregunta. Lógica pura, sin Prisma ni Nest.

export const WORK_BUCKETS = ['rejected', 'to_review', 'to_upload', 'in_review', 'done'] as const;
export type WorkBucket = (typeof WORK_BUCKETS)[number];
export type RoleInControl = 'owner' | 'executor';

/** Qué pasó con lo entregado: se rechazó (o venció) y hay que rehacerlo, espera la revisión de una persona o ya se aceptó. */
export type DeliveryOutcome = 'rejected' | 'waiting' | 'accepted';

/**
 * Una pieza que el control pide: una evidencia requerida por una prueba documental o el resultado de una prueba manual no documental. `null` = todavía no se entregó nada.
 * `ownerCanReview` es falso cuando el dueño de ESTE control no es quien revisa la pieza (un veredicto registrado desde otro control: lo revisa el dueño del de origen).
 */
export type WorkItem = { delivery: { by: string; outcome: DeliveryOutcome; ownerCanReview: boolean } | null };

export const outcomeOfEvidence = (state: EvidenceState): DeliveryOutcome =>
  state === 'non_compliant' || state === 'expired' ? 'rejected' : state === 'pending' || state === 'in_review' ? 'waiting' : 'accepted';

export type WorkViewer = { userId: string; role: RoleInControl; executorId: string | null };

export type ControlWork = { bucket: WorkBucket; missing: number; rejected: number; toReview: number };

/**
 * El primero que aplique: `rejected` (algo que subió o registró la persona, o su delegado si es el dueño, hay que rehacerlo) → `to_review` (solo el dueño: algo de otra persona espera su
 * revisión) → `to_upload` (falta una pieza) → `in_review` (todo entregado, algo espera a otra persona) → `done`.
 */
export function classifyControlWork(viewer: WorkViewer, items: readonly WorkItem[]): ControlWork {
  const isOwner = viewer.role === 'owner';
  const isMine = (by: string): boolean => by === viewer.userId || (isOwner && by === viewer.executorId);
  const missing = items.filter((i) => !i.delivery).length;
  const rejected = items.filter((i) => i.delivery?.outcome === 'rejected' && isMine(i.delivery.by)).length;
  const toReview = isOwner ? items.filter((i) => i.delivery?.outcome === 'waiting' && i.delivery.ownerCanReview && i.delivery.by !== viewer.userId).length : 0;
  const waiting = items.some((i) => i.delivery?.outcome === 'waiting');
  const bucket: WorkBucket = rejected > 0 ? 'rejected' : toReview > 0 ? 'to_review' : missing > 0 ? 'to_upload' : waiting ? 'in_review' : 'done';
  return { bucket, missing, rejected, toReview };
}

/** Lo que falta de la persona: lo que hay que subir, rehacer y revisar, más las observaciones abiertas del auditor sobre el control. */
export const pendingItemsOf = (w: ControlWork, openObservations: number): number => w.missing + w.rejected + w.toReview + openObservations;
