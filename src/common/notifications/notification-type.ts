// D138, D143, D151 · Los tipos de aviso, a quién llegan y en qué canal en vivo se publican (contracts/enums/notificaciones.md). Mismos valores que `platform.notification_type`.
export const NOTIFICATION_TYPES = [
  'window_due_soon',
  'window_expired',
  'control_assigned',
  'evidence_approved',
  'evidence_rejected',
  'observation_created',
  'direct_check_failed',
  'check_parameters_changed',
  'automatic_evidence_stale',
  'control_pending_approval',
  'control_owner_approved',
  'control_returned',
  'level_override_proposed',
  'level_override_decided',
  'remediation_plan_proposed',
  'remediation_plan_decided',
  'not_applicable_requested',
  'not_applicable_decided',
  'document_assigned',
  'document_acceptance_reminder',
  'document_approval_requested',
  'document_renewal_due',
  'company_purge_upcoming',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TARGET_KINDS = ['control', 'service', 'document', 'company'] as const;
export type NotificationTargetKind = (typeof NOTIFICATION_TARGET_KINDS)[number];

export const NOTIFICATION_READ_FILTERS = ['all', 'unread', 'read'] as const;
export type NotificationReadFilter = (typeof NOTIFICATION_READ_FILTERS)[number];

/** La regla con que el emisor resuelve las personas (`notification_audience`); no es columna. */
export type NotificationAudience =
  | 'executor'
  | 'owner'
  | 'company_admin'
  | 'assignee'
  | 'uploader'
  | 'document_approver'
  | 'document_pending_acceptor'
  | 'document_owner'
  | 'monkey_admins';

/** Quién recibe cada tipo (D138, D151). */
export const AUDIENCES: Record<NotificationType, readonly NotificationAudience[]> = {
  window_due_soon: ['executor', 'owner'],
  window_expired: ['executor', 'owner', 'company_admin'],
  control_assigned: ['assignee'],
  evidence_approved: ['uploader', 'owner'],
  evidence_rejected: ['uploader', 'owner'],
  observation_created: ['owner', 'executor'],
  direct_check_failed: ['executor', 'owner', 'company_admin'],
  check_parameters_changed: ['company_admin'],
  automatic_evidence_stale: ['executor', 'owner'],
  control_pending_approval: ['owner'],
  control_owner_approved: ['company_admin'],
  control_returned: ['executor', 'owner'],
  // MD-529 · Lo que propone el responsable espera al administrador; la decisión vuelve al responsable (y, en un plan aprobado, a la persona del plan).
  level_override_proposed: ['company_admin'],
  level_override_decided: ['owner'],
  remediation_plan_proposed: ['company_admin'],
  remediation_plan_decided: ['owner', 'assignee'],
  not_applicable_requested: ['company_admin'],
  not_applicable_decided: ['owner'],
  document_assigned: ['assignee'],
  document_acceptance_reminder: ['document_pending_acceptor'],
  document_approval_requested: ['document_approver'],
  document_renewal_due: ['document_owner'],
  company_purge_upcoming: ['monkey_admins'],
};

/** Los tipos que se emiten hoy; el resto está reservado (los emiten MD-506 y DT-83). `evidence_approved` y `evidence_rejected` ya no se emiten: la aprobación es del control (D132, MD-504). */
export const EMITTED_TYPES: readonly NotificationType[] = ['window_due_soon', 'window_expired', 'control_assigned', 'direct_check_failed', 'check_parameters_changed', 'automatic_evidence_stale', 'control_pending_approval', 'control_owner_approved', 'control_returned', 'level_override_proposed', 'level_override_decided', 'remediation_plan_proposed', 'remediation_plan_decided', 'not_applicable_requested', 'not_applicable_decided'];

/** El historial de la campana: la API nunca devuelve más viejo y una pasada diaria lo borra. */
export const NOTIFICATION_RETENTION_DAYS = 90;

/** El canal de Postgres (`LISTEN`/`NOTIFY`) por el que cada réplica se entera de un aviso ya confirmado. */
export const NOTIFICATION_CHANNEL = 'monkey_notifications';

/** Cada cuántos segundos el canal en vivo manda un `ping`. */
export const STREAM_PING_SECONDS = 25;
