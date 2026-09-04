import { Injectable } from '@nestjs/common';
import { AssetSource } from 'generated/prisma-tenant/browser';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { CreateAssetDto } from '../dtos/create-asset.dto';

@Injectable()
export class CreateAssetUseCase {
    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(dto: CreateAssetDto, userId: string) {
        const wazuhPolicyId =
            dto.source === AssetSource.WAZUH_AGENT && dto.externalId
                ? await this.cisCheckRepository.findPolicyIdForAgent(dto.externalId)
                : null;

        return this.assetRepository.create({
            name: dto.name,
            type: dto.type,
            source: dto.source,
            externalId: dto.externalId,
            os: dto.os,
            wazuhPolicyId,
            userId,
        });
    }
}
