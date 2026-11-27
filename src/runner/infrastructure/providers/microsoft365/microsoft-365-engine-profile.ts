import { FAILURE, RunnerFailure } from '../../../domain/runner.types';
import type { EngineProfile } from '../../docker-scan-engine';
import { commonEngineArgs, ENGINE_OUTPUT_PATH } from '../engine-common';
import { MICROSOFT_365_ENGINE_ENTRY, MICROSOFT_365_ENGINE_ENTRY_PATH } from './microsoft-365-engine-entry';

// Lo mismo que el backend exige al declarar el tenant y la aplicación: nada llega al entorno del motor sin revisar.
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
// El intérprete de Python de la imagen del motor: arranca nuestro `entry`, que a su vez arranca el motor.
const ENGINE_PYTHON = '/home/prowler/.venv/bin/python';

// El motor evalúa el tenant completo con su proveedor de Microsoft 365 (sin regiones). Recibe SOLO permisos temporales de esa organización (D156), por el ENTORNO del contenedor
// efímero y nunca por la línea de comandos (que se ve en la lista de procesos). Los checks de correo exigen además el acceso de Exchange y el rol de Lector global (DT-138).
export function prowlerMicrosoft365Profile(image: string): EngineProfile {
  return {
    image,
    outputPath: ENGINE_OUTPUT_PATH,
    entrypoint: [ENGINE_PYTHON, MICROSOFT_365_ENGINE_ENTRY_PATH],
    files: [{ path: MICROSOFT_365_ENGINE_ENTRY_PATH, content: MICROSOFT_365_ENGINE_ENTRY }],
    reportsProgress: true,
    command: () => ['m365', '--certificate-auth', ...commonEngineArgs()],
    env: (input) => {
      const c = input.credentials;
      if (c.provider !== 'microsoft_365') throw new RunnerFailure(FAILURE.engineFailed, 'credenciales de otra nube');
      const optional = [c.tokens.exchange, c.tokens.teams].filter((v): v is string => v !== null);
      if (!GUID.test(c.tenantId) || !GUID.test(c.clientId) || ![c.tokens.graph, ...optional].every((v) => JWT.test(v))) throw new RunnerFailure(FAILURE.engineFailed, 'credenciales de Microsoft 365 inválidas');
      return [
        `AZURE_CLIENT_ID=${c.clientId}`,
        `AZURE_TENANT_ID=${c.tenantId}`,
        `MONKEY_TOKEN_GRAPH=${c.tokens.graph}`,
        ...(c.tokens.exchange ? [`MONKEY_TOKEN_EXCHANGE=${c.tokens.exchange}`] : []),
        ...(c.tokens.teams ? [`MONKEY_TOKEN_TEAMS=${c.tokens.teams}`] : []),
      ];
    },
  };
}
