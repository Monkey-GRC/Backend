-- D123 · Cerrar sesión olvida SIEMPRE el dispositivo de la cookie `mnk_device`, también sin sesión (venció, o ya no hay cookie de sesión). Sin sesión no se conoce el tenant: esta es la única
-- puerta sin RLS, como `find_mfa_challenge`. SECURITY DEFINER y angosta: solo dice qué dispositivo vigente es y de quién; todo lo demás se hace ya con RLS.
-- Reversa: DROP FUNCTION platform.find_trusted_device(text).
CREATE FUNCTION platform.find_trusted_device(p_token_hash text)
RETURNS TABLE (
  id         uuid,
  company_id uuid,
  user_id    uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT d.id, d.company_id, d.user_id
  FROM platform.trusted_devices d
  WHERE d.token_hash = p_token_hash
    AND d.revoked_at IS NULL
    AND d.expires_at > (now() AT TIME ZONE 'utc');
$$;

REVOKE ALL ON FUNCTION platform.find_trusted_device(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_trusted_device(text) TO monkey_app;
