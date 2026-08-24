import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { AssetRepository } from '../../domain/repositories/asset.repository';

@Injectable()
export class GetAssetComplianceUseCase {
    constructor(
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(assetId: string) {
        const asset = await this.assetRepository.findOne(assetId);
        if (!asset) {
            throw new NotFoundException('Activo no encontrado');
        }
        if (!asset.os || !asset.external_id) {
            throw new BadRequestException('Este activo no tiene sistema operativo o identificador externo asociado, no se puede evaluar');
        }

        const [checks, agentInfo] = await Promise.all([
            this.cisCheckRepository.findComplianceForAgent(asset.os, asset.external_id),
            this.cisCheckRepository.findAgentInfo(asset.external_id),
        ]);

        const summary = {
            total: checks.length,
            passed: checks.filter((check) => check.result === 'passed').length,
            failed: checks.filter((check) => check.result === 'failed').length,
            notApplicable: checks.filter((check) => check.result === '').length,
            notEvaluated: checks.filter((check) => check.result === null || check.result === undefined).length,
        };

        return {
            asset: {
                id: asset.id,
                code: asset.code,
                name: asset.name,
                os: asset.os,
                osName: agentInfo?.osName ?? null,
                osVersion: agentInfo?.osVersion ?? null,
            },
            summary,
            checks,
        };
    }
}
