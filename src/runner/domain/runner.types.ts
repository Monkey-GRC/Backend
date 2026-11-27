// El trabajador que ejecuta el motor de nube (D57). Dominio puro: sin Nest, sin Docker, sin AWS.
//
// Este módulo NO importa nada de `src/features`: habla con el backend solo por HTTP (`/internal/runner`, contracts/modules/control-tecnico.md),
// de modo que se puede reemplazar por otro ejecutor (una tarea en la nube) sin tocar el backend, y no necesita acceso a la base de datos.

// Lo que el backend entrega al reclamar una ejecución.
// Qué se pide (D58): una validación comprueba el acceso a la cuenta (segundos, el cliente espera); una evaluación corre el motor (minutos).
// `enrollment` (D113): crear el agente de un servidor en la sonda. Lo espera un cliente en pantalla (segundos), así que tiene su propio carril, como la validación.
export type RunnerJobKind = 'assessment' | 'validation' | 'enrollment';

// Las nubes que el trabajador sabe evaluar. Cada una tiene su adaptador (credencial, motor, inventario) en `infrastructure/providers/<nube>/`.
export type RunnerPlatform = 'aws' | 'gcp' | 'microsoft_365';

export type RunnerJob = {
  executionId: string;
  kind: RunnerJobKind;
  tenantId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  // `aws` o `gcp` para la nube; para un servidor, la plataforma del activo (D113).
  platform: RunnerPlatform | string;
  externalAccountId: string | null;
  regions: string[];
  connection:
    | { method: 'readonly_role'; roleArn: string; externalId: string | null }
    // GCP (D112): `externalId` es el nombre de la sesión de AWS con la que Monkey entra; el número de proyecto arma la audiencia de la federación.
    | { method: 'identity_federation'; externalId: string; projectNumber: string }
    // Microsoft 365 (D154): la aplicación del cliente y el certificado de la conexión. La clave privada viaja SOLO en esta respuesta, por la red interna, y no sale del trabajador (D156).
    | { method: 'app_certificate'; clientId: string; certificateThumbprint: string; privateKeyPem: string }
    // Microsoft 365 con el botón (D157): el cliente autorizó la aplicación de Monkey. No viaja ninguna credencial: la de la aplicación la tiene el trabajador.
    | { method: 'admin_consent' }
    // Las llaves viajan SOLO en esta respuesta, por la red interna. Nunca se registran.
    | { method: 'access_keys'; accessKeyId: string; secretAccessKey: string }
    // Un servidor con agente de la sonda (D113). NO hay credenciales del cliente: el trabajador lee la sonda con la suya, que nunca viaja por esta
    // API. `agentId` es el agente enlazado al activo y `group` el grupo esperado (el `tenant_id`): el trabajador lo comprueba y el backend lo vuelve a comprobar.
    | { method: 'agent'; agentId: string; group: string };
  // Solo en `enrollment` (D113): cómo se llama el agente en la sonda (= el id del activo) y a qué grupo va (= el id de la empresa). Los dos los fija el backend: el trabajador no
  // los inventa ni los deduce del servidor.
  // `remove`: el servidor se dio de baja; no se crea el agente, se retira de la sonda (D113 punto 8).
  enrollment?: { name: string; group: string; remove?: boolean };
};

// Credenciales con las que el motor mira la cuenta del cliente. Casi siempre TEMPORALES (SEG-46): con un rol son de 1 hora; el motor nunca ve llaves de larga vida
// de Monkey (excepción documentada, siempre de UN cliente y de solo lectura: el canal de llaves de AWS). Una unión discriminada: cada nube tiene la suya y solo su adaptador la lee.
export type AwsCredentials = {
  provider: 'aws';
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string | null;
};
// GCP (D112): un token de acceso de 1 h de la cuenta de servicio de solo lectura del proyecto.
export type GcpCredentials = {
  provider: 'gcp';
  accessToken: string;
  expiresAt: Date;
};
// Microsoft 365 (D156): permisos temporales (~1 h) de UNA organización, uno por servicio. El certificado y su llave se quedan en el trabajador.
// Correo y reuniones son opcionales: sin ellos, sus verificaciones no corren.
export type Microsoft365Credentials = {
  provider: 'microsoft_365';
  tenantId: string;
  clientId: string;
  tokens: { graph: string; exchange: string | null; teams: string | null };
};
export type TemporaryCredentials = AwsCredentials | GcpCredentials | Microsoft365Credentials;

export type EngineInput = {
  executionId: string;
  // La cuenta (AWS) o el ID del proyecto (GCP) que se evalúa.
  accountId: string | null;
  regions: string[];
  credentials: TemporaryCredentials;
  // Avance REAL de la corrida, si el motor de esa nube lo informa: verificaciones hechas de un total.
  onProgress?: (done: number, total: number) => void;
};

export type EngineRun = {
  engineVersion: string;
  startedAt: Date;
  finishedAt: Date;
  // La salida del motor SIN TOCAR: el backend la valida y la interpreta. El trabajador no sabe qué significa.
  findings: unknown[];
};

// Por qué no se pudo hacer la corrida. `reason` es una CLAVE i18n estable (la guarda `executions.failure_reason`), nunca texto libre ni nada que
// contenga una credencial. Un fallo de ejecución es un problema de CONEXIÓN, no un incumplimiento.
export const FAILURE = {
  roleNotFound: 'connection.role_not_found',
  accountMismatch: 'connection.account_mismatch',
  credentialsInvalid: 'connection.credentials_invalid',
  federationRejected: 'connection.federation_rejected',
  // Microsoft 365 (D154): Entra no aceptó la aplicación o el certificado; o la aplicación no tiene los permisos de lectura (falta el consentimiento).
  appRejected: 'connection.app_rejected',
  permissionsMissing: 'connection.permissions_missing',
  // Con el botón (D157): la organización aún no tiene aplicada la autorización (o se la quitaron). El cliente espera un momento o vuelve a autorizar.
  consentRequired: 'connection.consent_required',
  methodNotSupportedByRunner: 'connection.method_not_supported_by_runner',
  engineFailed: 'execution.engine_failed',
  engineTimeout: 'execution.engine_timeout',
  outputInvalid: 'execution.output_invalid',
  // La sonda de servidores (D113). Un servidor que no responde es un problema de CONEXIÓN, no un incumplimiento.
  methodNotSupported: 'connection.method_not_supported_by_runner',
  agentNotFound: 'connection.agent_not_found',
  agentNoScanYet: 'connection.agent_no_scan_yet',
  agentDisconnected: 'connection.agent_disconnected',
  agentGroupMismatch: 'connection.agent_group_mismatch',
  // Crear el agente de un servidor en la sonda no se pudo (D113).
  agentEnrollFailed: 'connection.agent_enroll_failed',
  probeUnreachable: 'connection.probe_unreachable',
  probeUnauthorized: 'connection.probe_unauthorized',
  probeVersionUnsupported: 'execution.probe_version_unsupported',
} as const;

export class RunnerFailure extends Error {
  constructor(
    readonly reason: string,
    detail?: string,
  ) {
    super(detail ? `${reason}: ${detail}` : reason);
  }
}

// El backend respondió con un error HTTP.
export class RunnerApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(`El backend respondió ${status}${code ? ` (${code})` : ''}`);
  }
}
