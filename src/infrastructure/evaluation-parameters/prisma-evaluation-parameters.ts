import { Injectable } from '@nestjs/common';
import { TransactionClient } from '../database/prisma.service';
import { EvaluationParameters, EvaluationParametersPort, ParametersSession } from '../../common/evaluation-parameters/parameters';
import { buildEvaluationParameters } from '../../common/evaluation-parameters/parameters-from-rows';

// RC-19 · Lee `catalog.evaluation_parameters` dentro de la transacción del caso de uso (la tabla de `catalog` la lee cualquier rol). Sin caché (MD-495).
@Injectable()
export class PrismaEvaluationParameters extends EvaluationParametersPort {
  async load(session: ParametersSession): Promise<EvaluationParameters> {
    const rows = await (session as TransactionClient).evaluationParameter.findMany({ select: { key: true, unit: true, value: true } });
    return buildEvaluationParameters(rows);
  }
}
