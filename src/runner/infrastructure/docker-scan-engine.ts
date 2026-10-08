import Docker from 'dockerode';
import { extract } from 'tar-stream';
import type { Readable } from 'node:stream';
import { ScanEngine } from '../domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerFailure } from '../domain/runner.types';

// Cómo se invoca el motor dentro de su imagen. Es lo único que sabe de él: el resto del trabajador lo trata como una caja negra.
export type EngineProfile = {
  image: string;
  // Argumentos que van DESPUÉS del entrypoint de la imagen.
  command: (input: EngineInput) => string[];
  // Dónde deja su resultado dentro del contenedor.
  outputPath: string;
  // Solo para pruebas con una imagen mínima; en producción se usa el entrypoint propio de la imagen del motor.
  entrypoint?: string[];
};

export type EngineLimits = { timeoutMs: number; memoryBytes: number; cpus: number };

// Las regiones llegan del backend, pero se validan aquí también: ningún valor llega a la línea de comandos del motor sin revisar.
const REGION = /^[a-z]{2,4}(-[a-z]+){1,2}-\d$/;
const MAX_REGIONS = 20;
const OUTPUT_DIR = '/home/prowler/output';

export function prowlerAwsProfile(image: string): EngineProfile {
  return {
    image,
    outputPath: `${OUTPUT_DIR}/scan.ocsf.json`,
    command: ({ regions }) => {
      if (regions.length === 0 || regions.length > MAX_REGIONS || !regions.every((r) => REGION.test(r))) throw new RunnerFailure(FAILURE.engineFailed, 'regiones inválidas');
      // -z: el motor sale con código 3 cuando hay hallazgos; eso no es un fallo de la corrida.
      return ['aws', '-f', ...regions, '-M', 'json-ocsf', '-F', 'scan', '-o', OUTPUT_DIR, '--no-banner', '--ignore-exit-code-3', '--log-level', 'ERROR'];
    },
  };
}

const MAX_OUTPUT_BYTES = 200 * 1024 * 1024;
const LABEL = 'monkey.runner';

// Un contenedor efímero por corrida (D57):
//  - sin montajes del host ni volúmenes (el resultado se lee del propio contenedor antes de eliminarlo);
//  - en la red por defecto de Docker, NO en la del backend: no alcanza ni el backend ni la base de datos, solo internet;
//  - sin capacidades, sin escalada de privilegios, con memoria, CPU y procesos acotados;
//  - SIEMPRE se elimina, incluso si falla o vence el tiempo.
export class DockerScanEngine extends ScanEngine {
  private imageReady = false;

  constructor(
    private readonly docker: Docker,
    private readonly profile: EngineProfile,
    private readonly limits: EngineLimits,
  ) {
    super();
  }

  async run(input: EngineInput): Promise<EngineRun> {
    const cmd = this.profile.command(input); // valida antes de crear nada
    await this.ensureImage();
    const startedAt = new Date();
    const { accessKeyId, secretAccessKey, sessionToken } = input.credentials;
    const container = await this.docker.createContainer({
      Image: this.profile.image,
      ...(this.profile.entrypoint ? { Entrypoint: this.profile.entrypoint } : {}),
      Cmd: cmd,
      Env: ['AWS_DEFAULT_REGION=us-east-1', `AWS_ACCESS_KEY_ID=${accessKeyId}`, `AWS_SECRET_ACCESS_KEY=${secretAccessKey}`, ...(sessionToken ? [`AWS_SESSION_TOKEN=${sessionToken}`] : [])],
      Labels: { [LABEL]: '1', 'monkey.execution': input.executionId },
      HostConfig: {
        Memory: this.limits.memoryBytes,
        MemorySwap: this.limits.memoryBytes, // sin swap
        NanoCpus: this.limits.cpus * 1e9,
        PidsLimit: 512,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges:true'],
        NetworkMode: 'bridge',
        Privileged: false,
        AutoRemove: false, // se elimina a mano: antes hay que leer el resultado
      },
    });
    try {
      await container.start();
      const status = await this.waitWithTimeout(container);
      if (status === 'timeout') throw new RunnerFailure(FAILURE.engineTimeout);
      if (status !== 0) throw new RunnerFailure(FAILURE.engineFailed, `el motor terminó con código ${status}`);
      const findings = await this.readFindings(container);
      return { engineVersion: versionOf(findings), startedAt, finishedAt: new Date(), findings };
    } finally {
      await container.remove({ force: true, v: true }).catch(() => undefined);
    }
  }

  async cleanupOrphans(): Promise<number> {
    const orphans = await this.docker.listContainers({ all: true, filters: { label: [`${LABEL}=1`] } });
    await Promise.all(orphans.map((c) => this.docker.getContainer(c.Id).remove({ force: true, v: true }).catch(() => undefined)));
    return orphans.length;
  }

  private async ensureImage(): Promise<void> {
    if (this.imageReady) return;
    try {
      await this.docker.getImage(this.profile.image).inspect();
    } catch {
      // No está en el servidor: se descarga una vez. (En producción conviene bajarla en el despliegue.)
      const stream = await this.docker.pull(this.profile.image);
      await new Promise<void>((resolve, reject) => this.docker.modem.followProgress(stream, (err: Error | null) => (err ? reject(err) : resolve())));
    }
    this.imageReady = true;
  }

  private async waitWithTimeout(container: Docker.Container): Promise<number | 'timeout'> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), this.limits.timeoutMs);
    });
    try {
      const result = await Promise.race([container.wait().then((r) => r.StatusCode), timeout]);
      if (result === 'timeout') await container.kill().catch(() => undefined);
      return result;
    } finally {
      clearTimeout(timer);
    }
  }

  private async readFindings(container: Docker.Container): Promise<unknown[]> {
    let raw: Buffer;
    try {
      raw = await readSingleFile((await container.getArchive({ path: this.profile.outputPath })) as unknown as Readable, MAX_OUTPUT_BYTES);
    } catch {
      throw new RunnerFailure(FAILURE.engineFailed, 'el motor no dejó resultado');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new RunnerFailure(FAILURE.outputInvalid, 'el resultado no es JSON');
    }
    if (!Array.isArray(parsed)) throw new RunnerFailure(FAILURE.outputInvalid, 'el resultado no es una lista');
    return parsed;
  }
}

function versionOf(findings: unknown[]): string {
  const first = findings[0] as { metadata?: { product?: { version?: unknown } } } | undefined;
  const v = first?.metadata?.product?.version;
  return typeof v === 'string' && v ? v : 'unknown';
}

// Lee el único archivo de un tar, con tope de tamaño.
async function readSingleFile(archive: Readable, maxBytes: number): Promise<Buffer> {
  const parser = extract();
  archive.pipe(parser);
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const entry of parser) {
    for await (const chunk of entry as AsyncIterable<Buffer>) {
      total += chunk.length;
      if (total > maxBytes) throw new Error('resultado demasiado grande');
      chunks.push(chunk);
    }
  }
  if (chunks.length === 0) throw new Error('archivo vacío');
  return Buffer.concat(chunks);
}
