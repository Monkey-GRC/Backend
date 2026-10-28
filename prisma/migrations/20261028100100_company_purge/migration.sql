-- D95 · Archivar una empresa y borrarla definitivamente (enmienda D41).
--
-- Cuatro piezas, todas dentro de la base para que no dependan de que la app se porte bien:
--
--   1. Una empresa archivada no puede entrar: el ingreso la ve como «inactiva» y su sesión de renovación no sirve.
--   2. Una empresa archivada no se evalúa: el trabajador no reclama sus ejecuciones.
--   3. `platform.export_company`: la copia de la empresa que se toma justo antes de archivarla.
--   4. `platform.purge_company`: el borrado definitivo. Es la ÚNICA forma de borrar filas inmutables (auditoría, evaluaciones,
--      valoraciones), y solo si la empresa está archivada con el plazo vencido. Los triggers de inmutabilidad dejan pasar el
--      DELETE únicamente a quien corre como dueño de esa función con la purga en curso: la app (`monkey_app`) no puede, ni siquiera
--      fijando la variable. El resto de las filas inmutables de las demás empresas sigue protegido para todos los roles.
--
-- Solo SQL (sin cambios de schema de Prisma), según la convención de no mezclarlos en una misma migración.

-- 1. Ingreso y renovación de la sesión ---------------------------------------------------------------------------------------
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

CREATE OR REPLACE FUNCTION platform.find_session_by_token(p_refresh_token_hash text)
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
  SELECT s.id, s.company_id, s.user_id, s.expires_at,
         CASE WHEN c.status = 'deactivated' THEN COALESCE(s.revoked_at, (now() AT TIME ZONE 'utc')) ELSE s.revoked_at END
  FROM platform.sessions s
  JOIN platform.companies c ON c.id = s.company_id
  WHERE s.refresh_token_hash = p_refresh_token_hash;
$$;

-- 2. El trabajador no reclama ejecuciones de una empresa archivada ----------------------------------------------------------
CREATE OR REPLACE FUNCTION tenant.claim_next_execution(p_kind tenant.execution_kind DEFAULT NULL)
RETURNS TABLE (
  out_execution_id uuid,
  out_tenant_id    uuid,
  out_asset_id     uuid,
  out_origin       tenant.execution_origin,
  out_kind         tenant.execution_kind
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tenant, pg_temp
AS $$
DECLARE
  v_id  uuid;
  v_row tenant.executions%ROWTYPE;
  v_now timestamp := (now() AT TIME ZONE 'utc');
BEGIN
  WITH swept AS (
    UPDATE tenant.executions
       SET status = 'failed', finished_at = v_now, failure_reason = 'execution.timed_out'
     WHERE status = 'running'
       AND ((kind = 'assessment' AND started_at < v_now - interval '30 minutes')
         OR (kind = 'validation' AND started_at < v_now - interval '2 minutes'))
    RETURNING id, tenant_id
  )
  INSERT INTO tenant.execution_logs (id, tenant_id, execution_id, logged_at, level, message)
  SELECT gen_random_uuid(), tenant_id, id, v_now, 'error', 'execution.timed_out' FROM swept;

  UPDATE tenant.executions
     SET status = 'cancelled', finished_at = v_now, failure_reason = 'execution.timed_out'
   WHERE status = 'queued' AND kind = 'validation' AND queued_at < v_now - interval '2 minutes';

  SELECT e.id INTO v_id
    FROM tenant.executions e
   WHERE e.status = 'queued' AND (p_kind IS NULL OR e.kind = p_kind)
     AND NOT EXISTS (SELECT 1 FROM platform.companies c WHERE c.id = e.tenant_id AND c.status = 'deactivated')
   ORDER BY (e.kind = 'validation') DESC, e.queued_at, e.id
   LIMIT 1
   FOR UPDATE SKIP LOCKED;
  IF v_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE tenant.executions SET status = 'running', started_at = v_now
   WHERE id = v_id
  RETURNING * INTO v_row;

  out_execution_id := v_row.id;
  out_tenant_id    := v_row.tenant_id;
  out_asset_id     := v_row.asset_id;
  out_origin       := v_row.origin;
  out_kind         := v_row.kind;
  RETURN NEXT;
END;
$$;

-- 3. La copia de la empresa antes de archivarla -----------------------------------------------------------------------------
-- Todas las tablas con `tenant_id` o `company_id` (se descubren, no se listan: una tabla nueva entra sola) más la fila de la empresa.
CREATE OR REPLACE FUNCTION platform.export_company(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_result jsonb;
  r        record;
  v_rows   jsonb;
BEGIN
  IF COALESCE(current_setting('app.user_role', true), '') <> 'admin_monkey' THEN
    RAISE EXCEPTION 'platform.export_company solo la ejecuta admin_monkey' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT jsonb_build_object('company', to_jsonb(c)) INTO v_result FROM platform.companies c WHERE c.id = p_company_id;
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'company.not_found' USING ERRCODE = 'P0002';
  END IF;

  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name, a.attname AS column_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid
     WHERE c.relkind = 'r' AND n.nspname IN ('platform', 'tenant', 'audit')
       AND a.attname IN ('tenant_id', 'company_id') AND NOT a.attisdropped
       AND NOT (n.nspname = 'platform' AND c.relname = 'companies')
     ORDER BY n.nspname, c.relname
  LOOP
    EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM %I.%I t WHERE t.%I = $1', r.schema_name, r.table_name, r.column_name)
      INTO v_rows USING p_company_id;
    v_result := v_result || jsonb_build_object(r.schema_name || '.' || r.table_name, v_rows);
  END LOOP;
  RETURN v_result;
END;
$$;

-- 4. El borrado definitivo --------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION platform.purge_company(p_company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_company platform.companies%ROWTYPE;
  v_pending text[];
  v_next    text[];
  v_item    text;
  v_parts   text[];
  v_done    boolean;
BEGIN
  SELECT * INTO v_company FROM platform.companies WHERE id = p_company_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'company.not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_company.status <> 'deactivated' OR v_company.archive_until IS NULL OR v_company.archive_until > (now() AT TIME ZONE 'utc') THEN
    RAISE EXCEPTION 'company.purge_not_due' USING ERRCODE = 'check_violation',
      HINT = 'Solo se borra una empresa archivada cuyo plazo ya venció.';
  END IF;

  -- Desde aquí y solo en esta transacción, los triggers de inmutabilidad dejan pasar el DELETE de quien corre como dueño de esta función.
  PERFORM set_config('monkey.purging_company', p_company_id::text, true);

  -- El rastro suelto de la empresa: eventos sin empresa (tenant_id nulo) que hablan de ella o de su gente.
  DELETE FROM audit.audit_logs
   WHERE tenant_id = p_company_id
      OR after_state ->> 'company_id' = p_company_id::text
      OR user_id IN (SELECT u.id FROM platform.users u WHERE u.company_id = p_company_id)
      OR lower(attempted_email) IN (SELECT lower(u.email) FROM platform.users u WHERE u.company_id = p_company_id UNION SELECT lower(v_company.admin_email));
  DELETE FROM audit.compliance_events
   WHERE tenant_id = p_company_id
      OR user_id IN (SELECT u.id FROM platform.users u WHERE u.company_id = p_company_id);

  -- Todo lo demás: toda tabla con `tenant_id` o `company_id`. Se borra en el orden que permitan las claves foráneas: lo que aún
  -- tiene hijos se reintenta en la pasada siguiente. Si una pasada no avanza, algo cuelga de fuera de la empresa y se aborta todo.
  SELECT array_agg(n.nspname || '.' || c.relname || '.' || a.attname ORDER BY n.nspname, c.relname)
    INTO v_pending
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
   WHERE c.relkind = 'r' AND n.nspname IN ('platform', 'tenant', 'audit')
     AND a.attname IN ('tenant_id', 'company_id') AND NOT a.attisdropped
     AND NOT (n.nspname = 'platform' AND c.relname = 'companies');

  WHILE COALESCE(array_length(v_pending, 1), 0) > 0 LOOP
    v_next := ARRAY[]::text[];
    v_done := false;
    FOREACH v_item IN ARRAY v_pending LOOP
      v_parts := string_to_array(v_item, '.');
      BEGIN
        EXECUTE format('DELETE FROM %I.%I WHERE %I = $1', v_parts[1], v_parts[2], v_parts[3]) USING p_company_id;
        v_done := true;
      EXCEPTION WHEN foreign_key_violation THEN
        v_next := v_next || v_item;
      END;
    END LOOP;
    IF NOT v_done THEN
      RAISE EXCEPTION 'company.purge_blocked: no se pudo borrar %', v_next USING ERRCODE = 'foreign_key_violation';
    END IF;
    v_pending := v_next;
  END LOOP;

  DELETE FROM platform.companies WHERE id = p_company_id;
  INSERT INTO platform.company_purge_log (id, company_id, company_name, archived_by, archived_at)
  VALUES (gen_random_uuid(), p_company_id, v_company.name, v_company.deactivated_by, v_company.deactivated_at);
  RETURN v_company.name;
END;
$$;

-- ¿Hay una purga en curso, y la corre el dueño de `platform.purge_company`? `current_user` dentro de una función SECURITY DEFINER es su dueño;
-- para `monkey_app` es siempre `monkey_app`, así que fijar la variable por su cuenta no abre nada.
CREATE OR REPLACE FUNCTION platform.purge_in_progress() RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = pg_catalog
AS $$
BEGIN
  RETURN COALESCE(current_setting('monkey.purging_company', true), '') <> ''
     AND current_user = (SELECT pg_get_userbyid(p.proowner) FROM pg_proc p WHERE p.oid = 'platform.purge_company(uuid)'::regprocedure);
END;
$$;

-- Los tres triggers de inmutabilidad dejan pasar el DELETE de la purga; todo lo demás sigue rechazado.
CREATE OR REPLACE FUNCTION audit.reject_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'audit.% es append-only: % no está permitido (el audit trail es inmutable)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Una fila de auditoría no se edita ni se borra; si hubo un error se agrega una fila nueva que lo corrija.';
END;
$$;

CREATE OR REPLACE FUNCTION tenant.reject_evaluation_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'confirmed_by' - 'closure_observation_reason')
         IS NOT DISTINCT FROM (to_jsonb(OLD) - 'confirmed_by' - 'closure_observation_reason') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (solo el cierre humano puede completar confirmed_by y closure_observation_reason)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Una evaluación no se edita ni se borra; si cambia lo medido se agrega una evaluación nueva.';
END;
$$;

CREATE OR REPLACE FUNCTION tenant.reject_assessment_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (una evaluación emitida no se edita ni se borra)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Para cambiar de opinión se emite una evaluación nueva; la vigente es la última de ese rol.';
END;
$$;

-- Solo la app las ejecuta; las condiciones de cada una (admin_monkey, plazo vencido) se comprueban dentro.
REVOKE ALL ON FUNCTION platform.export_company(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.purge_company(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.purge_in_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.export_company(uuid) TO monkey_app;
GRANT EXECUTE ON FUNCTION platform.purge_company(uuid) TO monkey_app;
GRANT EXECUTE ON FUNCTION platform.purge_in_progress() TO monkey_app;
