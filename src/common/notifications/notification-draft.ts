import type { NotificationTargetKind, NotificationType } from './notification-type';

// Lo que un emisor entrega para que se guarde: un aviso por persona, con los datos del texto en `params` (el texto se arma al leer, en el idioma de quien lo lee).

/** Una persona tal como sale en un aviso: nunca su correo. `name` es nulo si la cuenta no tiene nombre. */
export type PartyParam = { name: string | null; role: string };

/** Los datos de un aviso de la cadena del control. Nunca texto del proveedor de la sonda ni códigos de prueba (D70, SEG-39). */
export type ControlNoticeParams = {
  control_code: string;
  control_name: string;
  requirement_codes: string[];
  service_id: string;
  service_name: string;
  owner: PartyParam | null;
  executor: PartyParam | null;
  /** Quien causó el hecho (`control_assigned`, `evidence_*`). */
  actor?: PartyParam | null;
  /** `window_due_soon` y `window_expired`: la periodicidad de la ventana. */
  periodicity?: string;
  /** `control_assigned`: con qué papel le asignaron el control. */
  assignee_role?: 'owner' | 'executor';
};

/** Los controles «Sin asignar» de un servicio con ventanas por vencer o vencidas, agrupados en UN aviso por administrador, servicio, tipo y día (Rod, 2026-11-25). */
export type ServiceNoticeParams = {
  service_id: string;
  service_name: string;
  /** Cuántos controles sin asignar entran en el aviso. */
  control_count: number;
  /** Los códigos de hasta 5 controles (orden alfabético); el resto va como «y N más». */
  control_codes: string[];
  /** Los mismos controles con su id (control del cliente), para enlazarlos (MD-515). Los avisos emitidos antes no lo traen. */
  controls?: { id: string; code: string }[];
};

export type NotificationParams = ControlNoticeParams | ServiceNoticeParams;
export const isServiceNotice = (p: NotificationParams): p is ServiceNoticeParams => 'control_count' in p;

export type NotificationDraft = {
  companyId: string;
  userId: string;
  type: NotificationType;
  targetKind: NotificationTargetKind;
  targetId: string;
  params: NotificationParams;
  /** El cierre de la ventana (`YYYY-MM-DD`), si aplica. */
  dueAt: string | null;
  /** `(user_id, dedupe_key)` es único: repetir el hecho no duplica el aviso. */
  dedupeKey: string;
};

/** La persona como la ve un aviso: nombre y apellido juntos, o nulo. */
export const partyOf = (p: { name: string | null; lastName: string | null; role: string } | null | undefined): PartyParam | null =>
  p ? { name: [p.name, p.lastName].map((s) => s?.trim()).filter(Boolean).join(' ') || null, role: p.role } : null;
