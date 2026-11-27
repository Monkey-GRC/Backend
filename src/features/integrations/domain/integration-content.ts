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
  // D157. El de correo es `read` porque lo que permite lo decide el rol que se le asigna, y se pide «Lector global».
  microsoft_365: {
    resourceTypes: [],
    permissions: [
      { key: 'directory', scope: 'Directory.Read.All · RoleManagementPolicy.Read.Directory · OnPremDirectorySynchronization.Read.All', access: 'read' },
      { key: 'policies', scope: 'Policy.Read.All', access: 'read' },
      { key: 'activity', scope: 'AuditLog.Read.All · AccessReview.Read.All', access: 'read' },
      { key: 'security_signals', scope: 'ThreatHunting.Read.All · SecurityIdentitiesHealth.Read.All · SecurityIdentitiesSensors.Read.All', access: 'read' },
      { key: 'devices_and_sites', scope: 'SharePointTenantSettings.Read.All · DeviceManagementConfiguration.Read.All · DeviceManagementManagedDevices.Read.All · DeviceManagementServiceConfig.Read.All', access: 'read' },
      { key: 'mail', scope: 'Exchange.ManageAsApp', access: 'read' },
    ],
    security: ['read_only', 'temporary_credentials', 'isolated_execution', 'tenant_isolation'],
    full: true,
  },
  google_workspace: SOON,
  github: SOON,
  jira: SOON,
};

export const contentOf = (code: string): IntegrationContentShape => INTEGRATION_CONTENT[code] ?? SOON;
