import { Module } from '@nestjs/common';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { ManualCheckController } from './presentation/manual-check.controller';
import { ManualCheckItemController } from './presentation/manual-check-item.controller';
import { ManualCheckRepository } from './domain/repositories/manual-check.repository';
import { ManualCheckPrismaRepository } from './infrastructure/repositories/manual-check.prisma.repository';
import { CreateManualCheckUseCase } from './application/use-cases/create-manual-check.use-case';
import { ListManualChecksUseCase } from './application/use-cases/list-manual-checks.use-case';
import { UpdateManualCheckUseCase } from './application/use-cases/update-manual-check.use-case';
import { SetManualCheckStatusUseCase } from './application/use-cases/set-manual-check-status.use-case';
import { DeleteManualCheckUseCase } from './application/use-cases/delete-manual-check.use-case';
import { UploadManualCheckEvidenceUseCase } from './application/use-cases/upload-manual-check-evidence.use-case';
import { ListManualCheckEvidenceUseCase } from './application/use-cases/list-manual-check-evidence.use-case';
import { DeleteManualCheckEvidenceUseCase } from './application/use-cases/delete-manual-check-evidence.use-case';

@Module({
    imports: [StorageModule],
    controllers: [ManualCheckController, ManualCheckItemController],
    providers: [
        { provide: ManualCheckRepository, useClass: ManualCheckPrismaRepository },
        CreateManualCheckUseCase,
        ListManualChecksUseCase,
        UpdateManualCheckUseCase,
        SetManualCheckStatusUseCase,
        DeleteManualCheckUseCase,
        UploadManualCheckEvidenceUseCase,
        ListManualCheckEvidenceUseCase,
        DeleteManualCheckEvidenceUseCase,
    ],
})
export class ManualCheckModule {}
