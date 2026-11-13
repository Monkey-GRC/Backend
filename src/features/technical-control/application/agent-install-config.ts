import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { invalidInstallParams } from '../domain/agent-install/install-command';

// Lo que hace falta para armar el comando de instalación (D113). Todo sale de la configuración de esta instalación de Monkey: nada de esto vive en el código.
export type InstallConfig = {
  // A dónde se conecta cada servidor del cliente (de SALIDA, puerto 1514 por defecto). Es la dirección de Monkey, no la del cliente.
  managerHost: string;
  managerPort: number;
  // La versión FIJADA del programa (la misma del manager). Nunca «la última».
  agentVersion: string;
  // Dónde sirve este backend los instaladores (`https://api.ejemplo.com/v1/install`), sin barra final.
  installerBaseUrl: string;
  // Cuánto vive, cifrada, la clave de un servidor mientras el navegador la pide (se borra al leerla).
  keyTtlMinutes: number;
};

const DEFAULT_PORT = 1514;
const DEFAULT_TTL_MINUTES = 15;
// Valores de relleno con forma válida: solo sirven para comprobar la configuración con las mismas reglas que el comando.
const PLACEHOLDER = { os: 'linux', assetId: '00000000-0000-4000-8000-000000000000', key: 'A'.repeat(40) };

@Injectable()
export class AgentInstallConfig {
  constructor(private readonly config: ConfigService) {}

  /** null si falta algo o no es válido: la instalación de la sonda no está disponible en esta instalación (503), en vez de armar un comando roto o inseguro. */
  get(): InstallConfig | null {
    const text = (k: string) => this.config.get<string>(k)?.trim() || '';
    const port = Number(text('SONDA_MANAGER_PORT') || DEFAULT_PORT);
    const ttl = Number(text('AGENT_INSTALL_KEY_TTL_MINUTES') || DEFAULT_TTL_MINUTES);
    const cfg = {
      managerHost: text('SONDA_MANAGER_HOST'),
      managerPort: port,
      agentVersion: text('SONDA_AGENT_VERSION'),
      installerBaseUrl: text('AGENT_INSTALLER_BASE_URL').replace(/\/+$/, ''),
      keyTtlMinutes: ttl,
    };
    if (invalidInstallParams({ ...PLACEHOLDER, ...cfg }).length > 0) return null;
    // Una clave que vive horas es una clave que se olvida: entre 1 y 60 minutos.
    if (!Number.isInteger(ttl) || ttl < 1 || ttl > 60) return null;
    return cfg;
  }
}
