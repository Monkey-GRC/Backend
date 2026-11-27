-- D158: la nube se evalúa sola con la frecuencia elegida. Aditiva: una función de lectura nueva y un criterio más en el orden de la cola; no cambia datos ni permisos de tablas.
--
-- La tarea necesita ver las conexiones de TODAS las empresas para saber cuáles vencieron. Ninguna política de RLS lo permite (es el aislamiento entre empresas), así que, como en
-- `claim_next_execution` (SEG-47), lo hace una función SECURITY DEFINER angosta: solo LEE y solo devuelve dos identificadores. Crear la ejecución lo hace después el Backend, ya dentro
-- del alcance de esa empresa.
CREATE OR REPLACE FUNCTION tenant.list_due_cloud_assessments(p_pool text, p_max_waiting integer DEFAULT 2, p_retry_seconds integer DEFAULT 3600)
RETURNS TABLE (
  out_tenant_id uuid,
  out_asset_id  uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = tenant, pg_temp
AS $$
  WITH clock AS (SELECT (now() AT TIME ZONE 'utc') AS utc),
  -- Lo programado de nube que ya espera en este grupo: el cupo que queda es lo único que se puede encolar.
  waiting AS (
    SELECT count(*)::int AS n
      FROM tenant.executions q
      JOIN tenant.asset_provisionings qp ON qp.asset_id = q.asset_id
     WHERE q.status = 'queued' AND q.kind = 'assessment' AND q.origin = 'scheduled' AND q.runner_pool = p_pool
       AND qp.connection_method IS DISTINCT FROM 'agent'
  )
  SELECT p.tenant_id, p.asset_id
    FROM tenant.asset_provisionings p
    CROSS JOIN clock
    JOIN tenant.assets a ON a.id = p.asset_id AND a.status = 'active' AND a.parent_asset_id IS NULL
    -- La última evaluación (manual o programada) y la anterior a ella: de ahí salen el vencimiento y el único reintento.
    LEFT JOIN LATERAL (
      SELECT x.status, x.queued_at, x.rn,
             lead(x.status) OVER (ORDER BY x.rn) AS previous_status
        FROM (SELECT e.status, e.queued_at, row_number() OVER (ORDER BY e.queued_at DESC, e.id) AS rn
                FROM tenant.executions e
               WHERE e.asset_id = p.asset_id AND e.kind = 'assessment'
               ORDER BY e.queued_at DESC, e.id
               LIMIT 2) x
       ORDER BY x.rn
       LIMIT 1
    ) last ON true
   WHERE p.is_active
     AND p.connection_status = 'scheduled'
     AND p.schedule_frequency IN ('every_6h', 'every_24h')
     AND p.connection_method IS NOT NULL AND p.connection_method <> 'agent'
     AND NOT EXISTS (SELECT 1 FROM tenant.executions o WHERE o.asset_id = p.asset_id AND o.status IN ('queued', 'running'))
     AND NOT EXISTS (SELECT 1 FROM platform.companies c WHERE c.id = p.tenant_id AND c.status = 'deactivated')
     AND (
       last.queued_at IS NULL
       OR last.queued_at <= clock.utc - (CASE p.schedule_frequency WHEN 'every_6h' THEN interval '6 hours' ELSE interval '24 hours' END)
       -- Falló: un solo reintento. Si la anterior también había fallado, se espera la frecuencia completa.
       OR (last.status = 'failed' AND last.previous_status IS DISTINCT FROM 'failed' AND last.queued_at <= clock.utc - make_interval(secs => p_retry_seconds))
     )
   ORDER BY last.queued_at NULLS FIRST, p.asset_id
   LIMIT greatest(p_max_waiting - (SELECT n FROM waiting), 0);
$$;

REVOKE ALL ON FUNCTION tenant.list_due_cloud_assessments(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.list_due_cloud_assessments(text, integer, integer) TO monkey_app;

-- En la cola, lo que pidió una persona va delante de lo programado (después de las validaciones). El resto del reclamo es igual.
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
   ORDER BY (e.kind IN ('validation', 'enrollment')) DESC,
            (e.origin = 'manual') DESC,
            (SELECT count(*) FROM tenant.executions r WHERE r.tenant_id = e.tenant_id AND r.status = 'running'),
            e.queued_at, e.id
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
