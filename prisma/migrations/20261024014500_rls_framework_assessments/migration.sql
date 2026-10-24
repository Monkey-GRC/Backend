-- RLS, inmutabilidad y coherencia rol-veredicto de framework_assessments (D77, SEG-56, MD-155). SQL a mano, aparte del cambio de schema.
--
-- La evaluación del consultor y la del auditor se agregan y nunca se editan ni se borran (para cambiar de opinión se emite otra): la app no puede UPDATE ni DELETE y un
-- trigger lo impone a TODOS los roles, también al dueño de la tabla (como `evaluations`, SEG-38). La coherencia entre quien emite y lo que emite (el consultor solo
-- `ready`/`not_ready`, el auditor solo `certified`/`not_certified`) la impone un CHECK; que el rol sea el de quien emite lo comprueba la aplicación, porque la base no puede
-- mirar otra tabla en un CHECK.

ALTER TABLE tenant.framework_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.framework_assessments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.framework_assessments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.framework_assessments
  ADD CONSTRAINT framework_assessments_role_verdict_check CHECK (
    (assessor_role = 'consultor' AND verdict IN ('ready', 'not_ready'))
    OR (assessor_role = 'auditor' AND verdict IN ('certified', 'not_certified'))
  ),
  ADD CONSTRAINT framework_assessments_rationale_check CHECK (length(btrim(rationale)) > 0);

REVOKE UPDATE, DELETE, TRUNCATE ON tenant.framework_assessments FROM monkey_app;

CREATE OR REPLACE FUNCTION tenant.reject_assessment_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (una evaluación emitida no se edita ni se borra)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Para cambiar de opinión se emite una evaluación nueva; la vigente es la última de ese rol.';
END;
$$;

CREATE TRIGGER framework_assessments_immutable
  BEFORE UPDATE OR DELETE ON tenant.framework_assessments
  FOR EACH ROW EXECUTE FUNCTION tenant.reject_assessment_mutation();

CREATE TRIGGER framework_assessments_no_truncate
  BEFORE TRUNCATE ON tenant.framework_assessments
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_assessment_mutation();
