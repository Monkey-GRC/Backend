import Docker from 'dockerode';
import { extract } from 'tar-stream';
import type { Readable } from 'node:stream';
import { ScanEngine } from '../domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerFailure, TemporaryCredentials } from '../domain/runner.types';

// Cómo se invoca el motor dentro de su imagen. Es lo único que sabe de él: el resto del trabajador lo trata como una caja negra.
export type EngineProfile = {
  image: string;
  // Argumentos que van DESPUÉS del entrypoint de la imagen.
  command: (input: EngineInput) => string[];
  // El entorno del contenedor: aquí van las credenciales temporales de SU nube. Lanza RunnerFailure si las credenciales no son de esa nube.
  env: (input: EngineInput) => string[];
  // Dónde deja su resultado dentro del contenedor.
  outputPath: string;
  // Solo para pruebas con una imagen mínima; en producción se usa el entrypoint propio de la imagen del motor.
  entrypoint?: string[];
};

export type EngineLimits = { timeoutMs: number; memoryBytes: number; cpus: number };

const MAX_OUTPUT_BYTES = 200 * 1024 * 1024;
const LABEL = 'monkey.runner';

// Un contenedor efímero por corrida (D57):
//  - sin montajes del host ni volúmenes (el resultado se lee del propio contenedor antes de eliminarlo);
//  - en la red por defecto de Docker, NO en la del backend: no alcanza ni el backend ni la base de datos, solo internet;
//  - sin capacidades, sin escalada de privilegios, con memoria, CPU y procesos acotados;
//  - SIEMPRE se elimina, incluso si falla o vence el tiempo.
export class DockerScanEngine extends ScanEngine {
  private readonly readyImages = new Set<string>();

  constructor(
    private readonly docker: Docker,
    // Un perfil por nube (`providers/<nube>/`): se elige por las credenciales de la corrida. El aislamiento del contenedor es el mismo para todas (SEG-48).
    private readonly profileFor: (provider: TemporaryCredentials['provider']) => EngineProfile | undefined,
    private readonly limits: EngineLimits,
  ) {
    super();
  }

  async run(input: EngineInput): Promise<EngineRun> {
    const profile = this.profileFor(input.credentials.provider);
    if (!profile) throw new RunnerFailure(FAILURE.methodNotSupportedByRunner);
    // Valida antes de crear nada.
    const cmd = profile.command(input);
    const env = profile.env(input);
    await this.ensureImage(profile.image);
    const startedAt = new Date();
    const container = await this.docker.createContainer({
      Image: profile.image,
      ...(profile.entrypoint ? { Entrypoint: profile.entrypoint } : {}),
      Cmd: cmd,
      Env: env,
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
      const findings = await this.readFindings(container, profile.outputPath);
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

  private async ensureImage(image: string): Promise<void> {
    if (this.readyImages.has(image)) return;
    try {
      await this.docker.getImage(image).inspect();
    } catch {
      // No está en el servidor: se descarga una vez. (En producción conviene bajarla en el despliegue.)
      const stream = await this.docker.pull(image);
      await new Promise<void>((resolve, reject) => this.docker.modem.followProgress(stream, (err: Error | null) => (err ? reject(err) : resolve())));
    }
    this.readyImages.add(image);
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

  private async readFindings(container: Docker.Container, outputPath: string): Promise<unknown[]> {
    let raw: Buffer;
    try {
      raw = await readSingleFile((await container.getArchive({ path: outputPath })) as unknown as Readable, MAX_OUTPUT_BYTES);
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
