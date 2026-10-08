-- Un activo no puede tener dos ejecuciones abiertas (en cola o en curso) a la vez. Lo impone la base, no una comprobación previa en la app:
-- con dos «evaluar ahora» simultáneos, una comprobación + inserción dejaría pasar las dos.
CREATE UNIQUE INDEX executions_one_open_per_asset ON tenant.executions (asset_id) WHERE status IN ('queued', 'running');

-- D57, SEG-47: el trabajador reclama la próxima ejecución en cola de CUALQUIER empresa. RLS impide justo eso por diseño, así que se hace con una
-- función SECURITY DEFINER angosta (mismo patrón que las búsquedas previas al tenant, SEG-08): solo cambia el estado de UNA ejecución y
-- devuelve lo mínimo para que la app abra la transacción con su empresa. El resto (el activo, la conexión) se lee ya bajo RLS normal.
--
-- Además barre las corridas que llevan más de 30 minutos «en curso» (el trabajador murió): pasan a `failed` con `execution.timed_out`.
-- Un fallo de ejecución es un problema de conexión, no un incumplimiento (§8): no mueve la preparación.
CREATE FUNCTION tenant.claim_next_execution()
RETURNS TABLE (
  out_execution_id uuid,
  out_tenant_id    uuid,
  out_asset_id     uuid,
  out_origin       tenant.execution_origin
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tenant, pg_temp
AS $$
DECLARE
  v_id  uuid;
  v_row tenant.executions%ROWTYPE;
BEGIN
  WITH swept AS (
    UPDATE tenant.executions
       SET status = 'failed', finished_at = (now() AT TIME ZONE 'utc'), failure_reason = 'execution.timed_out'
     WHERE status = 'running' AND started_at < (now() AT TIME ZONE 'utc') - interval '30 minutes'
    RETURNING id, tenant_id
  )
  INSERT INTO tenant.execution_logs (id, tenant_id, execution_id, logged_at, level, message)
  SELECT gen_random_uuid(), tenant_id, id, (now() AT TIME ZONE 'utc'), 'error', 'execution.timed_out' FROM swept;

  SELECT e.id INTO v_id
    FROM tenant.executions e
   WHERE e.status = 'queued'
   ORDER BY e.queued_at, e.id
   LIMIT 1
   FOR UPDATE SKIP LOCKED;
  IF v_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE tenant.executions SET status = 'running', started_at = (now() AT TIME ZONE 'utc')
   WHERE id = v_id
  RETURNING * INTO v_row;

  out_execution_id := v_row.id;
  out_tenant_id    := v_row.tenant_id;
  out_asset_id     := v_row.asset_id;
  out_origin       := v_row.origin;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION tenant.claim_next_execution() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.claim_next_execution() TO monkey_app;
