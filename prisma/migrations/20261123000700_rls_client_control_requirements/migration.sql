-- RLS de tenant.client_control_requirements (MD-498). SQL a mano, aparte del cambio de schema: aislamiento por tenant_id, falla cerrado.
ALTER TABLE tenant.client_control_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.client_control_requirements FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.client_control_requirements
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
