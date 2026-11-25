-- D152, SEG-88 · SQL a mano de MD-503, aparte del cambio de schema (20261125090100): RLS por empresa, restricciones de forma, una sola versión vigente por documento, permisos e inmutabilidad
-- de los documentos de la empresa. Mismo patrón que `test_verdicts` (20261117000200).

-- 1. RLS FORZADA por empresa (el filtro «lo suyo» de una persona lo hace la aplicación: no hay RLS por persona, D152) ---------------------------------------------------------------
ALTER TABLE tenant.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.company_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.company_documents
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.document_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.document_versions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.document_assignments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.document_assignments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE tenant.document_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.document_acceptances FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.document_acceptances
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 2. Forma de los datos, también en la base y no solo en la aplicación -----------------------------------------------------------------------------------------------------------
ALTER TABLE tenant.document_versions
  ADD CONSTRAINT document_versions_number_check CHECK (number >= 1),
  ADD CONSTRAINT document_versions_file_size_check CHECK (file_size > 0),
  ADD CONSTRAINT document_versions_integrity_hash_check CHECK (integrity_hash ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT document_versions_approvers_check CHECK (jsonb_typeof(approvers) = 'array' AND jsonb_array_length(approvers) BETWEEN 1 AND 3),
  ADD CONSTRAINT document_versions_note_check CHECK (approval_note IS NULL OR (length(btrim(approval_note)) > 0 AND length(approval_note) <= 500));
ALTER TABLE tenant.document_assignments
  ADD CONSTRAINT document_assignments_due_check CHECK (due_at >= assigned_at);
ALTER TABLE tenant.document_acceptances
  ADD CONSTRAINT document_acceptances_integrity_hash_check CHECK (integrity_hash ~ '^[0-9a-f]{64}$');

-- Una sola versión vigente por documento (las demás, `archived`). Prisma no declara índices parciales: solo vive aquí.
CREATE UNIQUE INDEX document_versions_one_current_idx ON tenant.document_versions (company_document_id) WHERE status = 'current';

-- 3. Permisos de monkey_app ------------------------------------------------------------------------------------------------------------------------------------------------------
-- Nada de esto se borra desde la aplicación; quitar una asignación es marcar `revoked_at`. Solo la purga de una empresa archivada (D97, dueño de `platform.purge_company`) borra filas.
REVOKE DELETE, TRUNCATE ON tenant.company_documents, tenant.document_versions, tenant.document_assignments FROM monkey_app;
-- La versión no cambia: solo su estado (vigente → archivada). La asignación cambia al revocarla o reactivarla. La aceptación no cambia nunca (SEG-88).
REVOKE UPDATE ON tenant.document_versions FROM monkey_app;
GRANT UPDATE (status) ON tenant.document_versions TO monkey_app;
REVOKE UPDATE ON tenant.document_assignments FROM monkey_app;
GRANT UPDATE (assigned_by, assigned_at, due_at, revoked_at) ON tenant.document_assignments TO monkey_app;
REVOKE UPDATE, DELETE, TRUNCATE ON tenant.document_acceptances FROM monkey_app;

-- 4. Inmutabilidad para TODOS los roles de la base (también el dueño), salvo la purga de una empresa archivada ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tenant.reject_document_acceptance_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND platform.purge_in_progress() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (una aceptación no se edita ni se borra)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Una versión nueva del documento pide una aceptación nueva; la anterior se conserva.';
END;
$$;

CREATE TRIGGER document_acceptances_immutable
  BEFORE UPDATE OR DELETE ON tenant.document_acceptances
  FOR EACH ROW EXECUTE FUNCTION tenant.reject_document_acceptance_mutation();
CREATE TRIGGER document_acceptances_no_truncate
  BEFORE TRUNCATE ON tenant.document_acceptances
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_document_acceptance_mutation();

-- Una versión conserva su archivo, su huella y su aprobación: solo puede pasar de `current` a `archived`.
CREATE OR REPLACE FUNCTION tenant.guard_document_version_change() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF platform.purge_in_progress() THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'tenant.document_versions: DELETE no está permitido (una versión no se borra)'
      USING ERRCODE = 'insufficient_privilege', HINT = 'La versión anterior queda archivada; nunca se borra.';
  END IF;
  IF (to_jsonb(NEW) - 'status') IS DISTINCT FROM (to_jsonb(OLD) - 'status')
     OR NOT (OLD.status = 'current' AND NEW.status = 'archived') THEN
    RAISE EXCEPTION 'tenant.document_versions es inmutable: solo una versión vigente puede pasar a archivada'
      USING ERRCODE = 'insufficient_privilege', HINT = 'Para cambiar el archivo se publica una versión nueva.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_versions_guard
  BEFORE UPDATE OR DELETE ON tenant.document_versions
  FOR EACH ROW EXECUTE FUNCTION tenant.guard_document_version_change();
CREATE OR REPLACE FUNCTION tenant.reject_document_truncate() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'tenant.%: TRUNCATE no está permitido', TG_TABLE_NAME USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER document_versions_no_truncate
  BEFORE TRUNCATE ON tenant.document_versions
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_document_truncate();
