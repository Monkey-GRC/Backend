import { EvidenceState, evidenceStateOf } from '../../domain/evidence/evidence';

// `version` es texto en el modelo ("1", "2"…): se ordena y se compara como número.
export const versionOf = (v: string): number => Number(v) || 0;

/** Lo que hace falta leer de una entrega para saber si cuenta: su versión y si fue devuelta (`returned_approval_id`, D132). */
export const SUBMISSION_STATE_SELECT = { version: true, returnedApprovalId: true } as const;
export type SubmissionStateRow = { version: string; returnedApprovalId: string | null };

export const submissionState = (s: SubmissionStateRow): EvidenceState => evidenceStateOf({ returned: s.returnedApprovalId !== null });

/**
 * El estado de un requerimiento es el de su entrega MÁS RECIENTE (D88): una versión nueva reemplaza a la anterior en el cálculo, y las anteriores quedan como
 * histórico. Sin entregas es `pending`: la ausencia de evidencia nunca es cumplimiento.
 */
export function requirementState(submissions: ReadonlyArray<SubmissionStateRow>): EvidenceState {
  const latest = [...submissions].sort((a, b) => versionOf(b.version) - versionOf(a.version))[0];
  return latest ? submissionState(latest) : 'pending';
}

/**
 * MD-529 · Una entrega «tiene evidencia» (la de una ocurrencia, DT-115) con el mismo criterio con que cuenta para el motor: está cargada, vigente y no fue devuelta con el control (D132). Una sola función para
 * `requirement_occurrences.has_evidence` en el motor y en la lista de ocurrencias.
 */
export const submissionCounts = (s: SubmissionStateRow): boolean => submissionState(s) === 'compliant';
