import { DomainError } from '../../../common/errors/domain-error';

export const OBSERVATION_TYPES = ['observation', 'recommendation', 'information_request'] as const;
export type ObservationType = (typeof OBSERVATION_TYPES)[number];
export type ObservationStatus = 'open' | 'answered' | 'closed';

// §7.6, MD-154 · El ciclo de una observación del auditor: `open` → `answered` → `closed`. La empresa responde (open → answered); solo quien la escribió la devuelve
// (answered → open, no queda conforme) o la cierra (answered → closed). Una cerrada no se toca ni se reabre y ninguna se borra. La base impone lo mismo con un trigger
// (`tenant.guard_audit_observation`); aquí está para responder con el error del contrato antes de llegar a ella.
//
// Si una acción choca con el estado, `OBSERVATION_CLOSED` manda sobre los demás: una cerrada no admite NADA, y eso es más específico que «no está abierta» o «no está respondida».

/** Editar el texto: solo mientras no esté cerrada. */
export function assertEditable(status: ObservationStatus): void {
  if (status === 'closed') throw new DomainError('OBSERVATION_CLOSED');
}

/** Responder: solo una abierta. Una ya respondida espera al auditor (`OBSERVATION_NOT_OPEN`). */
export function assertCanAnswer(status: ObservationStatus): void {
  if (status === 'closed') throw new DomainError('OBSERVATION_CLOSED');
  if (status === 'answered') throw new DomainError('OBSERVATION_NOT_OPEN');
}

/** Cerrarla o devolverla a `open`: solo una respondida. Una abierta aún no tiene qué revisar (`INVALID_TRANSITION`). */
export function assertCanResolve(status: ObservationStatus): void {
  if (status === 'closed') throw new DomainError('OBSERVATION_CLOSED');
  if (status === 'open') throw new DomainError('INVALID_TRANSITION');
}
