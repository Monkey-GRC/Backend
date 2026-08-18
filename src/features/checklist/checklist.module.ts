import { Module } from '@nestjs/common';
import { ChecklistController } from './presentation/checklist.controller';
import { CisCheckRepository } from './domain/repositories/cis-check.repository';
import { CisCheckPgRepository } from './infrastructure/repositories/cis-check.pg.repository';
import { GetChecklistUseCase } from './application/use-cases/get-checklist.use-case';

@Module({
    controllers: [ChecklistController],
    providers: [
        {
            provide: CisCheckRepository,
            useClass: CisCheckPgRepository,
        },
        GetChecklistUseCase,
    ],
    exports: [CisCheckRepository],
})
export class ChecklistModule { }
