import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistOs, ControlDimension } from 'generated/prisma-tenant/browser';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import { EvaluableAsset, ScaCheckResult } from '../compliance.calculator';

export type FailingAsset = {
    assetId: string;
    name: string;
};

export type ControlCheckDetail = {
    checkId: string;
    title: string;
    os: ChecklistOs;
    dimension: ControlDimension;
    result: ScaCheckResult;
    description: string | null;
    rationale: string | null;
    /** Solo tiene sentido consultarla cuando result === 'failed'. */
    remediation: string | null;
    /**
     * Servidores específicos que incumplen este check — solo se listan los
     * que fallan (filosofía de excepción, no cobertura completa). Vacío si
     * result !== 'failed', o si el check falla pero por algún motivo no se
     * pudo identificar el/los servidor(es) puntuales.
     */
    failingAssets: FailingAsset[];
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
        const resultsByCheckId = await this.loadResultsByCheck(
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
                const perAsset = resultsByCheckId.get(check.checkId) ?? [];
                const failingAssets = perAsset
                    .filter((entry) => entry.result === 'failed')
                    .map((entry) => ({ assetId: entry.assetId, name: entry.name }));
                const result = this.summarizeResult(perAsset.map((entry) => entry.result));

                return {
                    checkId: check.checkId,
                    // check.title es una copia congelada del catálogo CIS al momento de crear el
                    // control (puede quedar desactualizada o en inglés); se prioriza la traducción
                    // vigente y solo se cae al título guardado si el catálogo no tiene ese check_id.
                    title: detail?.title ?? check.title,
                    os: check.os,
                    dimension: check.dimension,
                    result,
                    description: detail?.description ?? null,
                    rationale: detail?.rationale ?? null,
                    remediation: detail?.remediation ?? null,
                    failingAssets,
                };
            }),
        };
    }

    private async loadEvaluableAssets(): Promise<EvaluableAsset[]> {
        const assets = await this.assetRepository.findAll();
        return assets
            .filter((asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE')
            .map((asset: any) => ({
                id: asset.id,
                name: asset.name,
                externalId: asset.external_id,
                os: asset.os,
                policyId: asset.wazuh_policy_id ?? null,
            }));
    }

    /**
     * Resultado por check_id, con el detalle de CADA asset que lo evaluó
     * (no un agregado bool_and) — así se conserva cuál servidor específico
     * falla, en vez de perderlo al agregar por sistema operativo.
     */
    private async loadResultsByCheck(
        osList: Set<ChecklistOs>,
        assets: EvaluableAsset[],
    ): Promise<Map<string, { assetId: string; name: string; result: ScaCheckResult }[]>> {
        const resultsByCheckId = new Map<string, { assetId: string; name: string; result: ScaCheckResult }[]>();

        for (const os of osList) {
            const matchingAssets = assets.filter((asset) => asset.os === os && asset.policyId);

            for (const asset of matchingAssets) {
                const checks = await this.cisCheckRepository.findComplianceForAgent(asset.policyId as string, asset.externalId);
                for (const check of checks) {
                    const result = this.normalizeResult(check.result);
                    const list = resultsByCheckId.get(check.checkId) ?? [];
                    list.push({ assetId: asset.id, name: asset.name, result });
                    resultsByCheckId.set(check.checkId, list);
                }
            }
        }

        return resultsByCheckId;
    }

    /** Un check del control falla si falla en AL MENOS uno de los servidores evaluados. */
    private summarizeResult(results: ScaCheckResult[]): ScaCheckResult {
        if (results.some((r) => r === 'failed')) return 'failed';
        if (results.some((r) => r === 'passed')) return 'passed';
        return 'not_applicable';
    }

    private normalizeResult(result?: string | null): ScaCheckResult {
        if (result === 'passed' || result === 'failed') {
            return result;
        }
        return 'not_applicable';
    }
}
