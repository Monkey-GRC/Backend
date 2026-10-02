-- Audit trail inmutable en la base de datos (MD-92).
--
-- Hasta ahora solo `monkey_app` tenía revocado UPDATE/DELETE/TRUNCATE sobre las tablas de `audit`. El dueño
-- de las tablas (el rol de las migraciones) y cualquier otro rol con permisos podían editar o borrar el
-- histórico, y un auditor necesita que NADIE pueda. Estos triggers lo garantizan para todos los roles: una
-- fila de `audit.audit_logs` o `audit.compliance_events` se agrega y nunca se edita ni se borra.
--
-- No toca ninguna fila existente. Solo SQL (sin cambios de schema de Prisma), según la convención de
-- no mezclarlos en una misma migración.

CREATE OR REPLACE FUNCTION audit.reject_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'audit.% es append-only: % no está permitido (el audit trail es inmutable)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Una fila de auditoría no se edita ni se borra; si hubo un error se agrega una fila nueva que lo corrija.';
END;
$$;

-- Por fila: UPDATE y DELETE.
CREATE TRIGGER audit_logs_append_only
  BEFORE UPDATE OR DELETE ON audit.audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit.reject_mutation();

CREATE TRIGGER compliance_events_append_only
  BEFORE UPDATE OR DELETE ON audit.compliance_events
  FOR EACH ROW EXECUTE FUNCTION audit.reject_mutation();

-- Por sentencia: TRUNCATE no dispara los triggers por fila.
CREATE TRIGGER audit_logs_no_truncate
  BEFORE TRUNCATE ON audit.audit_logs
  FOR EACH STATEMENT EXECUTE FUNCTION audit.reject_mutation();

CREATE TRIGGER compliance_events_no_truncate
  BEFORE TRUNCATE ON audit.compliance_events
  FOR EACH STATEMENT EXECUTE FUNCTION audit.reject_mutation();
