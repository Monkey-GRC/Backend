-- MD-515, D151 · La retención de 90 días. SQL a mano. ADITIVA: una función nueva.
--
-- Los avisos son por persona (RLS) y ninguna política deja borrar: la pasada diaria, que no es ninguna persona, llama a esta función `SECURITY DEFINER`, angosta y con `search_path` fijo.
-- Borra SOLO los avisos de más de 90 días de UNA empresa y devuelve cuántos; no lee ni devuelve su contenido.
CREATE OR REPLACE FUNCTION platform.purge_expired_notifications(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM platform.notifications WHERE company_id = p_company_id AND created_at < (now() - interval '90 days');
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION platform.purge_expired_notifications(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.purge_expired_notifications(uuid) TO monkey_app;

-- La purga de una cuenta `admin_monkey` (D117): ninguna clave foránea hacia `users` borra en cascada, así que se llevan sus avisos y resúmenes a mano. Solo borra lo de ESA persona.
CREATE OR REPLACE FUNCTION platform.purge_user_notifications(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  DELETE FROM platform.notifications WHERE user_id = p_user_id;
  DELETE FROM platform.notification_digests WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION platform.purge_user_notifications(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.purge_user_notifications(uuid) TO monkey_app;
