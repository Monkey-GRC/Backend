-- RLS de catalog.evaluation_parameters (MD-495). SQL a mano: todos leen (el motor la lee desde las transacciones de cada empresa), solo admin_monkey escribe (D31).
ALTER TABLE catalog.evaluation_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_read ON catalog.evaluation_parameters FOR SELECT USING (true);
CREATE POLICY catalog_insert_admin ON catalog.evaluation_parameters FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_update_admin ON catalog.evaluation_parameters FOR UPDATE
  USING (current_setting('app.user_role', true) = 'admin_monkey')
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_delete_admin ON catalog.evaluation_parameters FOR DELETE
  USING (current_setting('app.user_role', true) = 'admin_monkey');
