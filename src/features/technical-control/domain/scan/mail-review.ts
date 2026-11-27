// D157 · ¿La evaluación de Microsoft 365 leyó el correo? No se pregunta por el rol: se mira lo que de verdad se midió.
// Estas verificaciones solo existen con acceso al correo (comprobado contra un tenant real con y sin él). No vale cualquier «exchange_»: alguna se lee por otra vía y aparece sin ese acceso.
export const MAIL_ONLY_CHECKS = [
  'exchange_external_email_tagging_enabled',
  'exchange_mailbox_audit_bypass_disabled',
  'exchange_mailbox_policy_additional_storage_restricted',
  'exchange_organization_delicensing_resiliency_enabled',
  'exchange_organization_mailbox_auditing_enabled',
  'exchange_organization_mailtips_enabled',
  'exchange_organization_modern_authentication_enabled',
  'exchange_organization_reject_direct_send_enabled',
  'exchange_owa_mailbox_policy_personal_accounts_disabled',
  'exchange_roles_assignment_policy_addins_disabled',
  'exchange_shared_mailbox_sign_in_disabled',
  'exchange_transport_config_smtp_auth_disabled',
  'exchange_transport_rules_mail_forwarding_disabled',
  'exchange_transport_rules_whitelist_disabled',
  'exchange_user_mailbox_auditing_enabled',
];

// `null` = no aplica (no es una evaluación completada de Microsoft 365). Una verificación que no se pudo ejecutar no cuenta como leída.
export function mailReviewed(execution: { id: string; status: string }, microsoft365: ReadonlySet<string>, withMail: ReadonlySet<string>): boolean | null {
  if (execution.status !== 'completed' || !microsoft365.has(execution.id)) return null;
  return withMail.has(execution.id);
}
