import { Parties, withinScope } from '../controls/control-access';
import type { ReviewerRole } from '../evidence/evidence';

// D102, D121 · El veredicto de una prueba manual no documental se registra y se revisa como la evidencia: lo registra el ejecutor, el dueño o el admin_empresa y lo revisan el dueño
// (si no lo registró él) y el admin_empresa (siempre). Una revisión por rol; el estado se DERIVA de ellas, nadie lo escribe.

/** Los tipos de dimensión que el control resuelve a mano (`catalog.control_dimension_type`); `hybrid` y `automated` los mide la sonda y su veredicto no se da. */
const MANUAL_DIMENSION_TYPES: ReadonlySet<string> = new Set(['manual', 'technical_manual']);
export const isManualDimensionType = (type: string): boolean => MANUAL_DIMENSION_TYPES.has(type);

export type VerdictResult = 'compliant' | 'non_compliant';
export type VerdictDecision = 'approve' | 'reject';
export type VerdictState = 'pending' | 'approved' | 'rejected';

export type VerdictReview = {
  reviewerRole: ReviewerRole;
  decision: VerdictDecision;
  note: string | null;
  reviewedBy: { id: string; name: string; lastName: string };
  reviewedAt: Date;
};

/** Algún rechazo → `rejected`; sin rechazos y con al menos una aprobación → `approved`; sin revisión → `pending`. Un rechazo posterior a una aprobación la anula. */
export function verdictStateOf(reviews: ReadonlyArray<Pick<VerdictReview, 'decision'>>): VerdictState {
  if (reviews.some((r) => r.decision === 'reject')) return 'rejected';
  return reviews.some((r) => r.decision === 'approve') ? 'approved' : 'pending';
}

/** Registra un veredicto el `admin_empresa`, el dueño (`responsable`) o el ejecutor (`delegado`) ACTIVOS del control de origen. El resto de los roles y quien no atiende el control, no. */
export const canRegisterVerdict = (p: { role: string; userId: string }, access: Parties): boolean => withinScope('verdicts.register', p, access);

/** El rol con el que registra un veredicto: si es el `admin_empresa`, nace con su aprobación y cuenta al instante (P34 sigue abierta). */
export const bornApproved = (p: { role: string }): boolean => p.role === 'admin_empresa';
