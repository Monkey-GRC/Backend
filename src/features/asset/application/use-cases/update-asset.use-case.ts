import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { UpdateAssetDto } from '../dtos/update-asset.dto';

@Injectable()
export class UpdateAssetUseCase {
    constructor(private readonly assetRepository: AssetRepository) { }

    execute(id: string, dto: UpdateAssetDto, userId: string) {
        return this.assetRepository.update(id, { ...dto, userId });
    }
}
