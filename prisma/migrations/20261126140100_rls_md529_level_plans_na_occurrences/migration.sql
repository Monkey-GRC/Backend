-- MD-529 · RLS por `tenant_id` y permisos de las cinco tablas nuevas (SQL a mano, aparte del cambio de schema 20261126140000). Nada se borra desde la aplicación; las ocurrencias son inmutables.

ALTER TABLE tenant.control_level_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.control_level_overrides FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.control_level_overrides
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.remediation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.remediation_plans FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.remediation_plans
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.requirement_applicability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.requirement_applicability_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.requirement_applicability_requests
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.requirement_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.requirement_occurrences FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.requirement_occurrences
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.no_occurrence_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.no_occurrence_declarations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.no_occurrence_declarations
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

REVOKE DELETE, TRUNCATE ON tenant.control_level_overrides, tenant.remediation_plans, tenant.requirement_applicability_requests, tenant.requirement_occurrences, tenant.no_occurrence_declarations FROM monkey_app;
REVOKE UPDATE ON tenant.requirement_occurrences FROM monkey_app;
-- Las solicitudes solo cambian al decidirse, revertirse o dejar de valer.
REVOKE UPDATE ON tenant.control_level_overrides, tenant.remediation_plans, tenant.requirement_applicability_requests, tenant.no_occurrence_declarations FROM monkey_app;
GRANT UPDATE ("status", "decided_by", "decided_at", "decision_reason", "invalidated_at") ON tenant.control_level_overrides TO monkey_app;
GRANT UPDATE ("status", "decided_by", "decided_at", "decision_reason", "invalidated_at") ON tenant.remediation_plans TO monkey_app;
GRANT UPDATE ("status", "decided_by", "decided_at", "decision_reason", "reverted_by", "reverted_at", "revert_reason") ON tenant.requirement_applicability_requests TO monkey_app;
GRANT UPDATE ("invalidated_at") ON tenant.no_occurrence_declarations TO monkey_app;
