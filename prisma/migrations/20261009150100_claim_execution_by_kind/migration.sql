-- D58: el trabajador reclama por CARRIL. Una validación (el cliente espera en pantalla) y una evaluación (minutos) no deben hacerse esperar entre sí:
-- el trabajador corre un bucle por tipo y cada uno pide solo el suyo. Sin tipo, reclama de cualquiera (compatibilidad). Una validación se atiende
-- antes que una evaluación cuando se pide sin tipo.
--
-- Los plazos dependen del tipo: una evaluación «en curso» se da por perdida a los 30 min; una validación, a los 2 min, y una validación que nadie
-- reclamó en 2 min se cancela (el cliente ya recibió un «no disponible»; dejarla abierta bloquearía el activo por el índice único de abiertas).
-- Misma seguridad que antes (SEG-47): SECURITY DEFINER angosta, search_path fijo, solo la ejecuta la app.
DROP FUNCTION tenant.claim_next_execution();

CREATE FUNCTION tenant.claim_next_execution(p_kind tenant.execution_kind DEFAULT NULL)
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

REVOKE ALL ON FUNCTION tenant.claim_next_execution(tenant.execution_kind) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.claim_next_execution(tenant.execution_kind) TO monkey_app;
