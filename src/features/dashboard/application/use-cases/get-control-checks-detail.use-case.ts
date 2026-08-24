import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import { EvaluableAsset, ScaCheckResult } from '../compliance.calculator';

export type ControlCheckDetail = {
    checkId: string;
    title: string;
    os: ChecklistOs;
    result: ScaCheckResult;
    description: string | null;
    rationale: string | null;
    /** Solo tiene sentido consultarla cuando result === 'failed'. */
    remediation: string | null;
};

export type ControlChecksDetail = {
    id: string;
    code: string;
    name: string;
    checks: ControlCheckDetail[];
};

@Injectable()
export class GetControlChecksDetailUseCase {
    constructor(
        private readonly controlRepository: ControlComplianceRepository,
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(controlId: string): Promise<ControlChecksDetail> {
        const controls = await this.controlRepository.findControlsWithChecks();
        const control = controls.find((item) => item.id === controlId);

        if (!control) {
            throw new NotFoundException('Control no encontrado');
        }

        const assets = await this.loadEvaluableAssets();
        const resultsByOs = await this.loadAggregatedResultsByOs(
            new Set(control.checks.map((check) => check.os)),
            assets,
        );

        const cisDetails = await this.cisCheckRepository.findDetailsByCheckIds(
            control.checks.map((check) => check.checkId),
        );

        return {
            id: control.id,
            code: control.code,
            name: control.name,
            checks: control.checks.map((check) => {
                const detail = cisDetails.get(check.checkId);
                return {
                    checkId: check.checkId,
                    // check.title es una copia congelada del catálogo CIS al momento de crear el
                    // control (puede quedar desactualizada o en inglés); se prioriza la traducción
                    // vigente y solo se cae al título guardado si el catálogo no tiene ese check_id.
                    title: detail?.title ?? check.title,
                    os: check.os,
                    result: resultsByOs.get(check.os)?.get(check.checkId) ?? 'not_applicable',
                    description: detail?.description ?? null,
                    rationale: detail?.rationale ?? null,
                    remediation: detail?.remediation ?? null,
                };
            }),
        };
    }

    private async loadEvaluableAssets(): Promise<EvaluableAsset[]> {
        const assets = await this.assetRepository.findAll();
        return assets
            .filter((asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE')
            .map((asset: any) => ({ id: asset.id, externalId: asset.external_id, os: asset.os }));
    }

    /** bool_and entre los servidores registrados que corren ese sistema operativo. */
    private async loadAggregatedResultsByOs(
        osList: Set<ChecklistOs>,
        assets: EvaluableAsset[],
    ): Promise<Map<ChecklistOs, Map<string, ScaCheckResult>>> {
        const resultsByOs = new Map<ChecklistOs, Map<string, ScaCheckResult>>();

        for (const os of osList) {
            const matchingAssets = assets.filter((asset) => asset.os === os);
            const aggregated = new Map<string, ScaCheckResult>();

            for (const asset of matchingAssets) {
                const checks = await this.cisCheckRepository.findComplianceForAgent(os, asset.externalId);
                for (const check of checks) {
                    const result = this.normalizeResult(check.result);
                    const previous = aggregated.get(check.checkId);
                    if (result === 'failed' || previous === 'failed') {
                        aggregated.set(check.checkId, 'failed');
                    } else if (result === 'passed' || previous === 'passed') {
                        aggregated.set(check.checkId, 'passed');
                    } else {
                        aggregated.set(check.checkId, 'not_applicable');
                    }
                }
            }

            resultsByOs.set(os, aggregated);
        }

        return resultsByOs;
    }

    private normalizeResult(result?: string | null): ScaCheckResult {
        if (result === 'passed' || result === 'failed') {
            return result;
        }
        return 'not_applicable';
    }
}
