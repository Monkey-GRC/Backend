import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import { ASSIGNABLE_ROLES } from '../../../../common/enums/user-role.enum';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { ControlNotificationEvent, NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { STATE_TRANSACTION } from '../../../../common/tenancy/state-transaction';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { ControlReadout } from '../../domain/controls/control-readout';
import type { ManagementState } from '../../domain/controls/management-state';
import {
  ActAudit, ActContext, ActSaved, DecideRequest, ManagementActsRepository, NewApplicability, NewDeclaration, NewLevelOverride, NewOccurrence, NewPlan, RequestKind,
} from '../../domain/management/management-acts.repository';
import { captureControlReadouts, invalidateStaleRequests, recordChangesBetween, StateChangeCause } from '../shared/control-state-events';

@Injectable()
export class ManagementActsPrismaRepository extends ManagementActsRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  async controlOfRequest(scope: TenantScope, kind: RequestKind, requestId: string): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (kind === 'level') return (await tx.controlLevelOverride.findUnique({ where: { id: requestId }, select: { clientControlId: true } }))?.clientControlId ?? null;
      if (kind === 'plan') return (await tx.remediationPlan.findUnique({ where: { id: requestId }, select: { clientControlId: true } }))?.clientControlId ?? null;
      const request = await tx.requirementApplicabilityRequest.findUnique({ where: { id: requestId }, select: { clientControlRequirementId: true } });
      if (!request) return null;
      return (await tx.clientControlRequirement.findUnique({ where: { id: request.clientControlRequirementId }, select: { clientControlId: true } }))?.clientControlId ?? null;
    });
  }

  isAssignable(scope: TenantScope, userId: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, companyId: scope.companyId, status: 'active', role: { in: [...ASSIGNABLE_ROLES] } }, select: { id: true } });
      return user !== null;
    });
  }

  /** Lo que sigue a todo acto: la foto de después, los eventos de estado (D91) con sus efectos (aprobaciones que caen, aviso «por aprobar») y el estado de gestión resultante. */
  private async finish(tx: TransactionClient, scope: TenantScope, controlId: string, cause: StateChangeCause, act: ActContext): Promise<{ stateAfter: ManagementState; readout: ControlReadout }> {
    const control = await tx.clientControl.findFirstOrThrow({ where: { id: controlId }, select: { serviceId: true } });
    // Una sola foto de después: sirve a los eventos de estado y a la respuesta del acto (no se vuelve a leer el servicio).
    const { snapshots: after, readouts } = await captureControlReadouts(tx, control.serviceId, await this.evaluationParameters.load(tx));
    await recordChangesBetween(
      tx, { tenantId: scope.companyId, serviceId: control.serviceId, cause, actor: { userId: act.actorId, ipAddress: act.meta.ipAddress, userAgent: act.meta.userAgent }, notifications: this.notifications },
      act.before, after,
    );
    // MD-529 · Lo que el acto dejó sin valor (una corrección de otro sugerido, un plan cuya prueba ya no está en Excepción) se invalida ya, con su rastro y el actor real; no espera a la pasada diaria.
    const readout = readouts.get(controlId);
    if (!readout) throw new Error(`el control ${controlId} no está en la foto de después`);
    await invalidateStaleRequests(tx, scope.companyId, [readout], { userId: act.actorId, ipAddress: act.meta.ipAddress, userAgent: act.meta.userAgent });
    return { stateAfter: after.get(controlId)?.managementState ?? 'non_compliant', readout };
  }

  private async done(
    tx: TransactionClient, scope: TenantScope, controlId: string, cause: StateChangeCause, act: ActContext, audit: ActAudit, id: string,
    notice?: { type: ControlNotificationEvent['type']; assigneeId?: string | null },
  ): Promise<ActSaved> {
    const { stateAfter, readout } = await this.finish(tx, scope, controlId, cause, act);
    await insertAuditLog(tx, audit(stateAfter));
    // Los avisos nacen en esta transacción (MD-515): lo que espera una decisión avisa al administrador; la decisión, a quien lo propuso. Una propuesta del administrador que lleva el control no avisa.
    if (notice) {
      const event = (notice.type === 'remediation_plan_decided'
        ? { type: notice.type, controlId, actorId: act.actorId, dedupeSuffix: `${id}:${stateAfter}`, assigneeId: notice.assigneeId ?? null }
        : { type: notice.type, controlId, actorId: act.actorId, dedupeSuffix: id }) as ControlNotificationEvent;
      await this.notifications.emitForControls(tx, scope.companyId, [event]);
    }
    return { id, stateAfter, readout };
  }

  // --- R5 -------------------------------------------------------------------------------------------------------------------------------------------

  createLevelOverride(scope: TenantScope, controlId: string, input: NewLevelOverride, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const now = new Date();
      // Una propuesta que dejó de valer (cambió el sugerido o la ventana) sale del camino de la nueva.
      if (input.staleIds.length > 0) await tx.controlLevelOverride.updateMany({ where: { id: { in: [...input.staleIds] }, invalidatedAt: null }, data: { invalidatedAt: now } });
      if (input.direct && input.supersedeIds.length > 0) await tx.controlLevelOverride.updateMany({ where: { id: { in: [...input.supersedeIds] }, invalidatedAt: null }, data: { invalidatedAt: now } });
      const row = await tx.controlLevelOverride.create({
        data: {
          tenantId: scope.companyId, clientControlId: controlId, suggestedLevel: input.suggestedValue, proposedLevel: input.proposedValue, justification: input.justification, proposedBy: act.actorId, proposedAt: now,
          windowStart: input.windowStart, ...(input.direct ? { status: 'approved' as const, decidedBy: act.actorId, decidedAt: now, decidedDirectly: true } : {}),
        },
        select: { id: true },
      });
      return this.done(tx, scope, controlId, 'level_override', act, audit, row.id, input.direct ? undefined : { type: 'level_override_proposed' });
    }, STATE_TRANSACTION);
  }

  decideLevelOverride(scope: TenantScope, controlId: string, id: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const now = new Date();
      const approve = input.decision === 'approve';
      if (approve && (input.supersedeIds?.length ?? 0) > 0) await tx.controlLevelOverride.updateMany({ where: { id: { in: [...(input.supersedeIds ?? [])] }, invalidatedAt: null }, data: { invalidatedAt: now } });
      await tx.controlLevelOverride.update({ where: { id }, data: { status: approve ? 'approved' : 'rejected', decidedBy: act.actorId, decidedAt: now, decisionReason: input.reason } });
      return this.done(tx, scope, controlId, 'level_override', act, audit, id, { type: 'level_override_decided' });
    }, STATE_TRANSACTION);
  }

  // --- Plan de remediación --------------------------------------------------------------------------------------------------------------------------

  createPlan(scope: TenantScope, controlId: string, input: NewPlan, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const now = new Date();
      if (input.staleIds.length > 0) await tx.remediationPlan.updateMany({ where: { id: { in: [...input.staleIds] }, invalidatedAt: null }, data: { invalidatedAt: now } });
      const row = await tx.remediationPlan.create({
        data: {
          tenantId: scope.companyId, clientControlId: controlId, testId: input.testId, clientControlRequirementId: input.requirementId, what: input.what, assigneeId: input.assigneeId, dueDate: input.dueDate,
          proposedBy: act.actorId, proposedAt: now, windowStart: input.windowStart, ...(input.direct ? { status: 'approved' as const, decidedBy: act.actorId, decidedAt: now, decidedDirectly: true } : {}),
        },
        select: { id: true },
      });
      return this.done(tx, scope, controlId, 'remediation_plan', act, audit, row.id, input.direct ? undefined : { type: 'remediation_plan_proposed' });
    }, STATE_TRANSACTION);
  }

  decidePlan(scope: TenantScope, controlId: string, id: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const plan = await tx.remediationPlan.update({ where: { id }, data: { status: input.decision === 'approve' ? 'approved' : 'rejected', decidedBy: act.actorId, decidedAt: new Date(), decisionReason: input.reason }, select: { assigneeId: true } });
      return this.done(tx, scope, controlId, 'remediation_plan', act, audit, id, { type: 'remediation_plan_decided', assigneeId: input.decision === 'approve' ? plan.assigneeId : null });
    }, STATE_TRANSACTION);
  }

  // --- «No aplica» ----------------------------------------------------------------------------------------------------------------------------------

  createApplicabilityRequest(scope: TenantScope, controlId: string, input: NewApplicability, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const now = new Date();
      const row = await tx.requirementApplicabilityRequest.create({
        data: {
          tenantId: scope.companyId, clientControlRequirementId: input.requirementId, reason: input.reason, requestedBy: act.actorId, requestedAt: now,
          ...(input.direct ? { status: 'approved' as const, decidedBy: act.actorId, decidedAt: now, decidedDirectly: true } : {}),
        },
        select: { id: true },
      });
      if (input.direct) await tx.clientControlRequirement.update({ where: { id: input.requirementId }, data: { isApplicable: false, notApplicableReason: input.reason } });
      return this.done(tx, scope, controlId, 'requirement_applicability', act, audit, row.id, input.direct ? undefined : { type: 'not_applicable_requested' });
    }, STATE_TRANSACTION);
  }

  decideApplicability(scope: TenantScope, controlId: string, id: string, requirementId: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const approve = input.decision === 'approve';
      const row = await tx.requirementApplicabilityRequest.update({ where: { id }, data: { status: approve ? 'approved' : 'rejected', decidedBy: act.actorId, decidedAt: new Date(), decisionReason: input.reason }, select: { reason: true } });
      if (approve) await tx.clientControlRequirement.update({ where: { id: requirementId }, data: { isApplicable: false, notApplicableReason: row.reason } });
      return this.done(tx, scope, controlId, 'requirement_applicability', act, audit, id, { type: 'not_applicable_decided' });
    }, STATE_TRANSACTION);
  }

  revertApplicability(scope: TenantScope, controlId: string, requestId: string, requirementId: string, reason: string, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      await tx.requirementApplicabilityRequest.update({ where: { id: requestId }, data: { revertedBy: act.actorId, revertedAt: new Date(), revertReason: reason } });
      await tx.clientControlRequirement.update({ where: { id: requirementId }, data: { isApplicable: true, notApplicableReason: null } });
      return this.done(tx, scope, controlId, 'requirement_applicability', act, audit, requestId);
    }, STATE_TRANSACTION);
  }

  auditExtra(scope: TenantScope, entries: readonly AuditEntry[]): Promise<void> {
    return this.prisma.withScope(scope, (tx) => insertAuditLog(tx, [...entries]));
  }

  // --- Ocurrencias y declaración --------------------------------------------------------------------------------------------------------------------

  createOccurrence(scope: TenantScope, controlId: string, input: NewOccurrence, act: ActContext, audit: ActAudit): Promise<ActSaved & { invalidatedDeclarationIds: string[] }> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.requirementOccurrence.create({
        data: { tenantId: scope.companyId, clientControlRequirementId: input.requirementId, occurredOn: input.occurredOn, description: input.description, registeredBy: act.actorId },
        select: { id: true },
      });
      // Una declaración de «sin ocurrencias» de ese trimestre queda sin efecto: ya hay una.
      const quarterStart = quarterStartOf(input.occurredOn);
      const declarations = await tx.noOccurrenceDeclaration.findMany({ where: { clientControlRequirementId: input.requirementId, windowStart: quarterStart, invalidatedAt: null }, select: { id: true } });
      if (declarations.length > 0) await tx.noOccurrenceDeclaration.updateMany({ where: { id: { in: declarations.map((d) => d.id) } }, data: { invalidatedAt: new Date() } });
      const saved = await this.done(tx, scope, controlId, 'requirement_occurrence', act, audit, row.id);
      return { ...saved, invalidatedDeclarationIds: declarations.map((d) => d.id) };
    }, STATE_TRANSACTION);
  }

  createDeclaration(scope: TenantScope, controlId: string, input: NewDeclaration, act: ActContext, audit: ActAudit): Promise<ActSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.noOccurrenceDeclaration.create({
        data: { tenantId: scope.companyId, clientControlRequirementId: input.requirementId, windowStart: input.windowStart, windowEnd: input.windowEnd, note: input.note, declaredBy: act.actorId },
        select: { id: true },
      });
      return this.done(tx, scope, controlId, 'requirement_occurrence', act, audit, row.id);
    }, STATE_TRANSACTION);
  }
}

/** El primer día (UTC) del trimestre de calendario de una fecha. */
const quarterStartOf = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1));
