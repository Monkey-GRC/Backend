-- DT-105: grupos de trabajadores. Los backends locales comparten la base de desarrollo con el servidor y su trabajador se llevaba las ejecuciones ajenas.
-- Cada ejecución lleva el grupo del backend que la creó y cada trabajador reclama solo el suyo. Aditiva: las filas existentes quedan en 'default'.
-- El barrido de lo vencido (en curso y validaciones sin reclamar) sigue siendo global: un grupo sin trabajador no deja ejecuciones colgadas.
ALTER TABLE tenant.executions ADD COLUMN runner_pool text NOT NULL DEFAULT 'default';

DROP FUNCTION tenant.claim_next_execution(tenant.execution_kind);

CREATE FUNCTION tenant.claim_next_execution(p_kind tenant.execution_kind DEFAULT NULL, p_pool text DEFAULT 'default')
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
   WHERE e.status = 'queued' AND e.runner_pool = p_pool AND (p_kind IS NULL OR e.kind = p_kind)
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

REVOKE ALL ON FUNCTION tenant.claim_next_execution(tenant.execution_kind, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.claim_next_execution(tenant.execution_kind, text) TO monkey_app;
