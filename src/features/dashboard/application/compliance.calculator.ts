import { ControlType } from 'generated/prisma-tenant/browser';
import { ControlWithChecks } from '../domain/repositories/control-compliance.repository';

export type ScaCheckResult = 'passed' | 'failed' | 'not_applicable';

export type EvaluableAsset = {
    id: string;
    externalId: string;
    os: 'UBUNTU' | 'WINDOWS';
};

export type ControlCompliance = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: ControlType;
    /**
     * Null cuando el control no tiene ningún check evaluado todavía (todos
     * PENDING/NOT_APPLICABLE, o sin checks configurados) — cobertura, no
     * cumplimiento. Ver checksPending.
     */
    compliance: number | null;
    checksTotal: number;
    checksPassed: number;
    checksFailed: number;
    checksNotApplicable: number;
    /** Checks manuales sin evaluar todavía (nadie los ha marcado como cumple/falla/no aplica). */
    checksPending: number;
    /** Servidores registrados cuyo SO coincide con al menos un check automático de este control. */
    serversEvaluated: number;
};

export function computeControlCompliance(
    control: ControlWithChecks,
    assets: EvaluableAsset[],
    resultsByAssetId: Map<string, Map<string, ScaCheckResult>>,
): ControlCompliance {
    let passed = 0;
    let failed = 0;
    let notApplicable = 0;
    let pending = 0;
    const serverIdsEvaluated = new Set<string>();

    for (const check of control.checks) {
        const matchingAssets = assets.filter((asset) => asset.os === check.os);
        for (const asset of matchingAssets) {
            const result = resultsByAssetId.get(asset.id)?.get(check.checkId) ?? 'not_applicable';
            if (result === 'passed') {
                passed += 1;
                serverIdsEvaluated.add(asset.id);
            } else if (result === 'failed') {
                failed += 1;
                serverIdsEvaluated.add(asset.id);
            } else {
                notApplicable += 1;
            }
        }
    }

    for (const check of control.manualChecks) {
        switch (check.status) {
            case 'PASSED':
                passed += 1;
                break;
            case 'FAILED':
                failed += 1;
                break;
            case 'NOT_APPLICABLE':
                notApplicable += 1;
                break;
            default:
                pending += 1;
        }
    }

    const applicable = passed + failed;

    return {
        id: control.id,
        code: control.code,
        name: control.name,
        description: control.description,
        type: control.type,
        compliance:
            applicable === 0 ? null : Math.round((passed / applicable) * 10000) / 100,
        checksTotal: passed + failed + notApplicable + pending,
        checksPassed: passed,
        checksFailed: failed,
        checksNotApplicable: notApplicable,
        checksPending: pending,
        serversEvaluated: serverIdsEvaluated.size,
    };
}
