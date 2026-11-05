-- D103 / SEG-72 · Cuántas cuentas cuentan para el cupo de cada empresa (active, pending, suspended; cualquier rol), para que admin_monkey vea `users_count`
-- en el listado y el detalle de empresas. `users` solo tiene la política `tenant_isolation`: un admin_monkey no ve las cuentas de otras empresas con un SELECT
-- normal. Esta puerta es SECURITY DEFINER y angosta: devuelve SOLO conteos, nunca datos de personas, y el aislamiento se impone aquí dentro: quien no es
-- admin_monkey solo obtiene el conteo de su propia empresa (app.tenant_id); las demás ids se ignoran. Una empresa sin cuentas contadas devuelve 0.
-- Los estados contados repiten los de src/common/quota/user-quota.ts: si cambia uno, cambia el otro.
CREATE FUNCTION platform.company_users_count(p_company_ids uuid[])
RETURNS TABLE (
  company_id  uuid,
  users_count int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT ids.id, count(u.id)::int
  FROM (
    SELECT DISTINCT i AS id
    FROM unnest(p_company_ids) AS i
    WHERE current_setting('app.user_role', true) = 'admin_monkey'
       OR i = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  ) AS ids
  LEFT JOIN platform.users u
    ON u.company_id = ids.id AND u.status IN ('active', 'pending', 'suspended')
  GROUP BY ids.id;
$$;

REVOKE ALL ON FUNCTION platform.company_users_count(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.company_users_count(uuid[]) TO monkey_app;
