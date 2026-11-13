// El trabajador que ejecuta el motor de nube (D57). Dominio puro: sin Nest, sin Docker, sin AWS.
//
// Este módulo NO importa nada de `src/features`: habla con el backend solo por HTTP (`/internal/runner`, contracts/modules/control-tecnico.md),
// de modo que se puede reemplazar por otro ejecutor (una tarea en la nube) sin tocar el backend, y no necesita acceso a la base de datos.

// Lo que el backend entrega al reclamar una ejecución.
// Qué se pide (D58): una validación comprueba el acceso a la cuenta (segundos, el cliente espera); una evaluación corre el motor (minutos).
export type RunnerJobKind = 'assessment' | 'validation';

// Las nubes que el trabajador sabe evaluar. Cada una tiene su adaptador (credencial, motor, inventario) en `infrastructure/providers/<nube>/`.
export type RunnerPlatform = 'aws' | 'gcp';

export type RunnerJob = {
  executionId: string;
  kind: RunnerJobKind;
  tenantId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  platform: RunnerPlatform;
  externalAccountId: string | null;
  regions: string[];
  connection:
    | { method: 'readonly_role'; roleArn: string; externalId: string | null }
    // GCP (D112): `externalId` es el nombre de la sesión de AWS con la que Monkey entra; el número de proyecto arma la audiencia de la federación.
    | { method: 'identity_federation'; externalId: string; projectNumber: string }
    // Las llaves viajan SOLO en esta respuesta, por la red interna. Nunca se registran.
    | { method: 'access_keys'; accessKeyId: string; secretAccessKey: string };
};

// Credenciales con las que el motor mira la cuenta del cliente. Siempre TEMPORALES (SEG-46): con un rol son de 1 hora; el motor nunca ve llaves de larga vida
// de Monkey. Una unión discriminada: cada nube tiene la suya y solo su adaptador la lee.
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
export type TemporaryCredentials = AwsCredentials | GcpCredentials;

export type EngineInput = {
  executionId: string;
  // La cuenta (AWS) o el ID del proyecto (GCP) que se evalúa.
  accountId: string | null;
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
  federationRejected: 'connection.federation_rejected',
  methodNotSupportedByRunner: 'connection.method_not_supported_by_runner',
  engineFailed: 'execution.engine_failed',
  engineTimeout: 'execution.engine_timeout',
  outputInvalid: 'execution.output_invalid',
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
