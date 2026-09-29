-- 1. RLS en platform, salvo companies -----------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'custom_roles', 'sessions', 'api_keys', 'user_control_assignments'
  ] LOOP
    EXECUTE format('ALTER TABLE platform.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE platform.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON platform.%I
        USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- 2. auditor_assignments: caso especial ----------------------------------
-- El auditor necesita ver SUS asignaciones sin importar qué tenant esté
-- activo en la sesión (audita varias empresas). La empresa auditada
-- necesita ver quién la está auditando. Por eso la política lee dos
-- variables de sesión, no una.
ALTER TABLE platform.auditor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.auditor_assignments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_self ON platform.auditor_assignments
  USING (
    company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR auditor_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  )
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 3. La única puerta sin RLS: la consulta de login -----------------------
-- SECURITY DEFINER: se ejecuta con los privilegios de quien la creó
-- (el rol dueño de las tablas, con el que se corren las migraciones), no
-- con los de monkey_app. Por eso ignora RLS, pero SOLO dentro de esta
-- función, y solo devuelve las columnas que un login necesita.
CREATE OR REPLACE FUNCTION platform.find_login_candidates(p_email text)
RETURNS TABLE (
  id             uuid,
  company_id     uuid,
  password_hash  text,
  role           platform."UserRole",
  status         platform."UserStatus",
  is_mfa_enabled boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, password_hash, role, status, is_mfa_enabled
  FROM platform.users
  WHERE email = p_email;
$$;

REVOKE ALL ON FUNCTION platform.find_login_candidates(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_login_candidates(text) TO monkey_app;