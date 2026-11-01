-- RLS del historial de contraseñas y de los enlaces de recuperación (D101). SQL a mano, aparte del cambio de schema. Mismo patrón que las demás tablas de platform.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['password_history', 'password_reset_tokens'] LOOP
    EXECUTE format('ALTER TABLE platform.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE platform.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON platform.%I
        USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- La única puerta sin RLS: el enlace llega solo con su token, antes de conocer el tenant (igual que find_mfa_challenge). SECURITY DEFINER y angosta:
-- solo dice qué enlace es y de quién; todo lo demás se lee ya con RLS.
CREATE FUNCTION platform.find_password_reset_token(p_token_hash text)
RETURNS TABLE (
  id         uuid,
  company_id uuid,
  user_id    uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, user_id
  FROM platform.password_reset_tokens
  WHERE token_hash = p_token_hash;
$$;

REVOKE ALL ON FUNCTION platform.find_password_reset_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_password_reset_token(text) TO monkey_app;
