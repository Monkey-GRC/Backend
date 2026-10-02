import { Asset, Capability, TechnicalControlState } from '../domain/entities/technical-control.entities';

// Forma de contracts/modules/onboarding-technical-control.md, en snake_case. Ninguna de estas
// funciones puede devolver `provider`: el tipo `Capability` ni siquiera lo tiene.
export function toCapabilityResponse(c: Capability) {
  return {
    catalog_code: c.catalogCode,
    category: c.category,
    method: c.method,
    required_permissions: c.requiredPermissions,
    base_frequency: c.baseFrequency,
    supported_platforms: c.supportedPlatforms,
    generated_evidence: c.generatedEvidence,
  };
}

export function toScopeResponse(scope: NonNullable<TechnicalControlState['scope']>) {
  return {
    id: scope.id,
    ...scope.counts,
    declared_total: scope.declaredTotal,
    connected_total: scope.connectedTotal,
    // Lo conectado por tipo, para mostrar «declaraste 12 servidores, tengo 9 conectados».
    connected: scope.connected,
  };
}

export function toDeploymentScenarioResponse(state: TechnicalControlState) {
  return {
    deployment_scenario: state.deploymentScenario,
    applicable_capabilities: state.applicableCapabilities.map(toCapabilityResponse),
  };
}

// El paso 3 se da por hecho cuando ya están el escenario y el scope (D46): conectar sistemas se
// recomienda pero se puede dejar para después.
export function toTechnicalControlResponse(state: TechnicalControlState, probeMode: string) {
  return {
    ...toDeploymentScenarioResponse(state),
    scope: state.scope ? toScopeResponse(state.scope) : null,
    is_complete: state.deploymentScenario !== null && state.scope !== null,
    probe_mode: probeMode,
  };
}

export function toAssetResponse(a: Asset) {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    connection_category: a.connectionCategory,
    type: a.type,
    platform: a.platform,
    ip_address: a.ipAddress,
    location: a.location,
    criticality: a.criticality,
    tags: a.tags,
    origin: a.origin,
    status: a.status,
    operational_status: a.operationalStatus,
    technical_coverage: a.technicalCoverage,
    services: a.services,
    provisioning: {
      id: a.provisioning.id,
      automated_capability_code: a.provisioning.automatedCapabilityCode,
      connection_status: a.provisioning.connectionStatus,
      last_validated_at: a.provisioning.lastValidatedAt?.toISOString() ?? null,
      is_active: a.provisioning.isActive,
      schedule_frequency: a.provisioning.scheduleFrequency,
    },
  };
}

export function toAssetListItem(a: Asset) {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    connection_category: a.connectionCategory,
    type: a.type,
    operational_status: a.operationalStatus,
    technical_coverage: a.technicalCoverage,
    services: a.services,
    provisioning: {
      connection_status: a.provisioning.connectionStatus,
      is_active: a.provisioning.isActive,
      schedule_frequency: a.provisioning.scheduleFrequency,
    },
  };
}
