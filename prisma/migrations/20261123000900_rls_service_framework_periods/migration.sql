-- RLS de tenant.service_framework_periods (MD-500). SQL a mano, aparte del cambio de schema: aislamiento por tenant_id, falla cerrado.
ALTER TABLE tenant.service_framework_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.service_framework_periods FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.service_framework_periods
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
