-- D102 · RLS y reglas de la base para los grupos y la asignación de controles. SQL a mano, aparte del cambio de schema (20261104000100): Prisma no modela RLS ni CHECK
-- y la validación contra la shadow falla si se mezclan. Mismo patrón que el resto de platform: cada tenant ve y escribe lo suyo.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_groups', 'client_control_assignments'] LOOP
    EXECUTE format('ALTER TABLE platform.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE platform.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON platform.%I
        USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- Reglas que no dependen de la aplicación (§5.2):
-- · `is_internal` solo existe en el `delegado` y es obligatorio ahí; en los demás roles es nulo.
ALTER TABLE platform.users ADD CONSTRAINT users_is_internal_only_delegado
  CHECK ((role = 'delegado' AND is_internal IS NOT NULL) OR (role <> 'delegado' AND is_internal IS NULL));
-- · Solo `responsable` y `delegado` pertenecen a un grupo.
ALTER TABLE platform.users ADD CONSTRAINT users_group_only_team_roles
  CHECK (group_id IS NULL OR role IN ('responsable', 'delegado'));
-- · El ejecutor nunca es el mismo dueño: sin ejecutor, ejecuta el dueño.
ALTER TABLE platform.client_control_assignments ADD CONSTRAINT client_control_assignments_executor_not_owner
  CHECK (executor_id IS NULL OR executor_id <> owner_id);
