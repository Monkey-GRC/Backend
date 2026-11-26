-- MD-504 · RLS, coherencia, permisos e inmutabilidad de `control_approvals` y `manual_test_results` (SQL a mano, aparte del cambio de schema 20261126130000).

ALTER TABLE tenant.control_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.control_approvals FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.control_approvals
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.manual_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.manual_test_results FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.manual_test_results
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Devolver exige el motivo y observar o exceptuar exige la nota (también en la base, no solo en la aplicación); en blanco no vale.
ALTER TABLE tenant.control_approvals
  ADD CONSTRAINT control_approvals_reason_check CHECK (reason IS NULL OR length(btrim(reason)) > 0),
  ADD CONSTRAINT control_approvals_return_reason_check CHECK (decision <> 'returned' OR reason IS NOT NULL);
ALTER TABLE tenant.manual_test_results
  ADD CONSTRAINT manual_test_results_note_check CHECK (note IS NULL OR length(btrim(note)) > 0),
  ADD CONSTRAINT manual_test_results_note_required_check CHECK (result = 'correct' OR note IS NOT NULL);

-- Permisos. Nada se borra desde la aplicación. Una aprobación solo cambia al dejar de valer (`invalidated_at`); un resultado no cambia nunca.
-- La entrega de evidencia es inmutable (20261018100000) salvo la marca de devuelta: la aplicación solo puede escribir esa columna.
REVOKE DELETE, TRUNCATE ON tenant.control_approvals FROM monkey_app;
REVOKE UPDATE ON tenant.control_approvals FROM monkey_app;
GRANT UPDATE (invalidated_at) ON tenant.control_approvals TO monkey_app;
REVOKE UPDATE, DELETE, TRUNCATE ON tenant.manual_test_results FROM monkey_app;
GRANT UPDATE (returned_approval_id) ON tenant.evidence_submissions TO monkey_app;

-- Inmutabilidad para TODOS los roles de la base (también el dueño), salvo la purga de una empresa archivada (D97).
CREATE OR REPLACE FUNCTION tenant.reject_manual_result_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (un resultado no se edita ni se borra)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Para cambiar de opinión se registra un resultado nuevo; el último de la ventana vigente es el que cuenta.';
END;
$$;

CREATE TRIGGER manual_test_results_immutable
  BEFORE UPDATE OR DELETE ON tenant.manual_test_results
  FOR EACH ROW EXECUTE FUNCTION tenant.reject_manual_result_mutation();
CREATE TRIGGER manual_test_results_no_truncate
  BEFORE TRUNCATE ON tenant.manual_test_results
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_manual_result_mutation();

-- Una aprobación conserva todo salvo `invalidated_at`, que solo pasa de nulo a un valor. No se borra (salvo la purga).
CREATE OR REPLACE FUNCTION tenant.guard_control_approval_change() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF platform.purge_in_progress() THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'tenant.control_approvals no se borra' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF (to_jsonb(NEW) - 'invalidated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'invalidated_at') OR OLD.invalidated_at IS NOT NULL THEN
    RAISE EXCEPTION 'tenant.control_approvals solo puede cambiar invalidated_at, una vez' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER control_approvals_guard
  BEFORE UPDATE OR DELETE ON tenant.control_approvals
  FOR EACH ROW EXECUTE FUNCTION tenant.guard_control_approval_change();
CREATE TRIGGER control_approvals_no_truncate
  BEFORE TRUNCATE ON tenant.control_approvals
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_manual_result_mutation();
