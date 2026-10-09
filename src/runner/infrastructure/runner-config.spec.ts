import { loadRunnerConfig, MAX_ENGINE_TIMEOUT_SECONDS } from './runner-config';

const ok = { RUNNER_TOKEN: 'tok', ENGINE_IMAGE: 'toniblyx/prowler:5.44.0' };

describe('loadRunnerConfig', () => {
  it('toma valores por defecto seguros', () => {
    expect(loadRunnerConfig(ok)).toEqual({
      backendUrl: 'http://backend:3000', runnerToken: 'tok', engineImage: 'toniblyx/prowler:5.44.0',
      engineTimeoutMs: MAX_ENGINE_TIMEOUT_SECONDS * 1000, engineMemoryBytes: 2048 * 1024 * 1024, engineCpus: 2, pollIntervalMs: 5000, validationPollIntervalMs: 1000,
    });
  });
  it('acepta una imagen fijada por digest', () => {
    expect(loadRunnerConfig({ ...ok, ENGINE_IMAGE: 'toniblyx/prowler@sha256:9dbcc3c9abcd' }).engineImage).toContain('@sha256:');
  });
  it.each([
    ['sin token', { ENGINE_IMAGE: ok.ENGINE_IMAGE }, /RUNNER_TOKEN/],
    ['sin imagen', { RUNNER_TOKEN: 'x' }, /ENGINE_IMAGE/],
    ['imagen sin versión', { ...ok, ENGINE_IMAGE: 'toniblyx/prowler' }, /versión|digest/],
    ['imagen latest', { ...ok, ENGINE_IMAGE: 'toniblyx/prowler:latest' }, /latest/],
    ['tiempo mayor que el barrido del backend', { ...ok, ENGINE_TIMEOUT_SECONDS: '3600' }, /ENGINE_TIMEOUT_SECONDS/],
    ['memoria absurda', { ...ok, ENGINE_MEMORY_MB: '10' }, /ENGINE_MEMORY_MB/],
    ['no numérico', { ...ok, POLL_INTERVAL_SECONDS: 'abc' }, /POLL_INTERVAL_SECONDS/],
  ])('rechaza %s', (_n, env, msg) => {
    expect(() => loadRunnerConfig(env)).toThrow(msg);
  });
  it('quita la barra final de la URL del backend', () => {
    expect(loadRunnerConfig({ ...ok, BACKEND_INTERNAL_URL: 'http://backend:3000//' }).backendUrl).toBe('http://backend:3000');
  });
});
