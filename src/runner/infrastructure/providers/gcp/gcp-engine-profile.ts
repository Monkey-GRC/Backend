import { FAILURE, RunnerFailure } from '../../../domain/runner.types';
import type { EngineProfile } from '../../docker-scan-engine';
import { commonEngineArgs, ENGINE_OUTPUT_PATH } from '../engine-common';

// Lo mismo que el backend exige al declarar el proyecto: nada llega a la línea de comandos del motor sin revisar.
const PROJECT_ID = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;

// El motor evalúa el proyecto completo (sin regiones; sus hallazgos son `global`). El check excluido necesita una clave de un servicio externo.
export function prowlerGcpProfile(image: string): EngineProfile {
  const projectOf = ({ accountId }: { accountId: string | null }): string => {
    if (!accountId || !PROJECT_ID.test(accountId)) throw new RunnerFailure(FAILURE.engineFailed, 'proyecto inválido');
    return accountId;
  };
  return {
    image,
    outputPath: ENGINE_OUTPUT_PATH,
    command: (input) => ['gcp', '--project-id', projectOf(input), ...commonEngineArgs(), '--excluded-check', 'compute_public_address_shodan'],
    env: (input) => {
      if (input.credentials.provider !== 'gcp') throw new RunnerFailure(FAILURE.engineFailed, 'credenciales de otra nube');
      return [`CLOUDSDK_AUTH_ACCESS_TOKEN=${input.credentials.accessToken}`, `GOOGLE_CLOUD_PROJECT=${projectOf(input)}`];
    },
  };
}
