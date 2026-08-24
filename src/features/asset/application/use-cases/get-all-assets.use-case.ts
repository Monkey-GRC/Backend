import { Injectable } from '@nestjs/common';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { AssetRepository } from '../../domain/repositories/asset.repository';

@Injectable()
export class GetAllAssetsUseCase {
    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute() {
        const assets = await this.assetRepository.findAll();

        const agentIds = assets
            .filter((asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id)
            .map((asset: any) => asset.external_id as string);
        const agentInfoById = await this.cisCheckRepository.findAgentInfoByIds(agentIds);

        return assets.map((asset: any) => {
            const agentInfo = asset.external_id ? agentInfoById.get(asset.external_id) : undefined;
            return {
                ...asset,
                os_name: agentInfo?.osName ?? null,
                os_version: agentInfo?.osVersion ?? null,
            };
        });
    }
}
