-- RLS de catalog.integrations (D110). SQL a mano, aparte del cambio de schema.
-- catalog: todos leen, solo admin_monkey escribe (mismas cuatro políticas que el resto, D31, SEG-05, SEG-06).
ALTER TABLE catalog.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_read ON catalog.integrations FOR SELECT USING (true);
CREATE POLICY catalog_insert_admin ON catalog.integrations FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_update_admin ON catalog.integrations FOR UPDATE
  USING (current_setting('app.user_role', true) = 'admin_monkey')
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_delete_admin ON catalog.integrations FOR DELETE
  USING (current_setting('app.user_role', true) = 'admin_monkey');
