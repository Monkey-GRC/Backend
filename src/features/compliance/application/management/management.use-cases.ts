import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { STATE_TRANSACTION } from '../../../../common/tenancy/state-transaction';
import { TransactionRunner } from '../../../../common/tenancy/transaction-runner';
import { approvalStepFor, approverStepOf, canRegisterManualResult, controlWindowStart } from '../../domain/controls/management-state';
import type { ApprovalStep } from '../../domain/controls/management-state';
import { pendingOverrideOf } from '../../domain/controls/management-extras';
import { ControlManagementRepository } from '../../domain/management/control-management.repository';
import { ControlDetail, GetControlUseCase } from '../controls/get-control.use-case';
import { ControlApprovalDto, ManualTestResultDto } from './management.dto';

const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const text = (value: string | undefined) => value?.trim() || null;

// D132 · Aprobar o devolver el control. Toda la decisión (leer el estado, decidir el paso, escribir) va en UNA transacción con el control bloqueado: dos aprobaciones a la vez no se pisan.
@Injectable()
export class ApproveControlUseCase {
  constructor(
    private readonly repo: ControlManagementRepository,
    private readonly getControl: GetControlUseCase,
    private readonly tx: TransactionRunner,
  ) {}

  async execute(p: Principal, controlId: string, dto: ControlApprovalDto, meta: RequestMeta): Promise<ControlDetail> {
    const scope = scopeOf(p);
    return this.tx.run(scope, async () => {
      const ctx = await this.repo.lockAndRead(scope, controlId);
      if (!ctx) throw new DomainError('NOT_FOUND'); // inexistente, de otra empresa o dado de baja
      const { readout, data, before } = ctx;
      const { access } = readout.control;
      const state = readout.managementState;

      // Quién puede actuar sale de la matriz: `controls.approve_first` (el responsable, solo lo suyo) o `controls.approve_final` (el `admin_empresa`); el resto, 403.
      const kind = approverStepOf(p, access);
      if (!kind) throw new DomainError('FORBIDDEN');

      let step: ApprovalStep;
      let reason: string | null = null;
      let returnedIds: string[] = [];
      if (dto.decision === 'approve') {
        const action = approvalStepFor(p, access, state);
        if ('error' in action) throw new DomainError(action.error);
        step = action.step;
        // MD-529 · Con una corrección de nivel pendiente no se aprueba: se decide primero (el nivel final decide si el control cumple).
        if (pendingOverrideOf(readout.control.extras?.overrides ?? [], readout.suggestedLevelValue, readout.windowStart)) throw new DomainError('LEVEL_OVERRIDE_PENDING');
      } else {
        reason = text(dto.reason);
        if (!reason) throw new ValidationException([{ field: 'reason', code: 'reason.required' }]);
        const wanted = [...new Set(dto.returned_submission_ids ?? [])];
        returnedIds = wanted.length > 0 ? await this.repo.submissionsOfControl(scope, controlId, wanted) : [];
        if (returnedIds.length !== wanted.length) throw new ValidationException([{ field: 'returned_submission_ids', code: 'returned_submission_ids.invalid' }]);
        if (state !== 'pending_approval' && state !== 'owner_approved') throw new DomainError('NOTHING_TO_RETURN');
        step = kind;
      }

      const windowStart = controlWindowStart(readout.requirements.filter((r) => r.status !== 'not_applicable').map((r) => r.requirement.periodicity), data.signals.now, data.signals.parameters.validityWindows);
      await this.repo.recordApproval(
        scope, controlId,
        { step, decision: dto.decision === 'approve' ? 'approved' : 'returned', reason, actorId: p.userId, windowStart, returnedSubmissionIds: returnedIds, stateBefore: state, meta },
        before,
        (done): AuditEntry => ({
          tenantId: p.companyId, userId: p.userId, action: dto.decision === 'approve' ? 'control_approval.approve' : 'control_approval.return', resource: 'control_approval', result: 'success',
          ipAddress: meta.ipAddress, userAgent: meta.userAgent,
          beforeState: { control_id: controlId, control_code: done.controlCode, management_state: state },
          afterState: {
            approval_id: done.id, control_id: controlId, control_code: done.controlCode, step, decision: done.write.decision, management_state: done.stateAfter,
            ...(reason ? { reason } : {}), ...(returnedIds.length > 0 ? { returned_submission_ids: returnedIds } : {}),
          },
        }),
      );
      return this.getControl.execute(p, controlId, undefined);
    }, STATE_TRANSACTION);
  }
}

// D140 punto 2 · El resultado de una prueba manual lo registra el responsable del control (o el `admin_empresa` si el control no tiene responsable o lo es él). Es del control, no del servicio (D129).
@Injectable()
export class RegisterManualResultUseCase {
  constructor(private readonly repo: ControlManagementRepository, private readonly tx: TransactionRunner) {}

  async execute(p: Principal, controlId: string, testId: string, dto: ManualTestResultDto, meta: RequestMeta) {
    const scope = scopeOf(p);
    return this.tx.run(scope, async () => {
      const ctx = await this.repo.lockAndRead(scope, controlId);
      if (!ctx) throw new DomainError('NOT_FOUND'); // inexistente, de otra empresa o dado de baja
      const { readout, before } = ctx;
      if (!canRegisterManualResult(p, readout.control.access)) throw new DomainError('FORBIDDEN');
      const test = readout.tests.find((t) => t.test.testId === testId);
      if (!test) throw new DomainError('NOT_FOUND');
      // Una prueba automática la resuelve el motor y una documental, su evidencia. La que además de sus checks tiene una parte manual sí admite el resultado (D160).
      if (!(test.manual || test.manualPart) || test.test.testType === 'documentary') throw new DomainError('TEST_NOT_MANUAL');
      const note = text(dto.note);
      if (dto.result !== 'correct' && !note) throw new ValidationException([{ field: 'note', code: 'note.required' }]);

      return this.repo.recordResult(
        scope, controlId, testId, { result: dto.result, note, registeredBy: p.userId, meta },
        before,
        (done): AuditEntry => ({
          tenantId: p.companyId, userId: p.userId, action: 'manual_test_result.register', resource: 'manual_test_result', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
          beforeState: { control_id: controlId, management_state: done.stateBefore },
          afterState: { id: done.id, control_id: controlId, test_id: testId, test_code: test.test.code, result: done.result, management_state: done.stateAfter },
        }),
      );
    }, STATE_TRANSACTION);
  }
}
