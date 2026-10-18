// Estado calculado de una entrega de evidencia (enums.md `evidence_state`, RN-01 a RN-03). Se DERIVA, nadie lo escribe.
export type EvidenceState = 'compliant' | 'non_compliant' | 'pending' | 'in_review' | 'expired' | 'not_applicable';

// D84 · La empresa solo aporta: el estado sale de la revisión humana del consultor (MD-127), que aún no existe. Mientras tanto una entrega espera su revisión
// (`pending`) y, si la IA ya dio su sugerencia, queda `in_review`: la IA nunca produce «cumple» (RN-03).
export function evidenceStateOf(entrega: { aiVerdict: string | null }): EvidenceState {
  return entrega.aiVerdict ? 'in_review' : 'pending';
}
