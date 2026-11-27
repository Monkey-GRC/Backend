-- MD-529 · La validación de sesión de cada petición en UN viaje a la base (antes: BEGIN, set_config, SELECT y COMMIT).
-- SECURITY DEFINER y angosta, como find_session_by_token: solo devuelve la sesión y su dueño cuando coinciden la empresa, la persona y la sesión
-- que firma el token, así que no se salta el aislamiento entre empresas.
CREATE FUNCTION platform.find_session_with_owner(p_company_id uuid, p_user_id uuid, p_session_id uuid)
RETURNS TABLE (
  id               uuid,
  company_id       uuid,
  user_id          uuid,
  created_at       timestamp,
  last_activity_at timestamp,
  expires_at       timestamp,
  revoked_at       timestamp,
  owner_id         uuid,
  owner_company_id uuid,
  owner_role       text,
  owner_status     text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT s.id, s.company_id, s.user_id, s.created_at, s.last_activity_at, s.expires_at, s.revoked_at,
         u.id, u.company_id, u.role::text, u.status::text
  FROM platform.sessions s
  LEFT JOIN platform.users u ON u.id = s.user_id AND u.company_id = s.company_id
  WHERE s.id = p_session_id AND s.company_id = p_company_id AND s.user_id = p_user_id;
$$;

REVOKE ALL ON FUNCTION platform.find_session_with_owner(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_session_with_owner(uuid, uuid, uuid) TO monkey_app;
