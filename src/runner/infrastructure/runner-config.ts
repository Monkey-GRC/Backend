import { readFileSync } from 'node:fs';

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
  // La lectura de la sonda de servidores (D113). null = este trabajador no la lee.
  sonda: SondaConfig | null;
};

export type SondaConfig = {
  apiUrl: string;
  // Usuario de SOLO LECTURA (`monkey_sync`). La clave vive únicamente aquí, nunca en el backend.
  username: string;
  password: string;
  // Prefijos de versión que sabemos leer (`4.14`). Fuera de la lista, el trabajador se niega a leer en vez de adivinar.
  supportedVersions: string[];
  // Certificado (PEM) de la CA de la sonda, ya leído. null si el certificado es de confianza pública.
  tlsCa: string | null;
  // Solo desarrollo: acepta el certificado propio de la sonda de pruebas.
  tlsInsecure: boolean;
  // El nombre con el que se comprueba el certificado fijado (SONDA_CA_FILE) cuando se conecta por IP y el certificado es de otro nombre (p. ej. localhost). Solo con certificado fijado.
  tlsServerName: string | null;
  // Usuario de ALTA (`monkey_enroll`): crea y retira agentes y grupos de la sonda, y nada más. Aparte del de lectura, a propósito: así quien solo lee nunca puede escribir.
  // null: este trabajador no crea agentes.
  enroll: { username: string; password: string } | null;
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

export function loadRunnerConfig(env: Record<string, string | undefined>, readFile: (path: string) => string = (p) => readFileSync(p, 'utf8')): RunnerConfig {
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
    sonda: loadSondaConfig(env, readFile),
  };
}

// La sonda es opcional: sin `SONDA_API_URL` el trabajador solo evalúa la nube. Si se configura, tiene que quedar COMPLETA o no arranca (misma regla de arriba).
function loadSondaConfig(env: Record<string, string | undefined>, readFile: (path: string) => string): SondaConfig | null {
  const apiUrl = env['SONDA_API_URL']?.trim().replace(/\/+$/, '');
  if (!apiUrl) return null;
  if (!/^https?:\/\/[^\s/]+$/.test(apiUrl)) throw new Error('SONDA_API_URL debe ser una URL con esquema y puerto, sin ruta (p. ej. https://sonda:55000).');
  const username = env['SONDA_API_USER']?.trim();
  const password = env['SONDA_API_PASSWORD'];
  if (!username || !password) throw new Error('Faltan SONDA_API_USER y SONDA_API_PASSWORD (el usuario de SOLO lectura de la sonda).');
  const supportedVersions = (env['SONDA_SUPPORTED_VERSIONS'] ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  if (supportedVersions.length === 0 || supportedVersions.some((v) => !/^\d+(\.\d+){1,2}$/.test(v))) {
    // Sin lista no hay forma de saber si una actualización de la sonda cambió algo que leemos: se exige decirlo (D113).
    throw new Error('SONDA_SUPPORTED_VERSIONS debe listar las versiones que sabemos leer, por prefijo (p. ej. 4.14).');
  }
  const tlsInsecure = env['SONDA_TLS_INSECURE']?.trim().toLowerCase() === 'true';
  // Aceptar cualquier certificado deja a quien se interponga leer y cambiar lo que viaja entre el trabajador y la sonda, incluida la clave.
  if (tlsInsecure && env['NODE_ENV'] === 'production') throw new Error('SONDA_TLS_INSECURE no está permitido en producción: configura SONDA_CA_FILE.');
  const caFile = env['SONDA_CA_FILE']?.trim();
  if (tlsInsecure && caFile) throw new Error('Usa SONDA_TLS_INSECURE o SONDA_CA_FILE, no los dos.');
  const serverName = env['SONDA_TLS_SERVER_NAME']?.trim() || null;
  if (serverName && !/^[A-Za-z0-9.-]+$/.test(serverName)) throw new Error('SONDA_TLS_SERVER_NAME debe ser un nombre de host (p. ej. localhost).');
  // Sin certificado fijado no hay nada contra qué comparar el nombre: cambiarlo solo serviría para aceptar un nombre que no es.
  if (serverName && !caFile) throw new Error('SONDA_TLS_SERVER_NAME solo se usa junto con SONDA_CA_FILE (el certificado fijado).');
  // La credencial de alta es opcional, pero va completa o no va: media credencial es una configuración equivocada.
  const enrollUser = env['SONDA_ENROLL_USER']?.trim();
  const enrollPassword = env['SONDA_ENROLL_PASSWORD'];
  if (Boolean(enrollUser) !== Boolean(enrollPassword)) throw new Error('Faltan SONDA_ENROLL_USER o SONDA_ENROLL_PASSWORD (el usuario de ALTA de agentes de la sonda).');
  // Si fueran el mismo usuario, «solo lectura» dejaría de ser verdad: la credencial de lectura podría crear y borrar agentes.
  if (enrollUser && enrollUser === username) throw new Error('El usuario de alta (SONDA_ENROLL_USER) tiene que ser distinto del de lectura (SONDA_API_USER).');
  return { apiUrl, username, password, supportedVersions, tlsCa: caFile ? readFile(caFile) : null, tlsInsecure, tlsServerName: serverName, enroll: enrollUser && enrollPassword ? { username: enrollUser, password: enrollPassword } : null };
}
