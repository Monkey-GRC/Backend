-- Reconcilia el reclamo del trabajador tras fusionar dos cambios que redefinen la MISMA función.
-- 20261112000700_agent_enrollment (D112) enseñó a `claim_next_execution` el tipo `enrollment` (crear el agente de un servidor: lo espera un cliente en pantalla, así que
-- caduca a los 2 minutos y pasa por delante de las evaluaciones). Después, 20261113000100_runner_pool (grupos de trabajadores, DT-105) y 20261113000200 recrearon la función
-- partiendo de la versión anterior y perdieron ese tratamiento. Aquí queda la suma de todo: grupo de trabajadores + filtro de empresas desactivadas + `enrollment`.
-- Misma firma que la de 20261113000200; solo cambia el cuerpo.
CREATE OR REPLACE FUNCTION tenant.claim_next_execution(p_kind tenant.execution_kind DEFAULT NULL, p_pool text DEFAULT 'default')
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
         OR (kind IN ('validation', 'enrollment') AND started_at < v_now - interval '2 minutes'))
    RETURNING id, tenant_id
  )
  INSERT INTO tenant.execution_logs (id, tenant_id, execution_id, logged_at, level, message)
  SELECT gen_random_uuid(), tenant_id, id, v_now, 'error', 'execution.timed_out' FROM swept;

  UPDATE tenant.executions
     SET status = 'cancelled', finished_at = v_now, failure_reason = 'execution.timed_out'
   WHERE status = 'queued' AND kind IN ('validation', 'enrollment') AND queued_at < v_now - interval '2 minutes';

  SELECT e.id INTO v_id
    FROM tenant.executions e
   WHERE e.status = 'queued' AND e.runner_pool = p_pool AND (p_kind IS NULL OR e.kind = p_kind)
     AND NOT EXISTS (SELECT 1 FROM platform.companies c WHERE c.id = e.tenant_id AND c.status = 'deactivated')
   ORDER BY (e.kind IN ('validation', 'enrollment')) DESC, e.queued_at, e.id
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
