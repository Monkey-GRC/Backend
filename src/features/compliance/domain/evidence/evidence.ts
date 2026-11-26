// Estado calculado de una entrega de evidencia (enums.md `evidence_state`). Se DERIVA, nadie lo escribe.
export type EvidenceState = 'compliant' | 'non_compliant' | 'pending' | 'in_review' | 'expired' | 'not_applicable';

/**
 * D132 punto 3 · La aprobación es del control, no de cada evidencia: una entrega que cargó el delegado o el responsable cuenta mientras esté vigente (la vigencia la decide la ventana del motor)
 * y no haya sido devuelta. Una entrega devuelta (`returnedApprovalId`) deja de contar y se muestra como rechazada, con el motivo de la devolución.
 */
export function evidenceStateOf(entrega: { returned: boolean }): EvidenceState {
  return entrega.returned ? 'non_compliant' : 'compliant';
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
