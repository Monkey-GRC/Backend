"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogCloner = void 0;
exports.controlKind = controlKind;
const crypto_1 = require("crypto");
function controlKind(types) {
    const distinct = new Set(types);
    if (distinct.size === 0)
        return 'manual';
    if (distinct.size === 1)
        return [...distinct][0];
    return 'hybrid';
}
class CatalogCloner {
    async cloneFramework(tx, req) {
        await this.cloneControls(tx, req);
        await this.cloneRisksAndCauses(tx, req);
    }
    async cloneControls(tx, req) {
        const links = await tx.pointOfFocusControl.findMany({
            where: {
                pointOfFocus: {
                    requirement: {
                        frameworkId: req.frameworkId,
                        trustCriterionId: { in: req.trustCriterionIds },
                    },
                },
            },
            select: { controlId: true },
            distinct: ['controlId'],
        });
        const controlIds = links.map((l) => l.controlId);
        if (controlIds.length === 0)
            return;
        const already = await tx.clientControl.findMany({
            where: { serviceId: req.serviceId, controlId: { in: controlIds } },
            select: { controlId: true },
        });
        const alreadyIds = new Set(already.map((c) => c.controlId));
        const pending = controlIds.filter((id) => !alreadyIds.has(id));
        if (pending.length === 0)
            return;
        const controls = await tx.control.findMany({
            where: { id: { in: pending } },
            include: {
                dimensions: true,
                controlTests: true,
                evidenceTemplates: { include: { evidenceTemplate: true }, orderBy: { sequence: 'asc' } },
            },
            orderBy: { code: 'asc' },
        });
        const clientControls = [];
        const dimensions = [];
        const tests = [];
        const evidences = [];
        for (const control of controls) {
            const id = (0, crypto_1.randomUUID)();
            clientControls.push({
                id,
                tenantId: req.tenantId,
                serviceId: req.serviceId,
                controlId: control.id,
                ownCode: control.code,
                clientInterpretation: control.description,
                type: controlKind(control.dimensions.map((d) => d.type)),
                sourceRef: control.sourceRef ?? control.code,
            });
            for (const d of control.dimensions) {
                dimensions.push({
                    tenantId: req.tenantId,
                    clientControlId: id,
                    dimension: d.dimension,
                    type: d.type,
                    requiresProbe: d.requiresProbe,
                    requiresAi: d.requiresAi,
                    requiresComplianceConfirmation: d.requiresComplianceConfirmation,
                    reasonNotApplicable: d.reasonNotApplicable,
                });
            }
            for (const t of control.controlTests) {
                tests.push({ tenantId: req.tenantId, clientControlId: id, testId: t.testId });
            }
            for (const link of control.evidenceTemplates) {
                evidences.push({
                    tenantId: req.tenantId,
                    clientControlId: id,
                    responsibleId: null,
                    code: link.evidenceTemplate.code,
                    sequence: link.sequence,
                    description: link.evidenceTemplate.description,
                    dimension: link.evidenceTemplate.dimension,
                    validityWithinPeriod: req.evaluationPeriod,
                    sourceRef: link.evidenceTemplate.code,
                });
            }
        }
        await tx.clientControl.createMany({ data: clientControls });
        if (dimensions.length)
            await tx.clientControlDimension.createMany({ data: dimensions });
        if (tests.length)
            await tx.clientControlTest.createMany({ data: tests });
        if (evidences.length)
            await tx.evidenceRequirement.createMany({ data: evidences });
    }
    async cloneRisksAndCauses(tx, req) {
        const [risks, causes, riskCauses, causeControls] = await Promise.all([
            tx.risk.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } }),
            tx.cause.findMany({ orderBy: { code: 'asc' } }),
            tx.riskCause.findMany({ select: { riskId: true, causeId: true } }),
            tx.causeControl.findMany({ select: { causeId: true, controlId: true } }),
        ]);
        const clientRiskIds = await this.cloneMissing(risks, await tx.clientRisk.findMany({
            where: { serviceId: req.serviceId, riskId: { not: null } },
            select: { id: true, riskId: true },
        }), (r) => r.id, (risk, id) => ({
            id,
            tenantId: req.tenantId,
            serviceId: req.serviceId,
            riskId: risk.id,
            code: risk.code,
            name: risk.name,
            description: risk.description,
            trustCriterion: risk.trustCriterion,
            potentialImpact: risk.potentialImpact,
            likelihood: risk.likelihood,
            impact: risk.impact,
            inherentRiskValue: risk.inherentRiskValue,
            inherentRiskLevel: risk.inherentRiskLevel,
        }), (data) => tx.clientRisk.createMany({ data }), 'riskId');
        const clientCauseIds = await this.cloneMissing(causes, await tx.clientCause.findMany({
            where: { serviceId: req.serviceId, causeId: { not: null } },
            select: { id: true, causeId: true },
        }), (c) => c.id, (cause, id) => ({
            id,
            tenantId: req.tenantId,
            serviceId: req.serviceId,
            causeId: cause.id,
            code: cause.code,
            name: cause.name,
            failureCategory: cause.failureCategory,
            description: cause.description,
        }), (data) => tx.clientCause.createMany({ data }), 'causeId');
        const riskCauseData = riskCauses
            .filter((rc) => clientRiskIds.has(rc.riskId) && clientCauseIds.has(rc.causeId))
            .map((rc) => ({
            tenantId: req.tenantId,
            clientRiskId: clientRiskIds.get(rc.riskId),
            clientCauseId: clientCauseIds.get(rc.causeId),
        }));
        if (riskCauseData.length) {
            await tx.clientRiskCause.createMany({ data: riskCauseData, skipDuplicates: true });
        }
        const clientControls = await tx.clientControl.findMany({
            where: { serviceId: req.serviceId, controlId: { not: null } },
            select: { id: true, controlId: true },
        });
        const clientControlIds = new Map(clientControls.map((c) => [c.controlId, c.id]));
        const causeControlData = causeControls
            .filter((cc) => clientCauseIds.has(cc.causeId) && clientControlIds.has(cc.controlId))
            .map((cc) => ({
            tenantId: req.tenantId,
            clientCauseId: clientCauseIds.get(cc.causeId),
            clientControlId: clientControlIds.get(cc.controlId),
        }));
        if (causeControlData.length) {
            await tx.clientCauseControl.createMany({ data: causeControlData, skipDuplicates: true });
        }
    }
    async cloneMissing(templates, existing, templateId, build, insert, originKey) {
        const map = new Map(existing.map((e) => [e[originKey], e.id]));
        const data = [];
        for (const template of templates) {
            if (map.has(templateId(template)))
                continue;
            const id = (0, crypto_1.randomUUID)();
            map.set(templateId(template), id);
            data.push(build(template, id));
        }
        if (data.length)
            await insert(data);
        return map;
    }
}
exports.CatalogCloner = CatalogCloner;
//# sourceMappingURL=catalog-cloner.js.map