import { Module } from '@nestjs/common';
import { CreateControlUseCase } from './application/use-cases/create-control.use-case';
import { GetControlUseCase } from './application/use-cases/get-control.use-case';
import { ListChangesUseCase } from './application/use-cases/list-changes.use-case';
import { ListControlsUseCase } from './application/use-cases/list-controls.use-case';
import { ProposeChangeUseCase } from './application/use-cases/propose-change.use-case';
import { ControlChangeRepository } from './domain/repositories/control-change.repository';
import { ControlRepository } from './domain/repositories/control.repository';
import { ControlChangePrismaRepository } from './infrastructure/repositories/control-change.prisma.repository';
import { ControlPrismaRepository } from './infrastructure/repositories/control.prisma.repository';
import { ControlChangesController } from './presentation/control-changes.controller';
import { ControlsController } from './presentation/controls.controller';

// Cumplimiento (modelo-datos.md §7 y §9). El motor de evaluación vive en `domain/engine/` (funciones puras).
@Module({
  controllers: [ControlsController, ControlChangesController],
  providers: [
    { provide: ControlRepository, useClass: ControlPrismaRepository },
    { provide: ControlChangeRepository, useClass: ControlChangePrismaRepository },
    ListControlsUseCase,
    GetControlUseCase,
    CreateControlUseCase,
    ProposeChangeUseCase,
    ListChangesUseCase,
  ],
})
export class ComplianceModule {}
