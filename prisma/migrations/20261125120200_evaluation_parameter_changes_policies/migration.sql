-- MD-508 · Completa las políticas de catalog.evaluation_parameter_changes con el patrón del resto del catálogo (D31: solo admin_monkey escribe; la prueba de cobertura de RLS lo exige). ADITIVA.
-- El historial sigue siendo inmutable: `monkey_app` no tiene UPDATE ni DELETE sobre la tabla (20261125120100), así que estas políticas no abren nada.
CREATE POLICY catalog_update_admin ON catalog.evaluation_parameter_changes FOR UPDATE
  USING (current_setting('app.user_role', true) = 'admin_monkey')
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_delete_admin ON catalog.evaluation_parameter_changes FOR DELETE
  USING (current_setting('app.user_role', true) = 'admin_monkey');
