import Docker from 'dockerode';
import { FAILURE, RunnerFailure } from '../../src/runner/domain/runner.types';
import { DockerScanEngine, EngineProfile } from '../../src/runner/infrastructure/docker-scan-engine';
import { prowlerAwsProfile } from '../../src/runner/infrastructure/providers/aws/aws-engine-profile';

// D57, SEG-46: el adaptador de Docker contra Docker de verdad, con una imagen mínima (no el motor real): lo que se comprueba es el
// ENVOLTORIO (aislamiento, límites, limpieza, lectura del resultado), no el análisis. Si Docker no está, la prueba FALLA: una prueba de seguridad
// que se salta en silencio da una falsa tranquilidad. Para saltarla a propósito: SKIP_DOCKER_TESTS=1.
const IMAGE = 'alpine:3.20';
const docker = new Docker();
const LIMITS = { timeoutMs: 20_000, memoryBytes: 256 * 1024 * 1024, cpus: 1 };
const creds = { provider: 'aws' as const, accessKeyId: 'ASIATEMPORAL', secretAccessKey: 'secreto-temporal', sessionToken: 'token-de-sesion' };
const input = { executionId: 'exec-test-1', accountId: '123456789012', regions: ['us-east-1'], credentials: creds };

// Una «imagen del motor» de mentira: el script recibido como argumento escribe su resultado donde el adaptador lo espera.
const profile = (script: string): EngineProfile => ({ image: IMAGE, entrypoint: ['sh', '-c'], outputPath: '/out/scan.ocsf.json', command: () => [`mkdir -p /out && ${script}`], env: prowlerAwsProfile(IMAGE).env });
const engine = (script: string, limits = LIMITS) => new DockerScanEngine(docker, (provider) => (provider === 'aws' ? profile(script) : undefined), limits);
const leftovers = () => docker.listContainers({ all: true, filters: { label: ['monkey.runner=1'] } });

const dockerUp = docker.ping().then(() => true, () => false);
beforeAll(async () => {
  if (!(await dockerUp)) {
    if (process.env['SKIP_DOCKER_TESTS'] === '1') return;
    throw new Error('Docker no responde. Estas pruebas comprueban el aislamiento del motor; para saltarlas a propósito usa SKIP_DOCKER_TESTS=1.');
  }
  await docker.getImage(IMAGE).inspect().catch(async () => {
    const s = await docker.pull(IMAGE);
    await new Promise<void>((res, rej) => docker.modem.followProgress(s, (e: Error | null) => (e ? rej(e) : res())));
  });
}, 120_000);
beforeEach(async () => {
  if (!(await dockerUp)) return;
  await engine('true').cleanupOrphans();
});

const maybe = process.env['SKIP_DOCKER_TESTS'] === '1' ? describe.skip : describe;

maybe('DockerScanEngine (Docker real)', () => {
  it('lee el resultado del contenedor y la versión del motor, y deja ningún contenedor atrás', async () => {
    const run = await engine(`printf '[{"metadata":{"product":{"version":"9.9.9"}},"x":1}]' > /out/scan.ocsf.json`).run(input);
    expect(run.findings).toEqual([{ metadata: { product: { version: '9.9.9' } }, x: 1 }]);
    expect(run.engineVersion).toBe('9.9.9');
    expect(run.finishedAt.getTime()).toBeGreaterThanOrEqual(run.startedAt.getTime());
    expect(await leftovers()).toHaveLength(0);
  });

  it('el motor recibe las credenciales temporales en su entorno', async () => {
    const run = await engine(`printf '["%s","%s","%s"]' "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" "$AWS_SESSION_TOKEN" > /out/scan.ocsf.json`).run(input);
    expect(run.findings).toEqual(['ASIATEMPORAL', 'secreto-temporal', 'token-de-sesion']);
  });

  it('corre sin capacidades, sin escalada de privilegios y con los límites pedidos', async () => {
    const run = await engine(`printf '["%s","%s"]' "$(grep CapEff /proc/self/status | cut -d: -f2 | tr -d '[:space:]')" "$(grep NoNewPrivs /proc/self/status | cut -d: -f2 | tr -d '[:space:]')" > /out/scan.ocsf.json`).run(input);
    expect(run.findings).toEqual(['0000000000000000', '1']);
  });

  it('NO comparte red con el resto de servicios (red por defecto de Docker, no la del backend)', async () => {
    const seen: { net?: string; mem?: number; caps?: string[] | null; binds?: unknown } = {};
    const e = engine(`sleep 3; printf '[]' > /out/scan.ocsf.json`);
    const promise = e.run(input);
    await new Promise((r) => setTimeout(r, 1200));
    const [c] = await leftovers();
    const info = await docker.getContainer(c.Id).inspect();
    seen.net = info.HostConfig.NetworkMode;
    seen.mem = info.HostConfig.Memory;
    seen.caps = info.HostConfig.CapDrop;
    seen.binds = info.HostConfig.Binds;
    await promise;
    expect(seen.net).toBe('bridge');
    expect(seen.mem).toBe(LIMITS.memoryBytes);
    expect(seen.caps).toEqual(['ALL']);
    expect(seen.binds ?? []).toEqual([]); // ningún montaje del servidor
    expect(Object.keys(info.NetworkSettings.Networks)).toEqual(['bridge']);
  });

  it('un código de salida distinto de 0 es engine_failed, y el contenedor se elimina igual', async () => {
    await expect(engine('exit 7').run(input)).rejects.toMatchObject({ reason: FAILURE.engineFailed });
    expect(await leftovers()).toHaveLength(0);
  });

  it('si vence el tiempo, mata el motor, informa engine_timeout y elimina el contenedor', async () => {
    const t0 = Date.now();
    await expect(engine('sleep 60', { ...LIMITS, timeoutMs: 1500 }).run(input)).rejects.toMatchObject({ reason: FAILURE.engineTimeout });
    expect(Date.now() - t0).toBeLessThan(15_000);
    expect(await leftovers()).toHaveLength(0);
  });

  it('un motor que termina bien pero no deja resultado es engine_failed', async () => {
    await expect(engine('true').run(input)).rejects.toMatchObject({ reason: FAILURE.engineFailed });
  });

  it('una salida que no es JSON, o no es una lista, es output_invalid', async () => {
    await expect(engine(`printf 'no es json' > /out/scan.ocsf.json`).run(input)).rejects.toMatchObject({ reason: FAILURE.outputInvalid });
    await expect(engine(`printf '{"a":1}' > /out/scan.ocsf.json`).run(input)).rejects.toMatchObject({ reason: FAILURE.outputInvalid });
  });

  it('retira al arrancar los contenedores huérfanos de una corrida interrumpida', async () => {
    const orphan = await docker.createContainer({ Image: IMAGE, Cmd: ['sleep', '60'], Labels: { 'monkey.runner': '1' } });
    await orphan.start();
    expect(await leftovers()).toHaveLength(1);
    expect(await engine('true').cleanupOrphans()).toBe(1);
    expect(await leftovers()).toHaveLength(0);
  });

  it('un resultado grande (varios MB) se lee completo', async () => {
    const run = await engine(`i=0; { printf '['; while [ $i -lt 20000 ]; do [ $i -gt 0 ] && printf ','; printf '{"i":%d,"relleno":"%0200d"}' $i 0; i=$((i+1)); done; printf ']'; } > /out/scan.ocsf.json`).run(input);
    expect(run.findings).toHaveLength(20000);
  }, 60_000);
});

describe('prowlerAwsProfile', () => {
  const p = prowlerAwsProfile('toniblyx/prowler:5.44.0');
  it('arma el comando del motor con las regiones declaradas', () => {
    const cmd = p.command({ ...input, regions: ['us-east-1', 'us-east-2'] });
    expect(cmd.slice(0, 4)).toEqual(['aws', '-f', 'us-east-1', 'us-east-2']);
    expect(cmd).toEqual(expect.arrayContaining(['-M', 'json-ocsf', '--ignore-exit-code-3']));
  });
  it.each([[[]], [['us-east-1; rm -rf /']], [['--role']], [['US-EAST-1']], [Array.from({ length: 21 }, () => 'us-east-1')]])('rechaza regiones inválidas %j antes de tocar Docker', (regions) => {
    expect(() => p.command({ ...input, regions })).toThrow(RunnerFailure);
  });
});
