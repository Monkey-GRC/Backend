import { osVersionLabel } from '../../../common/catalogs/os-version';
import { capabilityTexts } from '../../../common/text/translate-or';
import { buildConnectionSetup } from '../application/cloud-connection';
import { Asset, Capability, TechnicalControlState } from '../domain/entities/technical-control.entities';

// Forma de contracts/modules/onboarding-technical-control.md, en snake_case. Ninguna de estas
// funciones puede devolver `provider`: el tipo `Capability` ni siquiera lo tiene.
export function toCapabilityResponse(c: Capability) {
  return {
    catalog_code: c.catalogCode,
    ...capabilityTexts(c),
    // Lo que el cliente elige (D67): la marca no se traduce y las bloqueadas se muestran como tales.
    platforms: c.platforms.map((p) => ({ code: p.code, name: p.name, logo_key: p.logoKey, availability: p.availability, connection_methods: p.connectionMethods })),
  };
}

// Todas las conexiones del catálogo: el cliente no declara dónde vive su servicio, elige la plataforma (D92).
export function toTechnicalControlResponse(state: TechnicalControlState, probeMode: string) {
  return {
    applicable_capabilities: state.applicableCapabilities.map(toCapabilityResponse),
    probe_mode: probeMode,
  };
}

// Lo que el cliente necesita para completar la conexión, sin secretos: el ExternalId lo generó Monkey y el principal es la identidad de Monkey que
// asume el rol del cliente (configuración, no secreto). Las llaves, si las hay, nunca salen.
type Translate = (key: string) => string;
const identity: Translate = (k) => k;
// Arma el comando de alta de GCP para un proyecto y un identificador externo; nulo si el servidor no tiene la identidad de Monkey configurada.
export type GcpSetupCommand = (projectId: string, externalId: string) => string;
// Arma el comando de alta de Microsoft 365 (D154) con el tenant y el certificado público de la conexión.
export type M365SetupCommand = (tenantId: string, certificatePem: string) => string;

function toConnectionSetup(a: Asset, monkeyPrincipalArn: string | null, t: Translate, gcpSetupCommand: GcpSetupCommand | null, m365SetupCommand: M365SetupCommand | null) {
  const setup = buildConnectionSetup({ ...a.provisioning, externalAccountId: a.externalAccountId }, monkeyPrincipalArn);
  if (!setup) return null;
  if (setup.method === 'identity_federation') {
    return {
      method: setup.method,
      external_id: setup.externalId,
      project_id: setup.projectId,
      project_number: setup.projectNumber,
      // El script completo va dentro del comando (no se publica en ninguna URL). Sin la identidad de Monkey configurada no hay nada que armar.
      setup_command: gcpSetupCommand ? gcpSetupCommand(setup.projectId, setup.externalId) : null,
      template_path: setup.templatePath,
      steps: setup.steps.map(t),
    };
  }
  if (setup.method === 'app_certificate') {
    return {
      method: setup.method,
      tenant_id: setup.tenantId,
      client_id: setup.clientId,
      // La huella y el vencimiento no son secretos. La clave privada y el PFX no salen jamás.
      certificate: { thumbprint: setup.certificate.thumbprint, expires_at: setup.certificate.expiresAt.toISOString() },
      // El script completo y el certificado PÚBLICO van dentro del comando (no se publica en ninguna URL).
      setup_command: m365SetupCommand ? m365SetupCommand(setup.tenantId, setup.certificate.pem) : null,
      template_path: setup.templatePath,
      steps: setup.steps.map(t),
    };
  }
  if (setup.method === 'admin_consent') return { method: setup.method, tenant_id: setup.tenantId, steps: setup.steps.map(t) };
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
export function toAssetResponse(a: Asset, monkeyPrincipalArn: string | null = null, t: Translate = identity, gcpSetupCommand: GcpSetupCommand | null = null, m365SetupCommand: M365SetupCommand | null = null) {
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
    connection_setup: toConnectionSetup(a, monkeyPrincipalArn, t, gcpSetupCommand, m365SetupCommand),
    // Solo un servidor o equipo con agente (D113). `os_version` lleva el mismo texto que el catálogo (`<sistema>_version`).
    agent: a.agent
      ? { status: a.agent.status, os: a.agent.os, os_version: { value: a.agent.osVersion.code, label: osVersionLabel(a.agent.osVersion, t) }, last_sync_at: a.agent.lastSyncAt?.toISOString() ?? null }
      : null,
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
