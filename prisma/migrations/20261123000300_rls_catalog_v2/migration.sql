-- RLS de las tablas nuevas del catálogo v2 (MD-491). SQL a mano, aparte del cambio de schema.
-- catalog: todos leen, solo admin_monkey escribe (mismas cuatro políticas que el resto, D31, SEG-05, SEG-06).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'control_requirements', 'control_requirement_tests', 'control_requirement_documents',
    'standard_procedures', 'integration_categories', 'integration_category_controls',
    'documents', 'control_documents', 'control_framework_mappings'
  ] LOOP
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
