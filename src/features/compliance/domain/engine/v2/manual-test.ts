import type { WindowMode } from '../../../../../common/evaluation-parameters/parameter-definitions';
import type { EvidenceState } from '../../evidence/evidence';
import { isEvidenceCurrent, currentWindow, windowEndDate } from './windows';
import { Periodicity, TestStatus } from './types';

// Puente de las pruebas manuales (DT-114): documental, población, operativa y técnica manual toman su estado de la evidencia que se sube hoy para ellas y, en las que no son
// documentales, del último veredicto aprobado (D85, D121). Lo cierran MD-504 (el resultado lo registra el responsable, D140) y MD-506 (Documentos, T-01).

export type ManualEvidence = {
  /** Estado de la entrega MÁS RECIENTE del requerimiento (combinación de las revisiones, D102). */
  state: EvidenceState;
  /** Cuándo se entregó; `null` si no hay entrega. */
  submittedAt: Date | null;
};
export type ManualVerdict = { result: 'compliant' | 'non_compliant'; at: Date };

export type ManualTestInput = {
  evidence: readonly ManualEvidence[];
  verdict?: ManualVerdict | null;
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
 * Estado de una prueba manual: validada → Correcto · rechazada → Excepción · sin entrega o sin revisar → Pendiente · fuera de su ventana → Vencido. Nunca produce Observación.
 * `window_end` es el cierre de la ventana vigente (o de 12 meses desde la última evidencia, en la anual).
 */
export function evaluateManualTest(input: ManualTestInput): ManualTestEvaluation {
  const { periodicity, now } = input;
  const mode = input.windowMode ?? 'calendar';
  const fromEvidence = statusOfEvidence(input.evidence, periodicity, now, mode);
  let status = fromEvidence;
  const v = input.verdict;
  if (v) {
    const fromVerdict: TestStatus = v.result === 'non_compliant' ? 'exception' : isEvidenceCurrent(periodicity, v.at, now, mode) ? 'correct' : 'expired';
    if (fromVerdict === 'exception' || fromEvidence === 'exception') status = 'exception';
    else if (fromVerdict === 'correct') status = 'correct';
    else status = fromEvidence === 'correct' ? 'correct' : 'expired';
  }
  const dates = input.evidence.filter((e) => e.state === 'compliant' && e.submittedAt).map((e) => (e.submittedAt as Date).getTime());
  if (v?.result === 'compliant') dates.push(v.at.getTime());
  const lastValidAt = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  return { status, windowEnd: windowEndDate(currentWindow({ periodicity, now, lastValidAt, mode, periodStart: input.periodStart })) };
}
