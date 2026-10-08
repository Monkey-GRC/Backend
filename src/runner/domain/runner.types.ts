// El trabajador que ejecuta el motor de nube (D57). Dominio puro: sin Nest, sin Docker, sin AWS.
//
// Este módulo NO importa nada de `src/features`: habla con el backend solo por HTTP (`/internal/runner`, contracts/modules/control-tecnico.md),
// de modo que se puede reemplazar por otro ejecutor (una tarea en la nube) sin tocar el backend, y no necesita acceso a la base de datos.

// Lo que el backend entrega al reclamar una ejecución.
export type RunnerJob = {
  executionId: string;
  tenantId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  platform: 'aws';
  externalAccountId: string | null;
  regions: string[];
  connection:
    | { method: 'readonly_role'; roleArn: string; externalId: string | null }
    // Las llaves viajan SOLO en esta respuesta, por la red interna. Nunca se registran.
    | { method: 'access_keys'; accessKeyId: string; secretAccessKey: string };
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
