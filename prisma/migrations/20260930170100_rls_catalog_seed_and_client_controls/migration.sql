-- RLS de las tablas nuevas de la migración anterior (D36). SQL a mano, aparte del cambio de schema.

-- 1. tenant: aislamiento por tenant_id, falla cerrado.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['client_control_dimensions', 'client_control_tests'] LOOP
    EXECUTE format('ALTER TABLE tenant.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE tenant.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON tenant.%I
        USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- 2. catalog: todos leen, solo admin_monkey escribe (mismas cuatro políticas que el resto, D31).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['evidence_templates', 'control_evidence_templates'] LOOP
    EXECUTE format('ALTER TABLE catalog.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY catalog_read ON catalog.%I FOR SELECT USING (true)', t);
    EXECUTE format($p$
      CREATE POLICY catalog_insert_admin ON catalog.%I FOR INSERT
        WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
    EXECUTE format($p$
      CREATE POLICY catalog_update_admin ON catalog.%I FOR UPDATE
        USING (current_setting('app.user_role', true) = 'admin_monkey')
        WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
    EXECUTE format($p$
      CREATE POLICY catalog_delete_admin ON catalog.%I FOR DELETE
        USING (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
  END LOOP;
END $$;
