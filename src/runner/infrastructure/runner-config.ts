// Configuración del trabajador. Falla en voz alta al arrancar: un trabajador a medio configurar que «parece vivo» pero no procesa nada es peor
// que uno que no arranca. Solo lee lo suyo: NO recibe el `.env` del backend (sin JWT, sin clave de cifrado, sin base de datos).
export type RunnerConfig = {
  backendUrl: string;
  runnerToken: string;
  engineImage: string;
  // El rol de AWS de Monkey que GCP acepta como identidad de origen (D112). Sin él, este trabajador no evalúa GCP.
  gcpFederationRoleArn: string | null;
  engineTimeoutMs: number;
  engineMemoryBytes: number;
  engineCpus: number;
  pollIntervalMs: number;
  // Las validaciones las espera un cliente en pantalla: se miran más seguido que las evaluaciones.
  validationPollIntervalMs: number;
};

const int = (env: Record<string, string | undefined>, key: string, fallback: number, min: number, max: number): number => {
  const raw = env[key]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${key} debe ser un entero entre ${min} y ${max}.`);
  return value;
};

// El backend barre a los 30 min una ejecución «en curso» (D57). El motor debe vencer ANTES, para informar el fallo él mismo.
export const MAX_ENGINE_TIMEOUT_SECONDS = 25 * 60;

export function loadRunnerConfig(env: Record<string, string | undefined>): RunnerConfig {
  const runnerToken = env['RUNNER_TOKEN']?.trim();
  if (!runnerToken) throw new Error('Falta RUNNER_TOKEN: sin él la API interna del backend no responde.');
  const engineImage = env['ENGINE_IMAGE']?.trim();
  if (!engineImage) throw new Error('Falta ENGINE_IMAGE (la imagen del motor, fijada por versión o por digest).');
  // `latest` o una imagen sin versión haría que dos corridas del mismo cliente usaran motores distintos sin que nadie lo notara.
  if (!/[:@]/.test(engineImage) || /:latest$/.test(engineImage)) throw new Error('ENGINE_IMAGE debe fijar una versión o un digest, no `latest`.');
  const backendUrl = (env['BACKEND_INTERNAL_URL']?.trim() || 'http://backend:3000').replace(/\/+$/, '');
  const gcpFederationRoleArn = env['MONKEY_GCP_FEDERATION_ROLE_ARN']?.trim() || null;
  if (gcpFederationRoleArn && !/^arn:aws:iam::\d{12}:role\/[\w+=,.@-]{1,64}$/.test(gcpFederationRoleArn)) throw new Error('MONKEY_GCP_FEDERATION_ROLE_ARN debe ser arn:aws:iam::<12 dígitos>:role/<nombre>.');
  return {
    backendUrl,
    runnerToken,
    engineImage,
    gcpFederationRoleArn,
    engineTimeoutMs: int(env, 'ENGINE_TIMEOUT_SECONDS', MAX_ENGINE_TIMEOUT_SECONDS, 60, MAX_ENGINE_TIMEOUT_SECONDS) * 1000,
    engineMemoryBytes: int(env, 'ENGINE_MEMORY_MB', 2048, 512, 16384) * 1024 * 1024,
    engineCpus: int(env, 'ENGINE_CPUS', 2, 1, 16),
    pollIntervalMs: int(env, 'POLL_INTERVAL_SECONDS', 5, 1, 300) * 1000,
    validationPollIntervalMs: int(env, 'VALIDATION_POLL_INTERVAL_SECONDS', 1, 1, 60) * 1000,
  };
}
