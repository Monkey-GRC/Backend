import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client';
import { buildClonePlan, CatalogSnapshot, ClonePlan, planSize } from '../domain/clone-plan';

export type CloneSummary = Record<keyof ClonePlan, number>;

/**
 * Clonado del catálogo al escenario de un servicio cuando contrata un marco (MD-80). La regla vive en
 * `domain/clone-plan.ts`; esto solo lee, pide el plan y escribe.
 *
 * DEBE llamarse dentro de la MISMA transacción que crea la fila de `service_frameworks` y con el contexto
 * de tenant ya fijado (`app.tenant_id`): así el clonado y la contratación son todo o nada, y las
 * políticas RLS de `tenant` dejan escribir. Por eso recibe el cliente transaccional y no abre el suyo.
 */
@Injectable()
export class CloneCatalogService {
  async cloneForServiceFramework(tx: Prisma.TransactionClient, serviceFrameworkId: string): Promise<CloneSummary> {
    const sf = await tx.serviceFramework.findUniqueOrThrow({
      where: { id: serviceFrameworkId },
      select: { tenantId: true, serviceId: true, frameworkId: true, evaluationPeriod: true },
    });

    const [criteria, requirements, controls, dimensions, controlTests, templates, risks, causes, riskCauses, causeControls] = await Promise.all([
      tx.serviceTrustCriterion.findMany({ where: { serviceId: sf.serviceId }, select: { trustCriterionId: true } }),
      tx.requirement.findMany({
        where: { frameworkId: sf.frameworkId },
        select: { id: true, trustCriterionId: true, pointsOfFocus: { select: { pointOfFocusControls: { select: { controlId: true } } } } },
      }),
      tx.control.findMany({ select: { id: true, code: true, description: true } }),
      tx.controlDimensionEntry.findMany(),
      tx.controlTest.findMany({ select: { controlId: true, testId: true } }),
      tx.controlEvidenceTemplate.findMany({ select: { controlId: true, sequence: true, evidenceTemplate: { select: { code: true, description: true, dimension: true } } } }),
      tx.risk.findMany(),
      tx.cause.findMany(),
      tx.riskCause.findMany({ select: { riskId: true, causeId: true } }),
      tx.causeControl.findMany({ select: { causeId: true, controlId: true } }),
    ]);

    const [haveControls, haveRisks, haveCauses, haveRiskCauses, haveCauseControls] = await Promise.all([
      tx.clientControl.findMany({ where: { serviceId: sf.serviceId, controlId: { not: null } }, select: { id: true, controlId: true } }),
      tx.clientRisk.findMany({ where: { serviceId: sf.serviceId, riskId: { not: null } }, select: { id: true, riskId: true } }),
      tx.clientCause.findMany({ where: { serviceId: sf.serviceId, causeId: { not: null } }, select: { id: true, causeId: true } }),
      tx.clientRiskCause.findMany({ where: { clientRisk: { serviceId: sf.serviceId } }, select: { clientRiskId: true, clientCauseId: true } }),
      tx.clientCauseControl.findMany({ where: { clientCause: { serviceId: sf.serviceId } }, select: { clientCauseId: true, clientControlId: true } }),
    ]);

    const catalog: CatalogSnapshot = {
      requirements: requirements.map((r) => ({ id: r.id, trustCriterionId: r.trustCriterionId })),
      requirementControls: requirements.flatMap((r) => r.pointsOfFocus.flatMap((p) => p.pointOfFocusControls.map((x) => ({ requirementId: r.id, controlId: x.controlId })))),
      controls,
      dimensions: dimensions.map((d) => ({
        controlId: d.controlId, dimension: d.dimension, type: d.type, requiresProbe: d.requiresProbe, requiresAi: d.requiresAi,
        requiresComplianceConfirmation: d.requiresComplianceConfirmation, reasonNotApplicable: d.reasonNotApplicable,
      })),
      controlTests,
      evidenceTemplates: templates.map((t) => ({ controlId: t.controlId, sequence: t.sequence, ...t.evidenceTemplate })),
      risks: risks.map((r) => ({ id: r.id, code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact, isActive: r.isActive })),
      causes: causes.map((k) => ({ id: k.id, code: k.code, name: k.name, failureCategory: k.failureCategory, description: k.description })),
      riskCauses,
      causeControls,
    };

    const plan = buildClonePlan({
      tenantId: sf.tenantId,
      serviceId: sf.serviceId,
      evaluationPeriod: sf.evaluationPeriod,
      contractedTrustCriterionIds: criteria.map((c) => c.trustCriterionId),
      catalog,
      existing: {
        controls: new Map(haveControls.map((c) => [c.controlId as string, c.id])),
        risks: new Map(haveRisks.map((r) => [r.riskId as string, r.id])),
        causes: new Map(haveCauses.map((k) => [k.causeId as string, k.id])),
        riskCauseKeys: new Set(haveRiskCauses.map((r) => `${r.clientRiskId}#${r.clientCauseId}`)),
        causeControlKeys: new Set(haveCauseControls.map((r) => `${r.clientCauseId}#${r.clientControlId}`)),
      },
    });

    // Orden de padres a hijos. `skipDuplicates` es el cinturón: el único (service_id, control_id) y los
    // demás únicos hacen que una carrera entre dos clonados no duplique nada.
    await tx.clientControl.createMany({ data: plan.clientControls, skipDuplicates: true });
    await tx.clientRisk.createMany({ data: plan.clientRisks.map((r) => ({ ...r, trustCriterion: r.trustCriterion as never, potentialImpact: r.potentialImpact as never })), skipDuplicates: true });
    await tx.clientCause.createMany({ data: plan.clientCauses.map((k) => ({ ...k, failureCategory: k.failureCategory as never })), skipDuplicates: true });
    await tx.clientControlDimension.createMany({ data: plan.clientControlDimensions, skipDuplicates: true });
    await tx.clientControlTest.createMany({ data: plan.clientControlTests, skipDuplicates: true });
    await tx.evidenceRequirement.createMany({ data: plan.evidenceRequirements, skipDuplicates: true });
    await tx.clientRiskCause.createMany({ data: plan.clientRiskCauses, skipDuplicates: true });
    await tx.clientCauseControl.createMany({ data: plan.clientCauseControls, skipDuplicates: true });

    return planSize(plan);
  }
}
