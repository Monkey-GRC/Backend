-- D95, SEG-64 · Restaura en `find_login_candidates` que el usuario de una empresa dada de baja (`companies.status = 'deactivated'`) llega como `inactive`.
--
-- La migración 20261028100100_company_purge lo había puesto. La migración 20261030000100_remove_consultant volvió a crear la función para poder recrear `user_role`,
-- pero con la definición anterior, y con ello el usuario de una empresa archivada volvió a poder iniciar sesión (`test/auditoria/archivar-empresa.e2e-spec.ts`).
-- La forma de la función es la de esa migración; los permisos se mantienen porque `CREATE OR REPLACE` no los cambia.

CREATE OR REPLACE FUNCTION platform.find_login_candidates(p_email text)
RETURNS TABLE (
  id                    uuid,
  company_id            uuid,
  password_hash         text,
  role                  platform.user_role,
  status                platform.user_status,
  is_mfa_enabled        boolean,
  failed_login_attempts integer,
  locked_until          timestamp,
  password_changed_at   timestamp
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT u.id, u.company_id, u.password_hash, u.role,
         CASE WHEN c.status = 'deactivated' THEN 'inactive'::platform.user_status ELSE u.status END,
         u.is_mfa_enabled, u.failed_login_attempts, u.locked_until, u.password_changed_at
  FROM platform.users u
  JOIN platform.companies c ON c.id = u.company_id
  WHERE u.email = lower(p_email);
$$;
