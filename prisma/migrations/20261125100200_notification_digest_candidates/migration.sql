-- MD-515 · A quién le toca hoy el resumen por correo. SQL a mano. ADITIVA: una función nueva.
--
-- Los avisos son por persona (RLS), así que la tarea, que no es ninguna persona, no puede contarlos. Esta función `SECURITY DEFINER`, angosta y con `search_path` fijo, devuelve SOLO los
-- ids (empresa y persona) de las cuentas activas de una empresa no archivada, con el resumen encendido, con algún aviso sin leer que no entró en un resumen y sin un resumen de hoy que ya
-- salió, se está enviando o agotó sus 3 intentos. Con cada id, la tarea abre la transacción COMO esa persona y lee lo suyo con RLS normal.
CREATE OR REPLACE FUNCTION platform.list_digest_candidates(p_today date)
RETURNS TABLE (company_id uuid, user_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT DISTINCT u.company_id, u.id
    FROM platform.users u
    JOIN platform.companies c ON c.id = u.company_id AND c.status <> 'deactivated'
   WHERE u.status = 'active'
     AND u.is_email_digest_enabled
     AND EXISTS (SELECT 1 FROM platform.notifications n
                  WHERE n.user_id = u.id AND n.read_at IS NULL AND n.emailed_at IS NULL AND n.created_at > (now() - interval '90 days'))
     AND NOT EXISTS (SELECT 1 FROM platform.notification_digests d
                      WHERE d.user_id = u.id AND d.digest_date = p_today
                        AND (d.status IN ('sent', 'skipped') OR d.attempts >= 3 OR (d.status = 'sending' AND d.updated_at > (now() - interval '15 minutes'))))
   ORDER BY u.company_id, u.id;
$$;

REVOKE ALL ON FUNCTION platform.list_digest_candidates(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.list_digest_candidates(date) TO monkey_app;
