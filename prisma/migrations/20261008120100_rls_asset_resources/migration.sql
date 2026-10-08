-- RLS de asset_resources (D56). SQL a mano, aparte del cambio de schema. Mismo patrón que las demás tablas de tenant.
ALTER TABLE tenant.asset_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.asset_resources FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.asset_resources
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
