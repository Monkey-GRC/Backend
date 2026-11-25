import { Module } from '@nestjs/common';
import { EvaluationParametersPort } from '../../common/evaluation-parameters/parameters';
import { PrismaEvaluationParameters } from './prisma-evaluation-parameters';

// El puerto de los parámetros de evaluación (RC-19) con su lector de `catalog.evaluation_parameters`. Lo importan las features que los leen (compliance, technical-control, documents) sin importarse entre sí.
@Module({
  providers: [{ provide: EvaluationParametersPort, useClass: PrismaEvaluationParameters }],
  exports: [EvaluationParametersPort],
})
export class EvaluationParametersModule {}
