import { ConfigService } from '@nestjs/config';
import { AgentInstallConfig } from './agent-install-config';

const base = { SONDA_MANAGER_HOST: 'sonda.monkey.example', SONDA_AGENT_VERSION: '4.14.6', AGENT_INSTALLER_BASE_URL: 'https://api.monkey.example/v1/install' };
const config = (env: Record<string, string | undefined>) => new AgentInstallConfig(new ConfigService(env));

describe('AgentInstallConfig (D112)', () => {
  it('configurada: puerto 1514 y 15 minutos por defecto, y la dirección sin barra final', () => {
    expect(config({ ...base, AGENT_INSTALLER_BASE_URL: 'https://api.monkey.example/v1/install///' }).get()).toEqual({
      managerHost: 'sonda.monkey.example', managerPort: 1514, agentVersion: '4.14.6', installerBaseUrl: 'https://api.monkey.example/v1/install', keyTtlMinutes: 15,
    });
  });

  it('acepta valores propios', () => {
    expect(config({ ...base, SONDA_MANAGER_PORT: '51514', AGENT_INSTALL_KEY_TTL_MINUTES: '5' }).get()).toMatchObject({ managerPort: 51514, keyTtlMinutes: 5 });
  });

  it.each([
    ['sin la dirección de Monkey', { SONDA_MANAGER_HOST: undefined }],
    ['sin la versión del programa', { SONDA_AGENT_VERSION: undefined }],
    ['con una versión que no es fija («latest»)', { SONDA_AGENT_VERSION: 'latest' }],
    ['sin la dirección de los instaladores', { AGENT_INSTALLER_BASE_URL: undefined }],
    ['con una dirección de instaladores peligrosa', { AGENT_INSTALLER_BASE_URL: "https://x/'; id #" }],
    ['con una dirección de Monkey con espacios', { SONDA_MANAGER_HOST: 'a b' }],
    ['con un puerto absurdo', { SONDA_MANAGER_PORT: '99999' }],
    ['con una clave que vive horas', { AGENT_INSTALL_KEY_TTL_MINUTES: '600' }],
    ['con una clave que vive 0 minutos', { AGENT_INSTALL_KEY_TTL_MINUTES: '0' }],
    ['con una vida de la clave que no es un número', { AGENT_INSTALL_KEY_TTL_MINUTES: 'mucho' }],
  ])('%s: no está disponible (null), no se arma un comando roto ni inseguro', (_n, over) => {
    expect(config({ ...base, ...over }).get()).toBeNull();
  });
});
