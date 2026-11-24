import { Injectable } from '@nestjs/common';
import { EvaluationParameters, EvaluationParametersPort } from '../../domain/engine/v2/parameters';

// Los valores por defecto del libro (§9 «Los parámetros»), iguales para todos los clientes (D140). Es el ÚNICO lugar con estos números: MD-495 reemplaza este puerto por una tabla.
const DEFAULT_EVALUATION_PARAMETERS: EvaluationParameters = {
  partialThreshold: 75,
  weakThreshold: 40,
  assetCoverage: 100,
  checkExceptionMaxDays: 90,
  freshnessHours: 24,
  scoreThreshold: 80,
};

@Injectable()
export class DefaultEvaluationParameters extends EvaluationParametersPort {
  /** Los mismos valores, de forma síncrona: lo leen las pruebas para no repetir los números del libro. */
  readonly values: EvaluationParameters = DEFAULT_EVALUATION_PARAMETERS;

  load(): Promise<EvaluationParameters> {
    return Promise.resolve(this.values);
  }
}
