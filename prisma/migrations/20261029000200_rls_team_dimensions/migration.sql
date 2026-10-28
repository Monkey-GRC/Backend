-- D96 · SQL a mano, aparte del cambio de schema (20261029000100), porque Prisma no modela RLS y la validación contra la shadow falla si se mezclan.
-- Mismo patrón que el resto de platform: se ve y se escribe lo del propio tenant (la empresa del admin_empresa que reparte el trabajo).
ALTER TABLE platform.user_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.user_dimensions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.user_dimensions
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE platform.service_dimension_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.service_dimension_owners FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.service_dimension_owners
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);