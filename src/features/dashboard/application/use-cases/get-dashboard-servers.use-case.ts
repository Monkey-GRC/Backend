import { Injectable } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';

export type ServerCompliance = {
    assetId: string;
    assetCode: string;
    assetName: string;
    os: ChecklistOs;
    osName: string | null;
    osVersion: string | null;
    status: string;
    compliance: number | null;
    checksTotal: number;
    checksPassed: number;
    checksFailed: number;
    checksNotApplicable: number;
};

@Injectable()
export class GetDashboardServersUseCase {
    constructor(
        private readonly controlRepository: ControlComplianceRepository,
        private readonly assetRepository: AssetRepository,
        private readonly cisCheckRepository: CisCheckRepository,
    ) { }

    async execute(): Promise<ServerCompliance[]> {
        const controls = await this.controlRepository.findControlsWithChecks();
        const relevantCheckIdsByOs = new Map<ChecklistOs, Set<string>>();
        for (const control of controls) {
            for (const check of control.checks) {
                const set = relevantCheckIdsByOs.get(check.os) ?? new Set<string>();
                set.add(check.checkId);
                relevantCheckIdsByOs.set(check.os, set);
            }
        }

        const assets = (await this.assetRepository.findAll()).filter(
            (asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE',
        );

        const result: ServerCompliance[] = [];

        for (const asset of assets as any[]) {
            const checks = await this.cisCheckRepository.findComplianceForAgent(asset.os, asset.external_id);
            const relevantIds = relevantCheckIdsByOs.get(asset.os) ?? new Set<string>();
            const scoped = checks.filter((check) => relevantIds.has(check.checkId));

            const passed = scoped.filter((check) => check.result === 'passed').length;
            const failed = scoped.filter((check) => check.result === 'failed').length;
            const notApplicable = scoped.length - passed - failed;
            const applicable = passed + failed;

            const agentInfo = await this.cisCheckRepository.findAgentInfo(asset.external_id);

            result.push({
                assetId: asset.id,
                assetCode: asset.code,
                assetName: asset.name,
                os: asset.os,
                osName: agentInfo?.osName ?? null,
                osVersion: agentInfo?.osVersion ?? null,
                status: agentInfo?.status ?? 'unknown',
                compliance: applicable === 0 ? null : Math.round((passed / applicable) * 10000) / 100,
                checksTotal: scoped.length,
                checksPassed: passed,
                checksFailed: failed,
                checksNotApplicable: notApplicable,
            });
        }

        return result;
    }
}
