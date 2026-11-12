export type IntegrationPurposeValue = 'measurement' | 'workflow';
export type AvailabilityValue = 'available' | 'coming_soon';
export type IntegrationStatusValue = 'needs_attention' | 'active' | 'pending';
export type ProvisioningStatusValue = 'pending' | 'validated' | 'active' | 'scheduled' | 'failed';
export type OperationalStatusValue = 'operational' | 'warning' | 'error' | 'not_monitored';

// Una fila del catálogo con lo que se muestra (nombre, logo y disponibilidad ya resueltos: los de su plataforma si la tiene).
export interface CatalogIntegration {
  code: string;
  name: string;
  logoKey: string;
  purpose: IntegrationPurposeValue;
  availability: AvailabilityValue;
  connection: { category: string; platform: string } | null;
  connected: boolean;
}

// Una conexión vigente tal como sale de la base, sin derivar nada.
export interface ConnectionRecord {
  assetId: string;
  code: string;
  name: string;
  connectionStatus: ProvisioningStatusValue;
  operationalStatus: OperationalStatusValue;
  lastValidatedAt: Date | null;
  resourceCount: number;
  services: { id: string; name: string }[];
}

export interface IntegrationConnections {
  code: string;
  name: string;
  logoKey: string;
  purpose: IntegrationPurposeValue;
  sortOrder: number;
  connections: ConnectionRecord[];
}

export interface ConnectionSummary extends ConnectionRecord {
  needsAttention: boolean;
}

export interface IntegrationSummary {
  code: string;
  name: string;
  logoKey: string;
  purpose: IntegrationPurposeValue;
  status: IntegrationStatusValue;
  connectionCount: number;
  resourceCount: number;
  lastValidatedAt: Date | null;
  connections: ConnectionSummary[];
}

// Lo que el catálogo dice de una plataforma, sin derivar: las pruebas con algún check de ella y los vínculos de sus controles con los marcos.
export interface CoverageRecord {
  tests: { code: string; displayName: string | null; displayNameEn: string | null }[];
  controlIds: string[];
  frameworkLinks: { controlId: string; frameworkCode: string; frameworkName: string }[];
}

export interface IntegrationCoverage {
  tests: { code: string; displayName: string | null; displayNameEn: string | null }[];
  controlsCount: number;
  frameworks: { code: string; name: string; controlsCount: number }[];
}

export interface IntegrationDetailRecord {
  item: CatalogIntegration;
  connections: IntegrationConnections | null;
  coverage: CoverageRecord | null;
}

export type SecurityTopic = 'read_only' | 'temporary_credentials' | 'external_id' | 'isolated_execution' | 'tenant_isolation' | 'encrypted_keys';
export type PermissionAccess = 'read' | 'write';

// Lo que no es texto del contenido de una integración. Los textos van en i18n (`integration.content.<code>.*`).
export interface IntegrationContentShape {
  resourceTypes: ('server' | 'database' | 'storage' | 'function')[];
  permissions: { key: string; scope: string | null; access: PermissionAccess }[];
  security: SecurityTopic[];
  // Las que no están construidas solo llevan resumen, funciones, capacidades y dónde se usa.
  full: boolean;
}

export interface IntegrationDetail {
  item: CatalogIntegration;
  summary: IntegrationSummary | null;
  coverage: IntegrationCoverage | null;
  content: IntegrationContentShape;
}
