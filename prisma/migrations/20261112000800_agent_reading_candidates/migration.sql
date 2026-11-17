-- La lectura automática de la sonda de un servidor (D113). Aditiva: solo agrega una función de lectura.
--
-- El planificador necesita ver los servidores de TODAS las empresas para saber a cuáles les toca una lectura. Ninguna política de RLS lo permite (con razón: es el aislamiento entre
-- empresas), así que, igual que `claim_next_execution` (SEG-47), lo hace una función SECURITY DEFINER angosta: solo LEE, solo devuelve los datos mínimos para decidir (identificadores,
-- estado y fechas; ningún nombre, ninguna clave) y nunca escribe. La decisión de a cuáles les toca la toma el backend (`reading-plan.ts`); esta función solo descarta lo que ya
-- se sabe que NO puede tocar, para no devolver miles de servidores conectados en cada pasada.
CREATE OR REPLACE FUNCTION tenant.list_agent_reading_candidates(p_window_seconds integer, p_refresh_seconds integer, p_limit integer DEFAULT 5000)
RETURNS TABLE (
  out_tenant_id   uuid,
  out_asset_id    uuid,
  out_status      text,
  out_last_sync   timestamp,
  out_enrolled_at timestamp,
  out_last_status text,
  out_last_at     timestamp
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = tenant, pg_temp
AS $$
  SELECT a.tenant_id,
         a.asset_id,
         a.status::text,
         a.last_sync_at,
         en.enrolled_at,
         l.status::text,
         COALESCE(l.finished_at, l.started_at, l.queued_at)
    FROM tenant.asset_agents a
    JOIN tenant.assets s ON s.id = a.asset_id AND s.status = 'active' AND s.parent_asset_id IS NULL
    -- Cuándo terminó Monkey de crear el agente: desde ahí corre el plazo de búsqueda.
    LEFT JOIN LATERAL (
      SELECT max(x.finished_at) AS enrolled_at
        FROM tenant.executions x
       WHERE x.asset_id = a.asset_id AND x.kind = 'enrollment' AND x.status = 'completed'
    ) en ON true
    -- El último intento de lectura (el que sea): decide cuánto hay que esperar para el siguiente.
    LEFT JOIN LATERAL (
      SELECT e.status, e.finished_at, e.started_at, e.queued_at
        FROM tenant.executions e
       WHERE e.asset_id = a.asset_id AND e.kind = 'assessment'
       ORDER BY e.queued_at DESC
       LIMIT 1
    ) l ON true
   WHERE a.agent_id IS NOT NULL
     AND a.status <> 'removed'
     -- Un servidor con una lectura abierta no necesita otra (y el índice único no la dejaría).
     AND NOT EXISTS (SELECT 1 FROM tenant.executions o WHERE o.asset_id = a.asset_id AND o.status IN ('queued', 'running'))
     -- Empresa archivada: no se le lee nada (igual que el reclamo).
     AND NOT EXISTS (SELECT 1 FROM platform.companies c WHERE c.id = a.tenant_id AND c.status = 'deactivated')
     AND (
       -- Aún no se conecta: solo mientras dure el plazo de búsqueda.
       (a.status = 'pending' AND en.enrolled_at IS NOT NULL AND en.enrolled_at > (now() AT TIME ZONE 'utc') - make_interval(secs => p_window_seconds))
       -- Desconectado: se reintenta sin plazo.
       OR a.status = 'disconnected'
       -- Conectado: solo cuando ya toca releer.
       OR (a.status = 'connected' AND (a.last_sync_at IS NULL OR a.last_sync_at <= (now() AT TIME ZONE 'utc') - make_interval(secs => p_refresh_seconds)))
     )
   ORDER BY a.last_sync_at NULLS FIRST, a.asset_id
   LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION tenant.list_agent_reading_candidates(integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.list_agent_reading_candidates(integer, integer, integer) TO monkey_app;
