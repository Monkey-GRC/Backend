-- MD-508 · La campana en vivo se publica por el disparador, no por la app: solo las filas REALMENTE insertadas avisan. Antes la app mandaba un `pg_notify` por cada borrador, aunque `ON CONFLICT DO NOTHING`
-- descartara el aviso (el `INSERT … RETURNING` no sirve: la política de lectura es por persona y quien causa el hecho no es el destinatario). ADITIVA: una función y un disparador nuevos.
-- El canal y la forma del mensaje son los de antes (`monkey_notifications`, `{ i, u, c }`); Postgres lo entrega solo si la transacción se confirma.
CREATE OR REPLACE FUNCTION platform.publish_notification() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM pg_notify('monkey_notifications', jsonb_build_object('i', NEW.id, 'u', NEW.user_id, 'c', NEW.company_id)::text);
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION platform.publish_notification() FROM PUBLIC;

CREATE TRIGGER notifications_publish AFTER INSERT ON platform.notifications
  FOR EACH ROW EXECUTE FUNCTION platform.publish_notification();
