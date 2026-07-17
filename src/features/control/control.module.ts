import { Module } from '@nestjs/common';
import { ControlController } from './presentation/control.controller';
import { ControlRepository } from './domain/repositories/control.repository';
import { ControlPrismaRepository } from './infrastructure/respositories/control.prisma.repository';
import { CreateControlUseCase } from './application/use-cases/create-control.use-case';
import { GetAllControlsUseCase } from './application/use-cases/get-all-controls.use-case';
import { GetOneControlUseCase } from './application/use-cases/get-one-control.use-case';
import { UpdateControlUseCase } from './application/use-cases/update-control.use-case';
import { DeleteControlUseCase } from './application/use-cases/delete-control.use-case';

@Module({
    controllers: [ControlController],
    providers: [
        {
            provide: ControlRepository,
            useClass: ControlPrismaRepository,
        },
        CreateControlUseCase,
        GetAllControlsUseCase,
        GetOneControlUseCase,
        UpdateControlUseCase,
        DeleteControlUseCase,
    ],
})
export class ControlModule { }
