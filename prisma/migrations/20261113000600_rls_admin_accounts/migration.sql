-- D117 · SQL a mano de MD-215, aparte del cambio de schema (20261113000500): Prisma no modela triggers, permisos, RLS ni funciones.

-- 1. `purge_at` solo existe en un admin_monkey en gracia ---------------------------------------------------------------------
ALTER TABLE platform.users ADD CONSTRAINT users_purge_at_only_inactive_admin
  CHECK (purge_at IS NULL OR (status = 'inactive' AND role = 'admin_monkey'));
CREATE INDEX users_purge_at_idx ON platform.users (purge_at) WHERE purge_at IS NOT NULL;

-- 2. El sello es solo de añadir (D41): ni la app ni nadie lo edita o borra ------------------------------------------------------
GRANT SELECT, INSERT ON audit.admin_tombstones TO monkey_app;
REVOKE UPDATE, DELETE, TRUNCATE ON audit.admin_tombstones FROM monkey_app;
CREATE TRIGGER admin_tombstones_append_only
  BEFORE UPDATE OR DELETE ON audit.admin_tombstones
  FOR EACH ROW EXECUTE FUNCTION audit.reject_mutation();
CREATE TRIGGER admin_tombstones_no_truncate
  BEFORE TRUNCATE ON audit.admin_tombstones
  FOR EACH STATEMENT EXECUTE FUNCTION audit.reject_mutation();

-- Solo admin_monkey lee y escribe sellos (no tienen empresa): falla cerrado para cualquier otro rol.
ALTER TABLE audit.admin_tombstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.admin_tombstones FORCE ROW LEVEL SECURITY;
CREATE POLICY admin_monkey_only ON audit.admin_tombstones
  USING (COALESCE(current_setting('app.user_role', true), '') = 'admin_monkey')
  WITH CHECK (COALESCE(current_setting('app.user_role', true), '') = 'admin_monkey');

-- 3. La purga programada necesita ver las cuentas vencidas de cualquier empresa (la RLS de users es por empresa) -----------
-- Angosta: solo dice cuáles son (id y empresa); el borrado de cada una corre con el tenant de su empresa, con RLS.
CREATE FUNCTION platform.list_admins_due_for_purge(p_now timestamp)
RETURNS TABLE (id uuid, company_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT u.id, u.company_id
    FROM platform.users u
   WHERE u.role = 'admin_monkey' AND u.status = 'inactive' AND u.purge_at IS NOT NULL AND u.purge_at <= p_now
   ORDER BY u.purge_at, u.id;
$$;

REVOKE ALL ON FUNCTION platform.list_admins_due_for_purge(timestamp) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.list_admins_due_for_purge(timestamp) TO monkey_app;
