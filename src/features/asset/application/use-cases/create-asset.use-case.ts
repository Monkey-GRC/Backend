import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { CreateAssetDto } from '../dtos/create-asset.dto';

@Injectable()
export class CreateAssetUseCase {
    constructor(private readonly assetRepository: AssetRepository) { }

    execute(dto: CreateAssetDto, userId: string) {
        return this.assetRepository.create({
            name: dto.name,
            type: dto.type,
            source: dto.source,
            externalId: dto.externalId,
            os: dto.os,
            userId,
        });
    }
}
