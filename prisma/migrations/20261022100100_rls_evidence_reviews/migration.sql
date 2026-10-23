-- RLS de evidence_reviews (D84, D88). SQL a mano, aparte del cambio de schema. Mismo patrón que las demás tablas de tenant.
ALTER TABLE tenant.evidence_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.evidence_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.evidence_reviews
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
