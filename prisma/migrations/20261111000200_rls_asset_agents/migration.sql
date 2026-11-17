-- RLS de asset_agents (D113, SEG-45). SQL a mano, aparte del cambio de schema. Mismo patrón que las demás tablas de tenant.
ALTER TABLE tenant.asset_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.asset_agents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.asset_agents
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
