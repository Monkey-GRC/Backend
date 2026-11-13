import { FAILURE, RunnerFailure } from '../../../domain/runner.types';
import type { EngineProfile } from '../../docker-scan-engine';
import { commonEngineArgs, ENGINE_OUTPUT_PATH } from '../engine-common';

// Las regiones llegan del backend, pero se validan aquí también: ningún valor llega a la línea de comandos del motor sin revisar.
const REGION = /^[a-z]{2,4}(-[a-z]+){1,2}-\d$/;
const MAX_REGIONS = 20;

export function prowlerAwsProfile(image: string): EngineProfile {
  return {
    image,
    outputPath: ENGINE_OUTPUT_PATH,
    command: ({ regions }) => {
      if (regions.length === 0 || regions.length > MAX_REGIONS || !regions.every((r) => REGION.test(r))) throw new RunnerFailure(FAILURE.engineFailed, 'regiones inválidas');
      return ['aws', '-f', ...regions, ...commonEngineArgs()];
    },
    env: ({ credentials }) => {
      if (credentials.provider !== 'aws') throw new RunnerFailure(FAILURE.engineFailed, 'credenciales de otra nube');
      const { accessKeyId, secretAccessKey, sessionToken } = credentials;
      return ['AWS_DEFAULT_REGION=us-east-1', `AWS_ACCESS_KEY_ID=${accessKeyId}`, `AWS_SECRET_ACCESS_KEY=${secretAccessKey}`, ...(sessionToken ? [`AWS_SESSION_TOKEN=${sessionToken}`] : [])];
    },
  };
}
