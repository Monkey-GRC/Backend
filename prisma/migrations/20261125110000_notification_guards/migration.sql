-- MD-515, SEG-87 · SQL a mano. ADITIVA: dos funciones nuevas (una reemplaza a otra de la misma migración 20261125100300, sin cambiar su firma) y un trigger de inserción. No toca filas existentes.

-- 1. `purge_user_notifications` ya no borra los avisos de cualquier persona: solo actúa si la cuenta es un `admin_monkey` inactivo (la purga programada de D117, que la deja inactiva hasta borrarla)
--    o si la corre el dueño de `platform.purge_company` con la purga en curso. Una sesión de la app no puede vaciar con ella la campana de otra persona.
CREATE OR REPLACE FUNCTION platform.purge_user_notifications(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT platform.purge_in_progress()
     AND NOT EXISTS (SELECT 1 FROM platform.users u WHERE u.id = p_user_id AND u.role = 'admin_monkey' AND u.status = 'inactive') THEN
    RAISE EXCEPTION 'platform.purge_user_notifications solo borra los avisos de un admin_monkey inactivo o durante la purga de una empresa'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  DELETE FROM platform.notifications WHERE user_id = p_user_id;
  DELETE FROM platform.notification_digests WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION platform.purge_user_notifications(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.purge_user_notifications(uuid) TO monkey_app;

-- 2. El destinatario pertenece a la empresa del aviso. La política de inserción solo mira la empresa de la sesión (el sistema escribe el aviso de OTRA persona de su empresa, sin poder leerlo), así
--    que sin esto un aviso podría quedar a nombre de una persona de otra empresa. Un trigger (y no una clave foránea compuesta) porque no exige índices únicos nuevos sobre `users` y solo mira filas nuevas.
CREATE OR REPLACE FUNCTION platform.notification_recipient_belongs_to_company() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM platform.users u WHERE u.id = NEW.user_id AND u.company_id = NEW.company_id) THEN
    RAISE EXCEPTION '% · el destinatario no pertenece a la empresa del registro', TG_TABLE_NAME
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION platform.notification_recipient_belongs_to_company() FROM PUBLIC;

CREATE TRIGGER notifications_recipient_company BEFORE INSERT ON platform.notifications
  FOR EACH ROW EXECUTE FUNCTION platform.notification_recipient_belongs_to_company();
CREATE TRIGGER notification_digests_recipient_company BEFORE INSERT ON platform.notification_digests
  FOR EACH ROW EXECUTE FUNCTION platform.notification_recipient_belongs_to_company();
