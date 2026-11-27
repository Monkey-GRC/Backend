import { Injectable } from '@nestjs/common';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { readControl } from '../../domain/controls/control-readout';
import { snapshotOf } from '../../domain/controls/control-state-events';
import { ApprovalSaved, ApprovalWrite, ControlManagementRepository, ManagementContext, ResultSaved, ResultWrite } from '../../domain/management/control-management.repository';
import { captureControlReadouts, invalidateStaleRequests, recordChangesBetween } from '../shared/control-state-events';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';
import { STATE_TRANSACTION } from '../../../../common/tenancy/state-transaction';

@Injectable()
export class ControlManagementPrismaRepository extends ControlManagementRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  lockAndRead(scope: TenantScope, controlId: string): Promise<ManagementContext | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // FOR NO KEY UPDATE: serializa las decisiones sobre el control sin bloquear a quien solo referencia la fila (claves foráneas de las aprobaciones y los resultados).
      const rows = await tx.$queryRaw<{ serviceId: string }[]>`SELECT service_id AS "serviceId" FROM tenant.client_controls WHERE id = ${controlId}::uuid AND is_active FOR NO KEY UPDATE`;
      if (!rows[0]) return null;
      const data = await loadServiceSnapshot(tx, rows[0].serviceId, await this.evaluationParameters.load(tx));
      const readouts = data.controls.map((c) => readControl(c, data));
      const readout = readouts.find((r) => r.control.id === controlId);
      return readout ? { data, readout, before: new Map(readouts.map((r) => [r.control.id, snapshotOf(r)] as const)) } : null;
    }, STATE_TRANSACTION);
  }

  submissionsOfControl(scope: TenantScope, controlId: string, submissionIds: readonly string[]): Promise<string[]> {
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.evidenceSubmission.findMany({ where: { id: { in: [...submissionIds] }, evidenceRequirement: { clientControlId: controlId } }, select: { id: true } });
      return rows.map((r) => r.id);
    });
  }

  recordApproval(scope: TenantScope, controlId: string, input: ApprovalWrite, before: ManagementContext['before'], audit: Parameters<ControlManagementRepository['recordApproval']>[4]): Promise<ApprovalSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirstOrThrow({ where: { id: controlId }, select: { serviceId: true, ownCode: true, control: { select: { code: true } } } });
      const parameters = await this.evaluationParameters.load(tx);
      const now = new Date();
      const row = await tx.controlApproval.create({
        data: { tenantId: scope.companyId, clientControlId: controlId, step: input.step, decision: input.decision, reason: input.reason, actorId: input.actorId, at: now, windowStart: input.windowStart },
        select: { id: true },
      });
      if (input.decision === 'returned') {
        // Devolver quita las aprobaciones vigentes y deja sin contar las entregas que causaron la devolución (D132 punto 3).
        await tx.controlApproval.updateMany({ where: { clientControlId: controlId, decision: 'approved', invalidatedAt: null }, data: { invalidatedAt: now } });
        if (input.returnedSubmissionIds.length > 0) {
          await tx.evidenceSubmission.updateMany({ where: { id: { in: [...input.returnedSubmissionIds] } }, data: { returnedApprovalId: row.id } });
        }
      }
      const { snapshots: after, readouts } = await captureControlReadouts(tx, control.serviceId, parameters);
      const code = control.control?.code ?? control.ownCode;
      const saved: ApprovalSaved = { id: row.id, controlId, controlCode: code, at: now, write: input, stateAfter: after.get(controlId)?.managementState ?? input.stateBefore };
      await insertAuditLog(tx, audit(saved));
      // Los avisos de la gestión (D132): la primera aprobación al `admin_empresa`; la devolución, al delegado y al responsable. Nacen en esta transacción.
      const type = input.decision === 'approved' ? (input.step === 'owner' ? 'control_owner_approved' : null) : 'control_returned';
      if (type) await this.notifications.emitForControls(tx, scope.companyId, [{ type, controlId, actorId: input.actorId, dedupeSuffix: row.id }]);
      await recordChangesBetween(
        tx, { tenantId: scope.companyId, serviceId: control.serviceId, cause: 'control_approval', actor: { userId: input.actorId, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent }, notifications: this.notifications },
        before, after,
      );
      const readout = readouts.get(controlId);
      if (readout) await invalidateStaleRequests(tx, scope.companyId, [readout], { userId: input.actorId, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent });
      return saved;
    }, STATE_TRANSACTION);
  }

  recordResult(scope: TenantScope, controlId: string, testId: string, input: ResultWrite, before: ManagementContext['before'], audit: Parameters<ControlManagementRepository['recordResult']>[5]): Promise<ResultSaved> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirstOrThrow({ where: { id: controlId }, select: { serviceId: true } });
      const parameters = await this.evaluationParameters.load(tx);
      const row = await tx.manualTestResult.create({
        data: { tenantId: scope.companyId, clientControlId: controlId, testId, result: input.result, note: input.note, registeredBy: input.registeredBy },
        select: { id: true, registeredAt: true, registeredByUser: { select: { id: true, name: true, lastName: true } } },
      });
      const { snapshots: after, readouts } = await captureControlReadouts(tx, control.serviceId, parameters);
      const saved: ResultSaved = {
        id: row.id, controlId, testId, result: input.result, note: input.note, registeredBy: row.registeredByUser, registeredAt: row.registeredAt,
        stateBefore: before.get(controlId)?.managementState ?? 'non_compliant', stateAfter: after.get(controlId)?.managementState ?? 'non_compliant',
      };
      await insertAuditLog(tx, audit(saved));
      await recordChangesBetween(
        tx, { tenantId: scope.companyId, serviceId: control.serviceId, cause: 'manual_test_result', actor: { userId: input.registeredBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent }, notifications: this.notifications },
        before, after,
      );
      const readout = readouts.get(controlId);
      if (readout) await invalidateStaleRequests(tx, scope.companyId, [readout], { userId: input.registeredBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent });
      return saved;
    }, STATE_TRANSACTION);
  }
}
