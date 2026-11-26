-- RLS de catalog.evaluation_parameter_changes (MD-508). SQL a mano: todos leen (la pasada de cada empresa), solo admin_monkey inserta (D31). Es un historial: nadie actualiza ni borra.
ALTER TABLE catalog.evaluation_parameter_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_read ON catalog.evaluation_parameter_changes FOR SELECT USING (true);
CREATE POLICY catalog_insert_admin ON catalog.evaluation_parameter_changes FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
REVOKE UPDATE, DELETE, TRUNCATE ON catalog.evaluation_parameter_changes FROM monkey_app;
