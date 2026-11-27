import Docker from 'dockerode';
import { RunNextExecution } from './application/run-next-execution';
import { RunEnrollment } from './application/run-enrollment';
import { RunSondaExecution } from './application/run-sonda-execution';
import { nodeTransport, WazuhApiClient } from './infrastructure/sonda/wazuh-api.client';
import { WazuhEnrollClient } from './infrastructure/sonda/wazuh-enroll.client';
import { RunnerLogger } from './domain/ports';
import { describeError } from './infrastructure/describe-error';
import { DockerScanEngine } from './infrastructure/docker-scan-engine';
import { HttpRunnerApi } from './infrastructure/http-runner-api';
import { loadRunnerConfig } from './infrastructure/runner-config';
import { createAwsAdapter } from './infrastructure/providers/aws/aws-adapter';
import { CloudAdapters, engineProfileFor, RoutingCredentialBroker, RoutingInventoryScanner } from './infrastructure/providers/cloud-adapters';
import { createGcpAdapter } from './infrastructure/providers/gcp/gcp-adapter';
import { createMicrosoft365Adapter } from './infrastructure/providers/microsoft365/microsoft-365-adapter';

// Punto de entrada del trabajador (D57): `node dist/runner/main.js`. Es la raíz de composición: aquí, y solo aquí, se eligen los adaptadores.
// Para correr el motor en la nube bastaría otro `ScanEngine`; el bucle y el backend no cambian.
class StdoutLogger extends RunnerLogger {
  info(message: string) {
    process.stdout.write(`${new Date().toISOString()} INFO  ${message}\n`);
  }
  error(message: string) {
    process.stderr.write(`${new Date().toISOString()} ERROR ${message}\n`);
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const MAX_BACKOFF_MS = 60_000;
const ORPHAN_SWEEP_MS = 10 * 60_000;

async function main() {
  const config = loadRunnerConfig(process.env);
  const log = new StdoutLogger();
  // DOCKER_HOST apunta al proxy de Docker (solo las rutas de contenedores), nunca al socket del servidor.
  // Un adaptador por nube (credencial, motor, inventario); el trabajo elige el suyo por su plataforma. GCP solo existe si este trabajador tiene la identidad de Monkey.
  // Microsoft 365 (D154) no necesita nada de este trabajador: la aplicación y el certificado de cada cliente llegan con el trabajo.
  const adapters: CloudAdapters = {
    aws: createAwsAdapter(config.engineImage),
    ...(config.gcpFederationRoleArn ? { gcp: createGcpAdapter(config.engineImage, config.gcpFederationRoleArn) } : {}),
    microsoft_365: createMicrosoft365Adapter(config.engineImage, config.microsoftApp),
  };
  const engine = new DockerScanEngine(new Docker(), engineProfileFor(adapters), {
    timeoutMs: config.engineTimeoutMs,
    memoryBytes: config.engineMemoryBytes,
    cpus: config.engineCpus,
  }, config.runnerId);
  const api = new HttpRunnerApi(config.backendUrl, config.runnerToken);
  const broker = new RoutingCredentialBroker(adapters);
  // La lectura de la sonda de servidores es opcional (D113): sin SONDA_API_URL este trabajador solo evalúa la nube.
  const sonda = config.sonda
    ? new RunSondaExecution(
        api,
        new WazuhApiClient(
          { baseUrl: config.sonda.apiUrl, username: config.sonda.username, password: config.sonda.password },
          nodeTransport({ ca: config.sonda.tlsCa ?? undefined, rejectUnauthorized: !config.sonda.tlsInsecure, serverName: config.sonda.tlsServerName ?? undefined }),
        ),
        log,
        config.sonda.supportedVersions,
      )
    : undefined;
  // Crear el agente de un servidor (D113): otra credencial de la sonda (de ALTA), otro carril. Sin SONDA_ENROLL_USER este trabajador no crea agentes.
  const enrollment = config.sonda?.enroll
    ? new RunEnrollment(
        api,
        new WazuhEnrollClient(
          { baseUrl: config.sonda.apiUrl, username: config.sonda.enroll.username, password: config.sonda.enroll.password },
          nodeTransport({ ca: config.sonda.tlsCa ?? undefined, rejectUnauthorized: !config.sonda.tlsInsecure, serverName: config.sonda.tlsServerName ?? undefined }),
        ),
        log,
        config.sonda.supportedVersions,
      )
    : undefined;
  // Carriles independientes (D58): una evaluación de minutos no puede hacer esperar la validación (ni el alta de un servidor) de un cliente que mira la pantalla.
  // Cada carril corre UNA ejecución a la vez; varios carriles del mismo tipo corren en paralelo. El reparto sin duplicados lo garantiza la cola del backend (`SKIP LOCKED`).
  const replicas = <T extends { name: string }>(count: number, make: () => T): T[] => Array.from({ length: count }, (_, i) => { const lane = make(); return { ...lane, name: `${lane.name} ${i + 1}` }; });
  const lanes = [
    ...replicas(config.validationConcurrency, () => ({ name: 'validación', step: new RunNextExecution(api, broker, engine, log, 'validation', new RoutingInventoryScanner(adapters), sonda), pollMs: config.validationPollIntervalMs })),
    ...replicas(config.engineConcurrency, () => ({ name: 'evaluación', step: new RunNextExecution(api, broker, engine, log, 'assessment', undefined, sonda), pollMs: config.pollIntervalMs })),
    ...(enrollment ? [{ name: 'alta de servidores', step: new RunNextExecution(api, broker, engine, log, 'enrollment', undefined, undefined, enrollment), pollMs: config.validationPollIntervalMs }] : []),
  ];

  const orphans = await engine.cleanupOrphans();
  log.info(
    `Trabajador listo (carriles: ${lanes.map((l) => l.name).join(', ')}). Motor: ${config.engineImage}. Nubes: ${Object.keys(adapters).join(', ')}. Contenedores huérfanos retirados: ${orphans}. ` +
      `Aplicación de Monkey para Microsoft 365: ${config.microsoftApp ? 'sí' : 'no'}. ` +
      `Sonda de servidores: ${config.sonda ? `sí (versiones ${config.sonda.supportedVersions.join(', ')})` : 'no'}.`,
  );

  let stopping = false;
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      log.info(`${signal} recibida: termina la corrida en curso y se detiene.`);
      stopping = true;
    });
  }

  const runLane = async (lane: (typeof lanes)[number]) => {
    let failures = 0;
    while (!stopping) {
      try {
        const result = await lane.step.execute();
        failures = 0;
        // Si había trabajo, se pide el siguiente de inmediato; si no, se espera.
        if (result === 'idle') await sleep(lane.pollMs);
      } catch (e) {
        // Un fallo de red o del backend no mata al trabajador: reintenta con espera creciente. Solo la clase y el código del error: nunca su contenido.
        failures += 1;
        const wait = Math.min(lane.pollMs * 2 ** failures, MAX_BACKOFF_MS);
        log.error(`Fallo del ciclo de ${lane.name} (${describeError(e)}); reintento en ${Math.round(wait / 1000)} s.`);
        await sleep(wait);
      }
    }
  };
  const sweeper = setInterval(() => {
    void engine.cleanupExpired().catch((e: unknown) => log.error(`No se pudieron retirar contenedores vencidos (${describeError(e)}).`));
  }, ORPHAN_SWEEP_MS);
  await Promise.all(lanes.map(runLane));
  clearInterval(sweeper);
  log.info('Trabajador detenido.');
}

main().catch((e: unknown) => {
  process.stderr.write(`El trabajador no pudo arrancar: ${e instanceof Error ? e.message : 'error desconocido'}\n`);
  process.exit(1);
});
