import { Module } from '@nestjs/common';
import { ChecklistModule } from 'src/features/checklist/checklist.module';
import { AssetController } from './presentation/asset.controller';
import { AssetRepository } from './domain/repositories/asset.repository';
import { AssetPrismaRepository } from './infrastructure/repositories/asset.prisma.repository';
import { CreateAssetUseCase } from './application/use-cases/create-asset.use-case';
import { GetAllAssetsUseCase } from './application/use-cases/get-all-assets.use-case';
import { GetOneAssetUseCase } from './application/use-cases/get-one-asset.use-case';
import { UpdateAssetUseCase } from './application/use-cases/update-asset.use-case';
import { DeleteAssetUseCase } from './application/use-cases/delete-asset.use-case';
import { GetAssetComplianceUseCase } from './application/use-cases/get-asset-compliance.use-case';

@Module({
    imports: [ChecklistModule],
    controllers: [AssetController],
    providers: [
        {
            provide: AssetRepository,
            useClass: AssetPrismaRepository,
        },
        CreateAssetUseCase,
        GetAllAssetsUseCase,
        GetOneAssetUseCase,
        UpdateAssetUseCase,
        DeleteAssetUseCase,
        GetAssetComplianceUseCase,
    ],
    exports: [AssetRepository],
})
export class AssetModule { }
