import { IntegrationContentShape } from './entities/integration.entities';

const SOON: IntegrationContentShape = { resourceTypes: [], permissions: [], security: [], full: false };

// La estructura del detalle de cada integración (D110). Solo lo verificado: cada tema de seguridad responde a un SEG-n en ✅ o a una decisión construida.
// Las que no están construidas no prometen permisos ni detalles técnicos que el comité no decidió (P44 a P46).
export const INTEGRATION_CONTENT: Record<string, IntegrationContentShape> = {
  aws: {
    resourceTypes: ['server', 'database', 'storage', 'function'],
    permissions: [
      { key: 'security_audit', scope: 'arn:aws:iam::aws:policy/SecurityAudit', access: 'read' },
      { key: 'view_only_access', scope: 'arn:aws:iam::aws:policy/job-function/ViewOnlyAccess', access: 'read' },
      { key: 'assume_role', scope: 'sts:AssumeRole', access: 'read' },
    ],
    security: ['read_only', 'temporary_credentials', 'external_id', 'isolated_execution', 'tenant_isolation', 'encrypted_keys'],
    full: true,
  },
  azure: SOON,
  gcp: SOON,
  microsoft_365: SOON,
  google_workspace: SOON,
  github: SOON,
  jira: SOON,
};

export const contentOf = (code: string): IntegrationContentShape => INTEGRATION_CONTENT[code] ?? SOON;
