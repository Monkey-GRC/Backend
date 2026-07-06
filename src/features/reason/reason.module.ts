// src/features/reason/reason.module.ts

import { Module } from '@nestjs/common';
import { ReasonController } from './presentation/reason.controller';
import { ReasonRepository } from './domain/repositories/reason.repository';
import { ReasonPrismaRepository } from './infrastructure/repositories/reason.prisma.repository';
import { CreateReasonUseCase } from './application/use-case/create-reason.use-case';
import { GetAllReasonsUseCase } from './application/use-case/get-all-reasons.use-case';
import { UpdateReasonUseCase } from './application/use-case/update-reason.use-case';
import { DeleteReasonUseCase } from './application/use-case/delete-reason.use-case';

@Module({
  controllers: [ReasonController],
  providers: [
    {
      provide: ReasonRepository,
      useClass: ReasonPrismaRepository,
    },
    CreateReasonUseCase,
    GetAllReasonsUseCase,
    UpdateReasonUseCase,
    DeleteReasonUseCase,
  ],
})
export class ReasonModule {}
