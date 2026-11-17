import { loadRunnerConfig, MAX_ENGINE_TIMEOUT_SECONDS } from './runner-config';

const ok = { RUNNER_TOKEN: 'tok', ENGINE_IMAGE: 'toniblyx/prowler:5.44.0' };

describe('loadRunnerConfig', () => {
  it('toma valores por defecto seguros', () => {
    expect(loadRunnerConfig(ok)).toEqual({
      backendUrl: 'http://backend:3000', runnerToken: 'tok', engineImage: 'toniblyx/prowler:5.44.0', gcpFederationRoleArn: null,
      engineTimeoutMs: MAX_ENGINE_TIMEOUT_SECONDS * 1000, engineMemoryBytes: 2048 * 1024 * 1024, engineCpus: 2, pollIntervalMs: 5000, validationPollIntervalMs: 1000, sonda: null,
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
  it('GCP: toma el rol de federación de Monkey y rechaza uno con mala forma', () => {
    const arn = 'arn:aws:iam::210987654321:role/monkey-gcp-federation';
    expect(loadRunnerConfig({ ...ok, MONKEY_GCP_FEDERATION_ROLE_ARN: arn }).gcpFederationRoleArn).toBe(arn);
    expect(() => loadRunnerConfig({ ...ok, MONKEY_GCP_FEDERATION_ROLE_ARN: 'monkey-gcp-federation' })).toThrow(/MONKEY_GCP_FEDERATION_ROLE_ARN/);
  });
  it('quita la barra final de la URL del backend', () => {
    expect(loadRunnerConfig({ ...ok, BACKEND_INTERNAL_URL: 'http://backend:3000//' }).backendUrl).toBe('http://backend:3000');
  });

  // La lectura de la sonda de servidores es opcional, pero si se configura queda COMPLETA o el trabajador no arranca (D113).
  describe('sonda de servidores', () => {
    const sonda = { SONDA_API_URL: 'https://sonda:55000', SONDA_API_USER: 'monkey_sync', SONDA_API_PASSWORD: 'clave', SONDA_SUPPORTED_VERSIONS: '4.14' };

    it('sin SONDA_API_URL el trabajador no la lee (solo evalúa la nube)', () => {
      expect(loadRunnerConfig(ok).sonda).toBeNull();
    });

    it('configurada: URL sin barra final, versiones por prefijo y TLS estricto por defecto', () => {
      expect(loadRunnerConfig({ ...ok, ...sonda, SONDA_API_URL: 'https://sonda:55000/', SONDA_SUPPORTED_VERSIONS: ' 4.14 , 4.15 ' }).sonda).toEqual({
        apiUrl: 'https://sonda:55000', username: 'monkey_sync', password: 'clave', supportedVersions: ['4.14', '4.15'], tlsCa: null, tlsInsecure: false, tlsServerName: null, enroll: null,
      });
    });

    describe('la credencial de ALTA de agentes (aparte de la de lectura)', () => {
      it('sin ella, el trabajador no crea agentes', () => {
        expect(loadRunnerConfig({ ...ok, ...sonda }).sonda!.enroll).toBeNull();
      });
      it('completa, queda configurada', () => {
        expect(loadRunnerConfig({ ...ok, ...sonda, SONDA_ENROLL_USER: 'monkey_enroll', SONDA_ENROLL_PASSWORD: 'otra-clave' }).sonda!.enroll).toEqual({ username: 'monkey_enroll', password: 'otra-clave' });
      });
      it.each([
        ['el usuario sin la clave', { SONDA_ENROLL_USER: 'monkey_enroll' }],
        ['la clave sin el usuario', { SONDA_ENROLL_PASSWORD: 'otra-clave' }],
      ])('rechaza %s (media credencial es una configuración equivocada)', (_n, extra) => {
        expect(() => loadRunnerConfig({ ...ok, ...sonda, ...extra })).toThrow(/SONDA_ENROLL/);
      });
      it('rechaza el MISMO usuario que el de lectura: dejaría de ser «solo lectura»', () => {
        expect(() => loadRunnerConfig({ ...ok, ...sonda, SONDA_ENROLL_USER: 'monkey_sync', SONDA_ENROLL_PASSWORD: 'x' })).toThrow(/distinto/);
      });
    });

    it('lee el certificado de la CA del archivo indicado', () => {
      const cfg = loadRunnerConfig({ ...ok, ...sonda, SONDA_CA_FILE: '/run/secrets/sonda-ca.pem' }, (p) => (p === '/run/secrets/sonda-ca.pem' ? 'PEM-DE-PRUEBA' : ''));
      expect(cfg.sonda!.tlsCa).toBe('PEM-DE-PRUEBA');
    });

    it('fija el nombre con el que se verifica el certificado fijado (conexión por IP a un certificado de `localhost`)', () => {
      const cfg = loadRunnerConfig({ ...ok, ...sonda, SONDA_CA_FILE: '/x.pem', SONDA_TLS_SERVER_NAME: 'localhost' }, () => 'PEM').sonda!;
      expect(cfg.tlsServerName).toBe('localhost');
      expect(cfg.tlsCa).toBe('PEM');
    });

    it.each([
      ['un nombre de certificado sin certificado fijado', { SONDA_TLS_SERVER_NAME: 'localhost' }, /junto con SONDA_CA_FILE/],
      ['un nombre de certificado que no es un host', { SONDA_CA_FILE: '/x.pem', SONDA_TLS_SERVER_NAME: 'a b/c' }, /nombre de host/],
      ['sin usuario', { SONDA_API_USER: '' }, /SONDA_API_USER/],
      ['sin clave', { SONDA_API_PASSWORD: '' }, /SONDA_API_PASSWORD/],
      ['sin lista de versiones soportadas', { SONDA_SUPPORTED_VERSIONS: '' }, /SONDA_SUPPORTED_VERSIONS/],
      ['una versión que no es un prefijo', { SONDA_SUPPORTED_VERSIONS: 'latest' }, /SONDA_SUPPORTED_VERSIONS/],
      ['una URL con ruta', { SONDA_API_URL: 'https://sonda:55000/security' }, /SONDA_API_URL/],
      ['una URL sin esquema', { SONDA_API_URL: 'sonda:55000' }, /SONDA_API_URL/],
      ['TLS inseguro en producción', { SONDA_TLS_INSECURE: 'true', NODE_ENV: 'production' }, /producción/],
      ['TLS inseguro y un certificado a la vez', { SONDA_TLS_INSECURE: 'true', SONDA_CA_FILE: '/x.pem' }, /no los dos/],
    ])('rechaza %s', (_n, extra, msg) => {
      expect(() => loadRunnerConfig({ ...ok, ...sonda, ...extra }, () => 'PEM')).toThrow(msg);
    });

    it('el TLS inseguro se permite fuera de producción (la sonda de pruebas usa un certificado propio)', () => {
      expect(loadRunnerConfig({ ...ok, ...sonda, SONDA_TLS_INSECURE: 'true' }).sonda!.tlsInsecure).toBe(true);
    });
  });
});
