// El trabajador que ejecuta el motor de nube (D57). Dominio puro: sin Nest, sin Docker, sin AWS.
//
// Este módulo NO importa nada de `src/features`: habla con el backend solo por HTTP (`/internal/runner`, contracts/modules/control-tecnico.md),
// de modo que se puede reemplazar por otro ejecutor (una tarea en la nube) sin tocar el backend, y no necesita acceso a la base de datos.

// Lo que el backend entrega al reclamar una ejecución.
// Qué se pide (D58): una validación comprueba el acceso a la cuenta (segundos, el cliente espera); una evaluación corre el motor (minutos).
// `enrollment` (D112): crear el agente de un servidor en la sonda. Lo espera un cliente en pantalla (segundos), así que tiene su propio carril, como la validación.
export type RunnerJobKind = 'assessment' | 'validation' | 'enrollment';

export type RunnerJob = {
  executionId: string;
  kind: RunnerJobKind;
  tenantId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  // `aws` para la nube; para un servidor, la plataforma del activo (D112).
  platform: string;
  externalAccountId: string | null;
  regions: string[];
  connection:
    | { method: 'readonly_role'; roleArn: string; externalId: string | null }
    // Las llaves viajan SOLO en esta respuesta, por la red interna. Nunca se registran.
    | { method: 'access_keys'; accessKeyId: string; secretAccessKey: string }
    // Un servidor con agente de la sonda (D112). NO hay credenciales del cliente: el trabajador lee la sonda con la suya, que nunca viaja por esta
    // API. `agentId` es el agente enlazado al activo y `group` el grupo esperado (el `tenant_id`): el trabajador lo comprueba y el backend lo vuelve a comprobar.
    | { method: 'agent'; agentId: string; group: string };
  // Solo en `enrollment` (D112): cómo se llama el agente en la sonda (= el id del activo) y a qué grupo va (= el id de la empresa). Los dos los fija el backend: el trabajador no
  // los inventa ni los deduce del servidor.
  // `remove`: el servidor se dio de baja; no se crea el agente, se retira de la sonda (D112 punto 8).
  enrollment?: { name: string; group: string; remove?: boolean };
};

// Credenciales con las que el motor mira la cuenta del cliente. Con un rol son TEMPORALES (SEG-46): el motor nunca ve llaves de larga vida.
export type TemporaryCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string | null;
};

export type EngineInput = {
  executionId: string;
  regions: string[];
  credentials: TemporaryCredentials;
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
  engineFailed: 'execution.engine_failed',
  engineTimeout: 'execution.engine_timeout',
  outputInvalid: 'execution.output_invalid',
  // La sonda de servidores (D112). Un servidor que no responde es un problema de CONEXIÓN, no un incumplimiento.
  methodNotSupported: 'connection.method_not_supported_by_runner',
  agentNotFound: 'connection.agent_not_found',
  agentNoScanYet: 'connection.agent_no_scan_yet',
  agentDisconnected: 'connection.agent_disconnected',
  agentGroupMismatch: 'connection.agent_group_mismatch',
  // Crear el agente de un servidor en la sonda no se pudo (D112).
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
