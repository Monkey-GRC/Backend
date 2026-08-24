import { Injectable } from '@nestjs/common';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { AssetRepository } from '../../domain/repositories/asset.repository';

@Injectable()
export class GetOneAssetUseCase {
    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(id: string) {
        const asset: any = await this.assetRepository.findOne(id);

        const agentInfo = asset.source === 'WAZUH_AGENT' && asset.external_id
            ? await this.cisCheckRepository.findAgentInfo(asset.external_id)
            : null;

        return {
            ...asset,
            os_name: agentInfo?.osName ?? null,
            os_version: agentInfo?.osVersion ?? null,
        };
    }
}
