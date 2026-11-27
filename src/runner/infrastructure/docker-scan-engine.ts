import Docker from 'dockerode';
import { extract, pack } from 'tar-stream';
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
  // Archivos que se copian al contenedor antes de arrancar (sin montajes del servidor). Nunca llevan credenciales: esas van por el entorno.
  files?: { path: string; content: string }[];
  // El motor informa su avance con líneas «MONKEY_PROGRESS hechas total».
  reportsProgress?: boolean;
  // El entrypoint propio de esa nube; sin él, el de la imagen del motor (las pruebas lo usan con una imagen mínima).
  entrypoint?: string[];
};

export type EngineLimits = { timeoutMs: number; memoryBytes: number; cpus: number };

const MAX_OUTPUT_BYTES = 200 * 1024 * 1024;
const LABEL = 'monkey.runner';
const OWNER_LABEL = 'monkey.runner.id';
// Ninguna corrida viva pasa de 25 min (MAX_ENGINE_TIMEOUT_SECONDS): un contenedor más viejo que esto está huérfano, sea de quien sea.
export const ORPHAN_AGE_MS = 30 * 60_000;

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
    private readonly runnerId: string = 'default',
    private readonly now: () => number = Date.now,
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
      Labels: { [LABEL]: '1', [OWNER_LABEL]: this.runnerId, 'monkey.execution': input.executionId },
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
      for (const file of profile.files ?? []) await copyInto(container, file);
      await container.start();
      if (profile.reportsProgress && input.onProgress) await followProgress(container, input.onProgress);
      const status = await this.waitWithTimeout(container);
      if (status === 'timeout') throw new RunnerFailure(FAILURE.engineTimeout);
      if (status !== 0) throw new RunnerFailure(FAILURE.engineFailed, `el motor terminó con código ${status}`);
      const findings = await this.readFindings(container, profile.outputPath);
      return { engineVersion: versionOf(findings), startedAt, finishedAt: new Date(), findings };
    } finally {
      await container.remove({ force: true, v: true }).catch(() => undefined);
    }
  }

  // Solo al ARRANCAR (este trabajador aún no tiene corridas): retira lo suyo y lo vencido. Nunca la corrida en curso de otro trabajador del mismo servidor.
  cleanupOrphans(): Promise<number> {
    return this.removeContainers((c) => c.Labels?.[OWNER_LABEL] === this.runnerId || this.isExpired(c));
  }

  // Mientras trabaja: solo lo vencido (p. ej. lo que dejó un trabajador que ya no existe y que aún llevaría credenciales).
  cleanupExpired(): Promise<number> {
    return this.removeContainers((c) => this.isExpired(c));
  }

  private isExpired(c: Docker.ContainerInfo): boolean {
    return this.now() - c.Created * 1000 > ORPHAN_AGE_MS;
  }

  private async removeContainers(which: (c: Docker.ContainerInfo) => boolean): Promise<number> {
    const orphans = (await this.docker.listContainers({ all: true, filters: { label: [`${LABEL}=1`] } })).filter(which);
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

// Copia un archivo de texto al contenedor (aún sin arrancar), dentro de un tar.
async function copyInto(container: Docker.Container, file: { path: string; content: string }): Promise<void> {
  const slash = file.path.lastIndexOf('/');
  const archive = pack();
  archive.entry({ name: file.path.slice(slash + 1), mode: 0o644 }, file.content);
  archive.finalize();
  await container.putArchive(archive as unknown as NodeJS.ReadableStream, { path: file.path.slice(0, slash) || '/' });
}

const PROGRESS_LINE = /MONKEY_PROGRESS (\d{1,6}) (\d{1,6})\r?\n/g;

// Sigue la salida del contenedor solo para leer el avance. No se guarda ni se registra nada más. Si no se puede seguir, la corrida continúa sin avance.
async function followProgress(container: Docker.Container, onProgress: (done: number, total: number) => void): Promise<void> {
  try {
    const stream = (await container.logs({ follow: true, stdout: true, stderr: false })) as unknown as Readable;
    let pending = '';
    stream.on('data', (chunk: Buffer) => {
      pending += chunk.toString('utf8');
      let consumed = 0;
      for (const match of pending.matchAll(PROGRESS_LINE)) {
        onProgress(Number(match[1]), Number(match[2]));
        consumed = match.index + match[0].length;
      }
      // Se conserva solo el final: lo que puede ser el principio de la siguiente línea.
      pending = pending.slice(consumed).slice(-200);
    });
    stream.on('error', () => undefined);
  } catch {
    /* sin avance */
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
