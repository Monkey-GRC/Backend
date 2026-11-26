import type { NotificationDraft } from '../../../../common/notifications/notification-draft';

// D153 · `check_parameters_changed`: cuando Monkey cambia un parámetro PR-n (D149), cada `admin_empresa` activo de cada empresa no archivada recibe UN aviso por cambio. Lo escribe la pasada por
// empresa (no el PATCH, que no tiene empresa), así que no es instantáneo. Función pura.
//
// · Un cambio anterior a la creación de la empresa no se avisa: no le tocó vivirlo.
// · Solo se miran los cambios de los últimos días (`PARAMETER_LOOKBACK_DAYS`, como el aviso de ventanas vencidas: cubre una pasada que se saltó un día), siempre dentro de la retención de los avisos
//   (90 días). No se puede acotar «desde el último aviso de la empresa»: la lectura de avisos es por persona (SEG-87) y la pasada no es ninguna persona. El resto lo cierra la idempotencia.
// · Idempotente: `(user_id, dedupe_key)` lleva el id del cambio, así que releer la ventana en cada pasada no duplica.
const DAY_MS = 86_400_000;
/** Cuántos días atrás se mira un cambio de parámetro. */
export const PARAMETER_LOOKBACK_DAYS = 3;

export type ParameterChange = { id: string; key: string; code: string | null; previousValue: unknown; newValue: unknown; changedAt: Date };

export type ParameterChangeInput = {
  companyId: string;
  companyCreatedAt: Date;
  changes: readonly ParameterChange[];
  /** Los `admin_empresa` activos de la empresa. */
  adminIds: readonly string[];
  now: Date;
};

/** Desde cuándo se leen los cambios: el más reciente entre el alta de la empresa y los últimos días. */
export const changesSince = (companyCreatedAt: Date, now: Date): Date =>
  new Date(Math.max(companyCreatedAt.getTime(), now.getTime() - PARAMETER_LOOKBACK_DAYS * DAY_MS));

export function parameterChangeNotifications(input: ParameterChangeInput): NotificationDraft[] {
  const since = changesSince(input.companyCreatedAt, input.now).getTime();
  const drafts: NotificationDraft[] = [];
  for (const change of [...input.changes].sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime() || (a.id < b.id ? -1 : 1))) {
    if (change.changedAt.getTime() < since) continue;
    for (const userId of input.adminIds) {
      drafts.push({
        companyId: input.companyId,
        userId,
        type: 'check_parameters_changed',
        targetKind: 'company',
        targetId: input.companyId,
        params: { parameter_key: change.key, parameter_code: change.code, previous_value: change.previousValue, new_value: change.newValue },
        dueAt: null,
        dedupeKey: `check_parameters_changed:${change.id}`,
      });
    }
  }
  return drafts;
}
