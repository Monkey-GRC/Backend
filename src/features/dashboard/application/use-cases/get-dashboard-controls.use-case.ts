import { Injectable } from '@nestjs/common';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import {
    ControlCompliance,
    EvaluableAsset,
    ScaCheckResult,
    computeControlCompliance,
} from '../compliance.calculator';

@Injectable()
export class GetDashboardControlsUseCase {
    constructor(
        private readonly controlRepository: ControlComplianceRepository,
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(): Promise<ControlCompliance[]> {
        const controls = await this.controlRepository.findControlsWithChecks();
        const assets = await this.loadEvaluableAssets();
        const resultsByAssetId = await this.loadResultsByAsset(assets);

        return controls.map((control) =>
            computeControlCompliance(control, assets, resultsByAssetId),
        );
    }

    private async loadEvaluableAssets(): Promise<EvaluableAsset[]> {
        const assets = await this.assetRepository.findAll();
        return assets
            .filter((asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE')
            .map((asset: any) => ({ id: asset.id, externalId: asset.external_id, os: asset.os }));
    }

    private async loadResultsByAsset(assets: EvaluableAsset[]): Promise<Map<string, Map<string, ScaCheckResult>>> {
        const resultsByAssetId = new Map<string, Map<string, ScaCheckResult>>();

        for (const asset of assets) {
            const checks = await this.cisCheckRepository.findComplianceForAgent(asset.os, asset.externalId);
            const map = new Map<string, ScaCheckResult>();
            for (const check of checks) {
                map.set(check.checkId, this.normalizeResult(check.result));
            }
            resultsByAssetId.set(asset.id, map);
        }

        return resultsByAssetId;
    }

    private normalizeResult(result?: string | null): ScaCheckResult {
        if (result === 'passed' || result === 'failed') {
            return result;
        }
        return 'not_applicable';
    }
}
