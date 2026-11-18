-- D123 · RLS de `platform.trusted_devices` (MD-217). SQL a mano, aparte del cambio de schema. Mismo patrón que `sessions`.
-- La búsqueda normal es siempre con el tenant ya conocido (la persona se identifica antes por su contraseña o su sesión); la única puerta sin RLS, para cerrar sesión sin sesión, es `platform.find_trusted_device` (20261118000300).
ALTER TABLE platform.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.trusted_devices FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.trusted_devices
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
