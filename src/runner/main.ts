import Docker from 'dockerode';
import { RunNextExecution } from './application/run-next-execution';
import { RunnerLogger } from './domain/ports';
import { describeError } from './infrastructure/describe-error';
import { DockerScanEngine, prowlerAwsProfile } from './infrastructure/docker-scan-engine';
import { HttpRunnerApi } from './infrastructure/http-runner-api';
import { loadRunnerConfig } from './infrastructure/runner-config';
import { StsCredentialBroker } from './infrastructure/sts-credential-broker';

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

async function main() {
  const config = loadRunnerConfig(process.env);
  const log = new StdoutLogger();
  // DOCKER_HOST apunta al proxy de Docker (solo las rutas de contenedores), nunca al socket del servidor.
  const engine = new DockerScanEngine(new Docker(), prowlerAwsProfile(config.engineImage), {
    timeoutMs: config.engineTimeoutMs,
    memoryBytes: config.engineMemoryBytes,
    cpus: config.engineCpus,
  });
  const step = new RunNextExecution(new HttpRunnerApi(config.backendUrl, config.runnerToken), new StsCredentialBroker(), engine, log);

  const orphans = await engine.cleanupOrphans();
  log.info(`Trabajador listo. Motor: ${config.engineImage}. Contenedores huérfanos retirados: ${orphans}.`);

  let stopping = false;
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      log.info(`${signal} recibida: termina la corrida en curso y se detiene.`);
      stopping = true;
    });
  }

  let failures = 0;
  while (!stopping) {
    try {
      const result = await step.execute();
      failures = 0;
      // Si había trabajo, se pide el siguiente de inmediato; si no, se espera.
      if (result === 'idle') await sleep(config.pollIntervalMs);
    } catch (e) {
      // Un fallo de red o del backend no mata al trabajador: reintenta con espera creciente. Solo la clase y el código del error: nunca su contenido.
      failures += 1;
      const wait = Math.min(config.pollIntervalMs * 2 ** failures, MAX_BACKOFF_MS);
      log.error(`Fallo del ciclo (${describeError(e)}); reintento en ${Math.round(wait / 1000)} s.`);
      await sleep(wait);
    }
  }
  log.info('Trabajador detenido.');
}

main().catch((e: unknown) => {
  process.stderr.write(`El trabajador no pudo arrancar: ${e instanceof Error ? e.message : 'error desconocido'}\n`);
  process.exit(1);
});
