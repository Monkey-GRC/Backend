-- RLS de las tablas nuevas de la migración anterior (D67). SQL a mano, aparte del cambio de schema.
-- catalog: todos leen, solo admin_monkey escribe (mismas cuatro políticas que el resto, D31, SEG-05, SEG-06).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['capability_platforms', 'platform_connection_methods', 'platform_regions', 'capability_frequencies', 'deployment_scenario_capabilities'] LOOP
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
