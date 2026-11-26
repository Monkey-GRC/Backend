import type { WindowMode } from '../../../../../common/evaluation-parameters/parameter-definitions';
import type { EvidenceState } from '../../evidence/evidence';
import { isEvidenceCurrent, currentWindow, windowEndDate } from './windows';
import { Periodicity, TestStatus } from './types';

// Pruebas manuales: documental, población, operativa y técnica manual toman su estado de la evidencia que se sube para ellas (cuenta si no fue devuelta, D132) y, en las que no son
// documentales, del resultado que el responsable registró de la prueba EN ESE control (D140 puntos 1 y 2, MD-504). Lo que falta de DT-114 lo cierra MD-506 (Documentos, T-01).

export type ManualEvidence = {
  /** Estado de la entrega MÁS RECIENTE del requerimiento (`compliant` si cuenta, `non_compliant` si el control se devolvió por ella, D132). */
  state: EvidenceState;
  /** Cuándo se entregó; `null` si no hay entrega. */
  submittedAt: Date | null;
};
/** El último resultado registrado de la prueba en el control (`manual_test_results`). */
export type ManualResult = { result: 'correct' | 'observation' | 'exception'; at: Date };

export type ManualTestInput = {
  evidence: readonly ManualEvidence[];
  result?: ManualResult | null;
  /** Las pruebas operativas, de población y técnicas manuales se deciden por el resultado del responsable (D140 punto 2); la documental, por su evidencia. */
  requiresResult?: boolean;
  periodicity: Periodicity | null;
  now: Date;
  /** PR-07 · Sin él, `calendar`. */
  windowMode?: WindowMode;
  /** Inicio del período auditado: en `rolling`, de ahí vence la primera ventana si todavía no hay evidencia. */
  periodStart?: Date | null;
};
export type ManualTestEvaluation = { status: TestStatus; windowEnd: string | null };

// Lo más decisivo primero (RN-04): un rechazo gana, luego lo vencido, lo que espera revisión y lo pendiente.
function statusOfEvidence(evidence: readonly ManualEvidence[], periodicity: Periodicity | null, now: Date, mode: WindowMode): TestStatus {
  const counted = evidence.filter((e) => e.state !== 'not_applicable');
  if (evidence.length === 0) return 'pending';
  if (counted.length === 0) return 'not_applicable';
  if (counted.some((e) => e.state === 'non_compliant')) return 'exception';
  if (counted.some((e) => e.state === 'expired')) return 'expired';
  if (counted.some((e) => e.state === 'in_review' || e.state === 'pending')) return 'pending';
  // Todas válidas: cada una debe caer dentro de su ventana.
  return counted.every((e) => e.submittedAt === null || isEvidenceCurrent(periodicity, e.submittedAt, now, mode)) ? 'correct' : 'expired';
}

/**
 * Estado de una prueba manual: con resultado registrado, el resultado (Correcto, Observación o Excepción) y la evidencia devuelta lo vuelve Excepción; sin resultado, una prueba que lo exige queda Pendiente y la documental sigue a su evidencia: cuenta → Correcto · devuelta → Excepción · sin entrega → Pendiente · fuera de su ventana → Vencido.
 * `window_end` es el cierre de la ventana vigente (o de 12 meses desde la última evidencia, en la anual).
 */
export function evaluateManualTest(input: ManualTestInput): ManualTestEvaluation {
  const { periodicity, now } = input;
  const mode = input.windowMode ?? 'calendar';
  const fromEvidence = statusOfEvidence(input.evidence, periodicity, now, mode);
  let status = fromEvidence;
  const r = input.result;
  if (r) {
    // El resultado manual decide solo (D140 punto 1): un resultado vigente es Correcto, Observación o Excepción; uno vencido, Vencido. La evidencia devuelta (`exception`) también cuenta.
    const fromResult: TestStatus = r.result === 'exception' ? 'exception' : isEvidenceCurrent(periodicity, r.at, now, mode) ? (r.result === 'observation' ? 'observation' : 'correct') : 'expired';
    status = fromResult === 'exception' || fromEvidence === 'exception' ? 'exception' : fromResult;
  } else if (input.requiresResult && fromEvidence !== 'exception') {
    // Sin resultado del responsable la prueba sigue pendiente aunque haya evidencia cargada.
    status = fromEvidence === 'not_applicable' ? 'not_applicable' : 'pending';
  }
  const dates = input.evidence.filter((e) => e.state === 'compliant' && e.submittedAt).map((e) => (e.submittedAt as Date).getTime());
  if (r && r.result !== 'exception') dates.push(r.at.getTime());
  const lastValidAt = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  return { status, windowEnd: windowEndDate(currentWindow({ periodicity, now, lastValidAt, mode, periodStart: input.periodStart })) };
}
