-- RLS, coherencia e inmutabilidad de audit_observations (§7.6, D96, MD-154, SEG-69). SQL a mano, aparte del cambio de schema.
--
-- Lo que escribe el auditor nunca se borra, y una observación cerrada no se toca. Se impone en la base y vale para TODOS los roles, también el dueño de la tabla (como
-- `evaluations`, SEG-38): la app no puede DELETE ni TRUNCATE y un trigger rechaza lo demás. La única excepción es el borrado definitivo de una empresa archivada (D97), que
-- corre como dueño de `platform.purge_company` con la purga en curso (`platform.purge_in_progress()`), igual que la auditoría y las evaluaciones.

ALTER TABLE tenant.audit_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.audit_observations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.audit_observations
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Coherencia del ciclo `open` → `answered` → `closed`. Quién actúa y con qué rol lo comprueba la aplicación (la base no puede mirar otra tabla en un CHECK).
ALTER TABLE tenant.audit_observations
  ADD CONSTRAINT audit_observations_body_check CHECK (length(btrim(body)) > 0),
  ADD CONSTRAINT audit_observations_answer_note_check CHECK (answer_note IS NULL OR length(btrim(answer_note)) > 0),
  -- Quien responde y cuándo van juntos; una evidencia de respuesta no existe sin la nota; y respondida o cerrada exige la respuesta completa.
  ADD CONSTRAINT audit_observations_answer_pair_check CHECK ((answered_by IS NULL) = (answered_at IS NULL)),
  ADD CONSTRAINT audit_observations_answer_evidence_check CHECK (answer_evidence_id IS NULL OR answer_note IS NOT NULL),
  ADD CONSTRAINT audit_observations_answered_check CHECK (status = 'open' OR (answered_by IS NOT NULL AND answer_note IS NOT NULL)),
  -- Está cerrada si y solo si tiene quién la cerró y cuándo, y la cierra siempre quien la escribió.
  ADD CONSTRAINT audit_observations_closed_check CHECK (((status = 'closed') = (closed_by IS NOT NULL)) AND ((closed_by IS NULL) = (closed_at IS NULL))),
  ADD CONSTRAINT audit_observations_closed_by_author_check CHECK (closed_by IS NULL OR closed_by = created_by);

REVOKE DELETE, TRUNCATE ON tenant.audit_observations FROM monkey_app;

CREATE OR REPLACE FUNCTION tenant.guard_audit_observation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'TRUNCATE' THEN
    RAISE EXCEPTION 'tenant.% no se vacía: una observación del auditor nunca se borra', TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF platform.purge_in_progress() THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'tenant.% no permite DELETE: una observación del auditor nunca se borra', TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege',
            HINT = 'Si hace falta algo más, se crea otra observación.';
  END IF;

  -- UPDATE. Una cerrada no se modifica ni se reabre.
  IF OLD.status = 'closed' THEN
    RAISE EXCEPTION 'tenant.% es inmutable una vez cerrada', TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege',
            HINT = 'Una observación cerrada no se reabre: si hace falta algo más, se crea otra.';
  END IF;

  -- Lo que identifica a la observación y lo que dijo su autor sobre qué habla no cambia nunca; solo se edita el texto, la respuesta y el estado.
  IF (NEW.id, NEW.tenant_id, NEW.service_id, NEW.client_control_id, NEW.evidence_submission_id, NEW.created_by, NEW.type, NEW.created_at)
     IS DISTINCT FROM (OLD.id, OLD.tenant_id, OLD.service_id, OLD.client_control_id, OLD.evidence_submission_id, OLD.created_by, OLD.type, OLD.created_at) THEN
    RAISE EXCEPTION 'tenant.%: solo cambian el texto, la respuesta y el estado', TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Los únicos cambios de estado: la empresa responde (open → answered); el auditor la devuelve (answered → open) o la cierra (answered → closed).
  IF NEW.status <> OLD.status AND NOT ((OLD.status = 'open' AND NEW.status = 'answered') OR (OLD.status = 'answered' AND NEW.status IN ('open', 'closed'))) THEN
    RAISE EXCEPTION 'tenant.%: el paso % → % no está permitido', TG_TABLE_NAME, OLD.status, NEW.status
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_observations_guard
  BEFORE UPDATE OR DELETE ON tenant.audit_observations
  FOR EACH ROW EXECUTE FUNCTION tenant.guard_audit_observation();

CREATE TRIGGER audit_observations_no_truncate
  BEFORE TRUNCATE ON tenant.audit_observations
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.guard_audit_observation();
