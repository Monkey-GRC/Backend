import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../../domain/repositories/asset.repository';

@Injectable()
export class DeleteAssetUseCase {
    constructor(private readonly assetRepository: AssetRepository) { }

    execute(id: string) {
        return this.assetRepository.delete(id);
    }
}
