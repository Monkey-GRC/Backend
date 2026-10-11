import { buildConnectionSetup } from '../application/cloud-connection';
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
    // Lo que el cliente elige (D67): la marca no se traduce y las bloqueadas se muestran como tales.
    platforms: c.platforms.map((p) => ({ code: p.code, name: p.name, logo_key: p.logoKey, availability: p.availability, connection_methods: p.connectionMethods })),
    generated_evidence: c.generatedEvidence,
  };
}

export function toDeploymentScenarioResponse(state: TechnicalControlState) {
  return {
    deployment_scenario: state.deploymentScenario,
    applicable_capabilities: state.applicableCapabilities.map(toCapabilityResponse),
  };
}

// El paso 3 se da por hecho cuando el servicio ya tiene su escenario de despliegue (D60): registrar activos se
// recomienda pero se puede dejar para después.
export function toTechnicalControlResponse(state: TechnicalControlState, probeMode: string) {
  return {
    ...toDeploymentScenarioResponse(state),
    is_complete: state.deploymentScenario !== null,
    probe_mode: probeMode,
  };
}

// Lo que el cliente necesita para completar la conexión, sin secretos: el ExternalId lo generó Monkey y el principal es la identidad de Monkey que
// asume el rol del cliente (configuración, no secreto). Las llaves, si las hay, nunca salen.
type Translate = (key: string) => string;
const identity: Translate = (k) => k;

function toConnectionSetup(a: Asset, monkeyPrincipalArn: string | null, t: Translate) {
  const setup = buildConnectionSetup(a.provisioning, monkeyPrincipalArn);
  if (!setup) return null;
  if (setup.method === 'readonly_role') {
    return {
      method: setup.method,
      external_id: setup.externalId,
      monkey_principal_arn: setup.monkeyPrincipalArn,
      role_name: setup.roleName,
      template_path: setup.templatePath,
      role_arn: setup.roleArn,
      steps: setup.steps.map(t),
    };
  }
  if (setup.method === 'access_keys') return { method: setup.method, warning: t(setup.warning), steps: setup.steps.map(t) };
  return { method: setup.method, steps: setup.steps.map(t) };
}

// `t` traduce los pasos de instrucciones: la plataforma del cliente no tiene i18n propio (DT-21), así que el texto llega ya en su idioma.
export function toAssetResponse(a: Asset, monkeyPrincipalArn: string | null = null, t: Translate = identity) {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    connection_category: a.connectionCategory,
    type: a.type,
    platform: a.platform,
    external_account_id: a.externalAccountId,
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
      connection_method: a.provisioning.connectionMethod,
      regions: a.provisioning.regions,
      connection_status: a.provisioning.connectionStatus,
      last_validated_at: a.provisioning.lastValidatedAt?.toISOString() ?? null,
      is_active: a.provisioning.isActive,
      schedule_frequency: a.provisioning.scheduleFrequency,
    },
    connection_setup: toConnectionSetup(a, monkeyPrincipalArn, t),
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
    external_account_id: a.externalAccountId,
    provisioning: {
      connection_method: a.provisioning.connectionMethod,
      regions: a.provisioning.regions,
      connection_status: a.provisioning.connectionStatus,
      is_active: a.provisioning.isActive,
      schedule_frequency: a.provisioning.scheduleFrequency,
    },
  };
}
