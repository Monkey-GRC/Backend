-- SQL escrito a mano (Prisma no modela RLS, funciones ni CHECK). Va aparte de la migración de
-- schema anterior a propósito: aquí se asume que ya existen client_risks, mitigations.client_*_id,
-- etc. (ver modelo-datos.md §4.4 y las decisiones D27 a D31).
--
-- Variables de sesión que la app fija por transacción con set_config(..., true):
--   app.tenant_id  empresa activa        app.user_id    usuario que actúa
--   app.user_role  rol (admin_monkey…)

-- 1. CHECK que Prisma no expresa ----------------------------------------------------------
-- El email se busca por igualdad exacta en el login: siempre en minúsculas.
ALTER TABLE platform.users
  ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email));

-- Una mitigación responde a una causa O a un riesgo, nunca a ninguno ni a los dos.
ALTER TABLE tenant.mitigations
  ADD CONSTRAINT mitigations_exactly_one_target
  CHECK (num_nonnulls(client_cause_id, client_risk_id) = 1);

-- 2. RLS en las tablas nuevas de tenant (riesgos y causas del cliente, D28) -----------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'client_risks', 'client_causes', 'client_risk_causes', 'client_cause_controls'
  ] LOOP
    EXECUTE format('ALTER TABLE tenant.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE tenant.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON tenant.%I
        USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- 3. catalog: todos leen, solo admin_monkey escribe (D31) ----------------------------------
-- Antes el rol de la app tenía INSERT/UPDATE/DELETE sobre todo el catálogo global: un fallo en
-- un endpoint de cliente alcanzaba a todos los demás. Sin FORCE: el rol dueño (seeds, migraciones)
-- sigue pasando. Toda tabla NUEVA de catalog debe repetir estas cuatro políticas.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'catalog' LOOP
    EXECUTE format('ALTER TABLE catalog.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY catalog_read ON catalog.%I FOR SELECT USING (true)', t);
    EXECUTE format($p$
      CREATE POLICY catalog_insert_admin ON catalog.%I FOR INSERT
        WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
    EXECUTE format($p$
      CREATE POLICY catalog_update_admin ON catalog.%I FOR UPDATE
        USING (current_setting('app.user_role', true) = 'admin_monkey')
        WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
    EXECUTE format($p$
      CREATE POLICY catalog_delete_admin ON catalog.%I FOR DELETE
        USING (current_setting('app.user_role', true) = 'admin_monkey')
    $p$, t);
  END LOOP;
END $$;

-- 4. companies y access_keys: su tenant o admin_monkey (D31) --------------------------------
ALTER TABLE platform.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.companies FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_admin ON platform.companies
  USING (
    id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  )
  WITH CHECK (
    id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );

ALTER TABLE platform.access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.access_keys FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_admin ON platform.access_keys
  USING (
    company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  )
  WITH CHECK (
    company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );

-- 5. audit_logs: separar lectura y escritura ------------------------------------------------
-- Con una sola política, una acción de plataforma (tenant_id NULL) se podía insertar pero nadie
-- la podía leer, y un INSERT ... RETURNING fallaba porque la fila nueva no pasaba el USING.
-- Ahora: se lee lo del propio tenant (o todo, si es admin_monkey) y se inserta sin tenant o en
-- el propio. La app escribe audit_logs SIN RETURNING (createMany / SQL directo).
DROP POLICY tenant_isolation ON audit.audit_logs;
CREATE POLICY audit_read ON audit.audit_logs FOR SELECT
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );
CREATE POLICY audit_insert ON audit.audit_logs FOR INSERT
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );

-- 6. evaluations inmutable de verdad (D27) --------------------------------------------------
-- Solo el cierre humano (§7.5) puede tocar una evaluación ya escrita; nada se borra.
REVOKE UPDATE, DELETE, TRUNCATE ON tenant.evaluations FROM monkey_app;
GRANT UPDATE (confirmed_by, closure_observation_reason) ON tenant.evaluations TO monkey_app;

-- 7. Búsquedas previas al tenant (D29) ------------------------------------------------------
-- RLS falla cerrado y estas cuatro búsquedas ocurren antes de saber la empresa. Cada una es una
-- función SECURITY DEFINER angosta: corre con los privilegios de su dueño (superusuario o rol con
-- BYPASSRLS, el que migra) SOLO dentro de la función y devuelve únicamente lo que necesita. Con
-- el company_id devuelto, la app fija app.tenant_id y sigue con RLS normal.
DROP FUNCTION IF EXISTS platform.find_login_candidates(text);

CREATE FUNCTION platform.find_login_candidates(p_email text)
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
  SELECT id, company_id, password_hash, role, status, is_mfa_enabled,
         failed_login_attempts, locked_until, password_changed_at
  FROM platform.users
  WHERE email = lower(p_email);
$$;

CREATE FUNCTION platform.find_access_key(p_code_hash text)
RETURNS TABLE (
  id         uuid,
  company_id uuid,
  status     platform.access_key_status,
  expires_at timestamp,
  used_at    timestamp
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, status, expires_at, used_at
  FROM platform.access_keys
  WHERE code_hash = p_code_hash;
$$;

CREATE FUNCTION platform.find_session_by_token(p_refresh_token_hash text)
RETURNS TABLE (
  id         uuid,
  company_id uuid,
  user_id    uuid,
  expires_at timestamp,
  revoked_at timestamp
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, user_id, expires_at, revoked_at
  FROM platform.sessions
  WHERE refresh_token_hash = p_refresh_token_hash;
$$;

CREATE FUNCTION platform.find_api_key(p_key_hash text)
RETURNS TABLE (
  id              uuid,
  company_id      uuid,
  status          platform.api_key_status,
  last_rotated_at timestamp
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, status, last_rotated_at
  FROM platform.api_keys
  WHERE key_hash = p_key_hash;
$$;

REVOKE ALL ON FUNCTION platform.find_login_candidates(text)   FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.find_access_key(text)         FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.find_session_by_token(text)   FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.find_api_key(text)            FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_login_candidates(text)   TO monkey_app;
GRANT EXECUTE ON FUNCTION platform.find_access_key(text)         TO monkey_app;
GRANT EXECUTE ON FUNCTION platform.find_session_by_token(text)   TO monkey_app;
GRANT EXECUTE ON FUNCTION platform.find_api_key(text)            TO monkey_app;
