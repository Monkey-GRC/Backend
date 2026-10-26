-- RLS de los desafíos y los códigos de recuperación del segundo factor (D94). SQL a mano, aparte del cambio de schema. Mismo patrón que las demás tablas de platform.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mfa_challenges', 'user_recovery_codes'] LOOP
    EXECUTE format('ALTER TABLE platform.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE platform.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON platform.%I
        USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- La única puerta sin RLS: el desafío llega por su token, antes de conocer el tenant (igual que find_session_by_token). SECURITY DEFINER y angosta:
-- solo devuelve qué desafío es y de quién; todo lo demás se lee ya con RLS.
CREATE FUNCTION platform.find_mfa_challenge(p_token_hash text)
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
  FROM platform.mfa_challenges
  WHERE token_hash = p_token_hash;
$$;

REVOKE ALL ON FUNCTION platform.find_mfa_challenge(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_mfa_challenge(text) TO monkey_app;