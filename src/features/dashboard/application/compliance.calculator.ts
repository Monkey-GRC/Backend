import { ControlDimension, ControlType } from 'generated/prisma-tenant/browser';
import { ControlWithChecks } from '../domain/repositories/control-compliance.repository';

export type ScaCheckResult = 'passed' | 'failed' | 'not_applicable';

export type EvaluableAsset = {
    id: string;
    name: string;
    externalId: string;
    os: 'UBUNTU' | 'WINDOWS';
    /** policy_id real de Wazuh para este asset (ver Asset.wazuh_policy_id) — null si nunca se resolvió (agente sin escaneos aún). */
    policyId: string | null;
};

export type DimensionCompliance = {
    dimension: ControlDimension;
    type: ControlType;
    /**
     * Nunca null: si la dimensión está declarada aplicable pero no tiene
     * ninguna evidencia resuelta todavía (ni pass ni fail), cuenta como 0 —
     * a propósito, para forzar atención en vez de esconder el hueco.
     */
    compliance: number;
    checksPassed: number;
    checksFailed: number;
    checksNotApplicable: number;
    checksPending: number;
};

export type ControlCompliance = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: ControlType;
    /**
     * Promedio de las dimensiones aplicables (ver `dimensions`) — NO un
     * promedio de checks individuales. Evita que una dimensión entera
     * ausente (ej. falta la política) se diluya entre cientos de checks
     * técnicos de otra dimensión. Null solo cuando el control no tiene
     * ninguna dimensión aplicable declarada todavía (catálogo incompleto).
     */
    compliance: number | null;
    /** Desglose por cada dimensión aplicable a este control. Las no aplicables no aparecen aquí. */
    dimensions: DimensionCompliance[];
    checksTotal: number;
    checksPassed: number;
    checksFailed: number;
    checksNotApplicable: number;
    /** Checks manuales sin evaluar todavía (nadie los ha marcado como cumple/falla/no aplica). */
    checksPending: number;
    /** Servidores registrados cuyo SO coincide con al menos un check automático de este control. */
    serversEvaluated: number;
};

type DimensionTally = {
    type: ControlType;
    passed: number;
    failed: number;
    notApplicable: number;
    pending: number;
};

export function computeControlCompliance(
    control: ControlWithChecks,
    assets: EvaluableAsset[],
    resultsByAssetId: Map<string, Map<string, ScaCheckResult>>,
): ControlCompliance {
    const byDimension = new Map<ControlDimension, DimensionTally>();

    const bucketFor = (dimension: ControlDimension, fallbackType: ControlType): DimensionTally => {
        let bucket = byDimension.get(dimension);
        if (!bucket) {
            bucket = { type: fallbackType, passed: 0, failed: 0, notApplicable: 0, pending: 0 };
            byDimension.set(dimension, bucket);
        }
        return bucket;
    };

    // Declarar primero las dimensiones aplicables (aunque terminen en 0/0 evidencia) —
    // así una dimensión requerida pero sin nada configurado igual aparece en el desglose.
    for (const req of control.dimensionRequirements) {
        bucketFor(req.dimension, req.type);
    }

    const serverIdsEvaluated = new Set<string>();

    for (const check of control.checks) {
        const bucket = bucketFor(check.dimension, 'AUTOMATIC');
        const matchingAssets = assets.filter((asset) => asset.os === check.os);
        for (const asset of matchingAssets) {
            const result = resultsByAssetId.get(asset.id)?.get(check.checkId) ?? 'not_applicable';
            if (result === 'passed') {
                bucket.passed += 1;
                serverIdsEvaluated.add(asset.id);
            } else if (result === 'failed') {
                bucket.failed += 1;
                serverIdsEvaluated.add(asset.id);
            } else {
                bucket.notApplicable += 1;
            }
        }
    }

    for (const check of control.manualChecks) {
        const bucket = bucketFor(check.dimension, 'MANUAL');
        switch (check.status) {
            case 'PASSED':
                bucket.passed += 1;
                break;
            case 'FAILED':
                bucket.failed += 1;
                break;
            case 'NOT_APPLICABLE':
                bucket.notApplicable += 1;
                break;
            default:
                bucket.pending += 1;
        }
    }

    const dimensions: DimensionCompliance[] = [...byDimension.entries()].map(([dimension, bucket]) => {
        const applicable = bucket.passed + bucket.failed;
        return {
            dimension,
            type: bucket.type,
            compliance: applicable === 0 ? 0 : Math.round((bucket.passed / applicable) * 10000) / 100,
            checksPassed: bucket.passed,
            checksFailed: bucket.failed,
            checksNotApplicable: bucket.notApplicable,
            checksPending: bucket.pending,
        };
    });

    const compliance =
        dimensions.length === 0
            ? null
            : Math.round((dimensions.reduce((sum, d) => sum + d.compliance, 0) / dimensions.length) * 100) / 100;

    const totals = dimensions.reduce(
        (acc, d) => ({
            passed: acc.passed + d.checksPassed,
            failed: acc.failed + d.checksFailed,
            notApplicable: acc.notApplicable + d.checksNotApplicable,
            pending: acc.pending + d.checksPending,
        }),
        { passed: 0, failed: 0, notApplicable: 0, pending: 0 },
    );

    return {
        id: control.id,
        code: control.code,
        name: control.name,
        description: control.description,
        type: control.type,
        compliance,
        dimensions,
        checksTotal: totals.passed + totals.failed + totals.notApplicable + totals.pending,
        checksPassed: totals.passed,
        checksFailed: totals.failed,
        checksNotApplicable: totals.notApplicable,
        checksPending: totals.pending,
        serversEvaluated: serverIdsEvaluated.size,
    };
}
