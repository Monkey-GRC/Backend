-- 1. Rol de la aplicación --------------------------------------------------
-- El rol dueño (postgres) es superusuario e ignora RLS. La app debe conectarse
-- con un rol que NO lo sea. La contraseña se asigna aparte, fuera de git.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monkey_app') THEN
    CREATE ROLE monkey_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO monkey_app', current_database());
END $$;

GRANT USAGE ON SCHEMA catalog, platform, tenant, audit TO monkey_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA catalog, platform, tenant TO monkey_app;
-- Audit trail: append-only. Sin UPDATE ni DELETE.
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO monkey_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA catalog, platform, tenant
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO monkey_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
  GRANT SELECT, INSERT ON TABLES TO monkey_app;

REVOKE UPDATE, DELETE, TRUNCATE ON audit.audit_logs, audit.compliance_events FROM monkey_app;

-- 2. RLS en tablas de tenant con tenant_id ----------------------------------
-- Falla cerrado: si app.tenant_id no está definido, no se ve ninguna fila.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organization_regulations', 'organization_responsibles', 'services',
    'service_trust_criteria', 'service_frameworks', 'subservice_organizations',
    'csocs', 'cuecs', 'system_descriptions', 'service_risks', 'scopes',
    'assets', 'service_assets', 'asset_provisionings',
    'client_controls', 'action_plans', 'mitigations', 'residual_risks',
    'risk_treatments', 'evidence_requirements', 'evidence_submissions',
    'exclusions', 'evaluations', 'findings', 'vulnerabilities',
    'schedule_rules', 'executions', 'check_results', 'execution_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE tenant.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE tenant.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($p$
      CREATE POLICY tenant_isolation ON tenant.%I
        USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    $p$, t);
  END LOOP;
END $$;

-- organizations no tiene tenant_id: su discriminante es company_id
ALTER TABLE tenant.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant.organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant.organizations
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 3. RLS en audit ------------------------------------------------------------
ALTER TABLE audit.compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.compliance_events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit.compliance_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- audit_logs.tenant_id es nullable (acciones de plataforma sin tenant):
-- se pueden insertar sin tenant, pero solo se leen las del tenant actual.
ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit.audit_logs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );