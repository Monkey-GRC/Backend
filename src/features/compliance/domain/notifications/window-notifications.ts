import { resolveRecipients } from '../../../../common/notifications/notification-audience';
import { partyOf, type ControlNoticeParams, type NotificationDraft, type ServiceNoticeParams } from '../../../../common/notifications/notification-draft';
import { AUDIENCES, type NotificationType } from '../../../../common/notifications/notification-type';
import { publicText } from '../../../../common/text/provider-names';
import type { ControlReadout } from '../controls/control-readout';

// D138, D151 · Los avisos de las ventanas, que genera la pasada diaria de los períodos con la foto del servicio que ya cargó (sin una consulta más por control). Función pura.
//
// · `window_due_soon` (PR-06): llegó `alert_at` (el cierre menos los días de la periodicidad) y alguna prueba del control sigue sin evidencia válida. Un solo aviso por control y cierre de
//   ventana (agrupa sus pruebas). La periodicidad diaria no lo genera (su alerta es el mismo día del cierre). Un servicio sin período auditado abierto también lo recibe.
// · `window_expired` (G-06): una ventana del período auditado abierto cerró sin evidencia. Un aviso por control y cierre. Sin período abierto no hay ventanas que perder: no se emite.
//
// · Los controles «Sin asignar» (sin dueño ni ejecutor) no avisan uno por uno: cada administrador recibe UN aviso por servicio, tipo y día, con la cantidad y los códigos de hasta 5 controles
//   (`target.kind = service`). Entran los que cumplen su `alert_at` hoy y los que cerraron ayer.
//
// Ambos son idempotentes: `(user_id, dedupe_key)` lleva el control y el cierre, así que repetir la pasada o tener dos réplicas no duplica.

/** Cuántos días atrás se mira un cierre: cubre una pasada que se saltó un día (reinicio, despliegue). El resto lo cierra la idempotencia. */
export const EXPIRED_LOOKBACK_DAYS = 3;
/** Cuántos códigos de control lleva el aviso agrupado; el resto va como «y N más». */
export const GROUPED_CODES = 5;

const LACKS_VALID_EVIDENCE: ReadonlySet<string> = new Set(['pending', 'expired', 'exception']);
const DAY_MS = 86_400_000;
const shiftDay = (day: string, days: number): string => new Date(Date.parse(day) + days * DAY_MS).toISOString().slice(0, 10);

export type WindowNotificationInput = {
  companyId: string;
  service: { id: string; name: string };
  readouts: readonly ControlReadout[];
  /** Los `admin_empresa` activos de la empresa. */
  adminIds: readonly string[];
  /** Hoy, `YYYY-MM-DD` en UTC. */
  today: string;
};

export function windowNotifications(input: WindowNotificationInput): NotificationDraft[] {
  const { companyId, service, today } = input;
  const yesterday = shiftDay(today, -1);
  const drafts: NotificationDraft[] = [];
  // Los controles «Sin asignar» no avisan uno por uno: cada administrador recibe UN aviso por servicio, tipo y día (Rod, 2026-11-25). Solo entran los de hoy: el aviso previo del día (`alert_at` = hoy)
  // y la ventana que cerró ayer; así el aviso del día siguiente no repite los de hoy.
  const unassigned: Record<'window_due_soon' | 'window_expired', Map<string, string>> = { window_due_soon: new Map(), window_expired: new Map() };
  for (const readout of input.readouts) {
    const { control } = readout;
    const code = control.catalogCode ?? control.ownCode;
    const base: ControlNoticeParams = {
      control_code: code,
      // Un texto del catálogo pasa por el filtro de proveedor (SEG-39): si nombrara a la sonda, se muestra el código.
      control_name: publicText(control.name) ?? code,
      requirement_codes: control.requirementCodes,
      service_id: service.id,
      service_name: service.name,
      owner: partyOf(control.access.owner),
      executor: partyOf(control.access.executor),
    };
    const isUnassigned = !control.access.owner && !control.access.executor;
    const chain = { ownerId: control.access.owner?.id ?? null, executorId: control.access.executor?.id ?? null, adminIds: input.adminIds };
    const emit = (type: NotificationType, windowEnd: string, periodicity: string) => {
      for (const userId of resolveRecipients(AUDIENCES[type], { chain })) {
        drafts.push({ companyId, userId, type, targetKind: 'control', targetId: control.id, params: { ...base, periodicity }, dueAt: windowEnd, dedupeKey: `${type}:${control.id}:${windowEnd}` });
      }
    };

    // Por vencer: una ventana abierta (`windowEnd` hoy o después) cuyo aviso previo ya llegó y que tiene una prueba sin evidencia válida.
    const soon = new Map<string, { periodicity: string; alertAt: string }>();
    for (const req of readout.requirements) {
      const periodicity = req.requirement.periodicity;
      if (req.status === 'not_applicable' || !periodicity || periodicity === 'daily') continue;
      for (const t of req.tests) {
        if (!t.windowEnd || !t.alertAt || t.windowEnd < today || t.alertAt > today || !LACKS_VALID_EVIDENCE.has(t.status)) continue;
        if (!soon.has(t.windowEnd)) soon.set(t.windowEnd, { periodicity, alertAt: t.alertAt });
      }
    }
    for (const [windowEnd, { periodicity, alertAt }] of soon) {
      if (!isUnassigned) emit('window_due_soon', windowEnd, periodicity);
      else if (alertAt === today) unassigned.window_due_soon.set(code, control.id);
    }

    // Vencida: el cierre cayó en los últimos días y el período abierto lo cuenta como ventana sin evidencia.
    const expired = new Map<string, string>();
    for (const m of readout.period?.missing ?? []) {
      const periodicity = readout.requirements.find((r) => r.requirement.code === m.requirementCode)?.requirement.periodicity;
      if (!periodicity) continue;
      if (isUnassigned) {
        if (m.windowEnd === yesterday) unassigned.window_expired.set(code, control.id);
        continue;
      }
      // Una ventana diaria que cerró hace dos días ya no es noticia: de la diaria solo se avisa la de ayer.
      const earliest = shiftDay(today, periodicity === 'daily' ? -1 : -EXPIRED_LOOKBACK_DAYS);
      if (m.windowEnd >= today || m.windowEnd < earliest || expired.has(m.windowEnd)) continue;
      expired.set(m.windowEnd, periodicity);
    }
    for (const [windowEnd, periodicity] of expired) emit('window_expired', windowEnd, periodicity);
  }

  for (const type of ['window_due_soon', 'window_expired'] as const) {
    const entries = [...unassigned[type]].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    if (entries.length === 0) continue;
    const shown = entries.slice(0, GROUPED_CODES);
    const params: ServiceNoticeParams = {
      service_id: service.id,
      service_name: service.name,
      control_count: entries.length,
      control_codes: shown.map(([code]) => code),
      controls: shown.map(([code, id]) => ({ id, code })),
    };
    for (const userId of input.adminIds) {
      drafts.push({ companyId, userId, type, targetKind: 'service', targetId: service.id, params, dueAt: null, dedupeKey: `${type}:service:${service.id}:${today}` });
    }
  }
  return drafts;
}
