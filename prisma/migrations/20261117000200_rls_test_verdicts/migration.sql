-- D121 · SQL a mano de MD-194, aparte del cambio de schema (20261117000100): RLS, coherencia, permisos e inmutabilidad de `test_verdicts` y `test_verdict_reviews`.

ALTER TABLE tenant.test_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.test_verdicts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.test_verdicts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.test_verdict_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.test_verdict_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.test_verdict_reviews
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Rechazar exige el motivo (también en la base, no solo en la aplicación); la nota en blanco no vale.
ALTER TABLE tenant.test_verdict_reviews
  ADD CONSTRAINT test_verdict_reviews_note_check CHECK (note IS NULL OR length(btrim(note)) > 0),
  ADD CONSTRAINT test_verdict_reviews_reject_note_check CHECK (decision <> 'reject' OR note IS NOT NULL);
ALTER TABLE tenant.test_verdicts
  ADD CONSTRAINT test_verdicts_closure_reason_check CHECK (closure_observation_reason IS NULL OR length(btrim(closure_observation_reason)) > 0);

-- Un veredicto es inmutable (como `evaluations`, SEG-38): la app no puede UPDATE, DELETE ni TRUNCATE y un trigger lo impone a TODOS los roles. Solo la purga de una empresa archivada
-- (D97) puede borrarlo. Sus revisiones sí se reemplazan (UPDATE de la propia del rol) pero nunca se borran.
REVOKE UPDATE, DELETE, TRUNCATE ON tenant.test_verdicts FROM monkey_app;
REVOKE DELETE, TRUNCATE ON tenant.test_verdict_reviews FROM monkey_app;

CREATE OR REPLACE FUNCTION tenant.reject_verdict_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (un veredicto no se edita ni se borra)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Para cambiar de opinión se registra un veredicto nuevo; el último del test en el servicio es el vigente.';
END;
$$;

CREATE TRIGGER test_verdicts_immutable
  BEFORE UPDATE OR DELETE ON tenant.test_verdicts
  FOR EACH ROW EXECUTE FUNCTION tenant.reject_verdict_mutation();
CREATE TRIGGER test_verdicts_no_truncate
  BEFORE TRUNCATE ON tenant.test_verdicts
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_verdict_mutation();
