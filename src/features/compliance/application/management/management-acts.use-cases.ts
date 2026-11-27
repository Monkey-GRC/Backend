import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { scopeOf } from '../../../../common/authorization/permission-matrix';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { STATE_TRANSACTION } from '../../../../common/tenancy/state-transaction';
import { TransactionRunner } from '../../../../common/tenancy/transaction-runner';
import { withinScope } from '../../domain/controls/control-access';
import { isEventRequirement, type ControlReadout } from '../../domain/controls/control-readout';
import {
  checkProposal, isApplicabilityInForce, isDueDatePast, isOccurrenceInFuture, isValidRequest, leadsControl, levelOfValue, pendingOverrideOf, planOfTest, quarterCoverage, sameWindowStart,
} from '../../domain/controls/management-extras';
import { LEVEL_VALUE } from '../../domain/engine/v2/types';
import { currentWindow } from '../../domain/engine/v2/windows';
import { ControlManagementRepository, ManagementContext } from '../../domain/management/control-management.repository';
import { ActContext, ActSaved, ManagementActsRepository, RequestKind } from '../../domain/management/management-acts.repository';
import { DeclareNoOccurrencesDto, NotApplicableRequestDto, ProposeLevelDto, RegisterOccurrenceDto, RegisterPlanDto, RequestDecisionDto } from './acts.dto';

// MD-529 (contracts/cumplimiento/aprobacion.md) · Corregir el nivel (R5), el plan de remediación, el «No aplica» de un requisito, las ocurrencias y la declaración «sin ocurrencias». Cada acto va en UNA
// transacción con el control bloqueado (dos a la vez no se pisan): se lee el control, se decide quién puede y si el estado lo permite, se escribe y se audita. Quién lleva el control (G-05) sale de la
// matriz y de las partes del control, nunca de lo que mande el cliente.

const scopeFor = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const text = (value: string | undefined) => value?.trim() || null;
const required = (field: string, value: string | undefined): string => {
  const v = text(value);
  if (!v) throw new ValidationException([{ field, code: `${field}.required` }]);
  return v;
};
const dayOf = (d: Date) => d.toISOString().slice(0, 10);

/** El resultado de un acto: el control releído ya con lo escrito y el id del registro creado o decidido. */
export type ActOutcome = { readout: ControlReadout; id: string; direct: boolean };

abstract class ActUseCase {
  constructor(protected readonly management: ControlManagementRepository, protected readonly acts: ManagementActsRepository, protected readonly tx: TransactionRunner) {}

  protected async lock(p: Principal, controlId: string): Promise<ManagementContext> {
    const ctx = await this.management.lockAndRead(scopeFor(p), controlId);
    if (!ctx) throw new DomainError('NOT_FOUND'); // inexistente, de otra empresa o dado de baja
    return ctx;
  }

  protected act(p: Principal, ctx: ManagementContext, meta: RequestMeta): ActContext {
    return { actorId: p.userId, meta, before: ctx.before };
  }

  protected entry(p: Principal, meta: RequestMeta, action: string, resource: string, before: Record<string, unknown>, after: Record<string, unknown>): AuditEntry {
    return { tenantId: p.companyId, userId: p.userId, action, resource, result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent, beforeState: before, afterState: after };
  }

  /** La respuesta sale de la foto de después que ya leyó el repositorio al escribir: no se lee el servicio otra vez. */
  protected finish(saved: ActSaved, direct: boolean): ActOutcome {
    return { readout: saved.readout, id: saved.id, direct };
  }

  protected run<T>(p: Principal, fn: () => Promise<T>): Promise<T> {
    return this.tx.run(scopeFor(p), fn, STATE_TRANSACTION);
  }

  protected async controlOfRequest(p: Principal, kind: RequestKind, requestId: string): Promise<string> {
    const controlId = await this.acts.controlOfRequest(scopeFor(p), kind, requestId);
    if (!controlId) throw new DomainError('NOT_FOUND');
    return controlId;
  }
}

const decisionOf = (dto: RequestDecisionDto): { decision: 'approve' | 'reject'; reason: string | null } => {
  const reason = text(dto.reason);
  if (dto.decision === 'reject' && !reason) throw new ValidationException([{ field: 'reason', code: 'reason.required' }]);
  return { decision: dto.decision, reason };
};

/** La prueba del control que hoy está en excepción en un requisito aplicable, con su requisito; `null` si no hay. */
const exceptionTestOf = (readout: ControlReadout, testId: string) => {
  for (const r of readout.requirements) {
    if (r.requirement.isApplicable === false || r.status === 'not_applicable') continue;
    const t = r.tests.find((x) => x.test.testId === testId && x.status === 'exception');
    if (t) return { requirementId: r.requirement.id, test: t.test };
  }
  return null;
};
export const isExceptionTest = (readout: ControlReadout, testId: string): boolean => exceptionTestOf(readout, testId) !== null;

// --- R5 ----------------------------------------------------------------------------------------------------------------------------------------------

@Injectable()
export class ProposeLevelOverrideUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, dto: ProposeLevelDto, meta: RequestMeta): Promise<ActOutcome> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (!leadsControl(scopeOf('controls.propose_level', p.role), p.userId, readout.control.access)) throw new DomainError('FORBIDDEN');
      const justification = required('justification', dto.justification);
      const suggested = readout.suggestedLevelValue;
      const overrides = readout.control.extras?.overrides ?? [];
      if (pendingOverrideOf(overrides, suggested, readout.windowStart)) throw new DomainError('LEVEL_OVERRIDE_ALREADY_PENDING');
      const proposed = LEVEL_VALUE[dto.proposed_level as keyof typeof LEVEL_VALUE];
      const problem = checkProposal(suggested, readout.levelValue, proposed);
      if (problem === 'proposed_level.invalid') throw new ValidationException([{ field: 'proposed_level', code: problem }]);
      if (problem) throw new DomainError(problem);

      const direct = scopeOf('controls.decide_level', p.role) === 'all';
      const staleIds = overrides.filter((o) => o.status === 'pending' && o.invalidatedAt === null && !isValidRequest(o, suggested, readout.windowStart)).map((o) => o.id);
      const supersedeIds = overrides.filter((o) => o.status === 'approved' && o.invalidatedAt === null).map((o) => o.id);
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState, level: readout.level };
      const saved = await this.acts.createLevelOverride(
        scopeFor(p), controlId, { suggestedValue: suggested, proposedValue: proposed, justification, windowStart: readout.windowStart, direct, staleIds, supersedeIds }, this.act(p, ctx, meta),
        (stateAfter) => {
          const after = { control_id: controlId, suggested_level: levelOfValue(suggested), proposed_level: dto.proposed_level, justification, status: direct ? 'approved' : 'pending', management_state: stateAfter };
          return [this.entry(p, meta, 'control_level_override.propose', 'control_level_override', before, after), ...(direct ? [this.entry(p, meta, 'control_level_override.approve', 'control_level_override', before, after)] : [])];
        },
      );
      return this.finish(saved, direct);
    });
  }
}

@Injectable()
export class DecideLevelOverrideUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, requestId: string, dto: RequestDecisionDto, meta: RequestMeta): Promise<ActOutcome & { controlId: string }> {
    return this.run(p, async () => {
      const controlId = await this.controlOfRequest(p, 'level', requestId);
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (scopeOf('controls.decide_level', p.role) !== 'all') throw new DomainError('FORBIDDEN');
      const override = readout.control.extras?.overrides.find((o) => o.id === requestId);
      if (!override) throw new DomainError('NOT_FOUND');
      const { decision, reason } = decisionOf(dto);
      if (override.status !== 'pending') throw new DomainError('ALREADY_DECIDED');
      if (!isValidRequest(override, readout.suggestedLevelValue, readout.windowStart)) throw new DomainError('REQUEST_NO_LONGER_VALID');
      const supersedeIds = (readout.control.extras?.overrides ?? []).filter((o) => o.id !== requestId && o.status === 'approved' && o.invalidatedAt === null).map((o) => o.id);
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState, level: readout.level };
      const saved = await this.acts.decideLevelOverride(
        scopeFor(p), controlId, requestId, { decision, reason, supersedeIds }, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, `control_level_override.${decision}`, 'control_level_override', before, { id: requestId, control_id: controlId, proposed_level: levelOfValue(override.proposedValue), ...(reason ? { reason } : {}), management_state: stateAfter }),
      );
      return { ...(this.finish(saved, false)), controlId };
    });
  }
}

// --- Plan de remediación -----------------------------------------------------------------------------------------------------------------------------

@Injectable()
export class RegisterRemediationPlanUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, dto: RegisterPlanDto, meta: RequestMeta): Promise<ActOutcome> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (!leadsControl(scopeOf('controls.plan_register', p.role), p.userId, readout.control.access)) throw new DomainError('FORBIDDEN');
      const what = required('what', dto.what);
      const due = new Date(`${dto.due_date}T00:00:00.000Z`);
      if (Number.isNaN(due.getTime())) throw new ValidationException([{ field: 'due_date', code: 'date.invalid' }]);
      if (isDueDatePast(due, new Date())) throw new ValidationException([{ field: 'due_date', code: 'due_date.past' }]);
      if (!(await this.acts.isAssignable(scopeFor(p), dto.owner_id))) throw new ValidationException([{ field: 'owner_id', code: 'owner_id.invalid' }]);
      if (!readout.tests.some((t) => t.test.testId === dto.test_id)) throw new DomainError('NOT_FOUND');
      const found = exceptionTestOf(readout, dto.test_id);
      if (!found) throw new DomainError('TEST_NOT_IN_EXCEPTION');
      const plans = readout.control.extras?.plans ?? [];
      const existing = planOfTest(plans, dto.test_id, readout.windowStart);
      if (existing && (existing.status === 'pending' || existing.status === 'approved')) throw new DomainError('PLAN_ALREADY_EXISTS');

      const direct = scopeOf('controls.plan_decide', p.role) === 'all';
      const staleIds = plans.filter((x) => x.testId === dto.test_id && ['pending', 'approved'].includes(x.status) && x.invalidatedAt === null && !sameWindowStart(x.windowStart, readout.windowStart)).map((x) => x.id);
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.createPlan(
        scopeFor(p), controlId, { testId: dto.test_id, requirementId: found.requirementId, what, assigneeId: dto.owner_id, dueDate: due, windowStart: readout.windowStart, direct, staleIds }, this.act(p, ctx, meta),
        (stateAfter) => {
          const after = { control_id: controlId, test_id: dto.test_id, test_code: found.test.code, what, owner_id: dto.owner_id, due_date: dto.due_date, status: direct ? 'approved' : 'pending', management_state: stateAfter };
          return [this.entry(p, meta, 'remediation_plan.register', 'remediation_plan', before, after), ...(direct ? [this.entry(p, meta, 'remediation_plan.approve', 'remediation_plan', before, after)] : [])];
        },
      );
      return this.finish(saved, direct);
    });
  }
}

@Injectable()
export class DecideRemediationPlanUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, requestId: string, dto: RequestDecisionDto, meta: RequestMeta): Promise<ActOutcome & { controlId: string }> {
    return this.run(p, async () => {
      const controlId = await this.controlOfRequest(p, 'plan', requestId);
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (scopeOf('controls.plan_decide', p.role) !== 'all') throw new DomainError('FORBIDDEN');
      const plan = readout.control.extras?.plans.find((x) => x.id === requestId);
      if (!plan) throw new DomainError('NOT_FOUND');
      const { decision, reason } = decisionOf(dto);
      if (plan.status !== 'pending') throw new DomainError('ALREADY_DECIDED');
      if (plan.invalidatedAt !== null || !sameWindowStart(plan.windowStart, readout.windowStart) || !isExceptionTest(readout, plan.testId)) throw new DomainError('REQUEST_NO_LONGER_VALID');
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.decidePlan(
        scopeFor(p), controlId, requestId, { decision, reason }, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, `remediation_plan.${decision}`, 'remediation_plan', before, { id: requestId, control_id: controlId, test_id: plan.testId, ...(reason ? { reason } : {}), management_state: stateAfter }),
      );
      return { ...(this.finish(saved, false)), controlId };
    });
  }
}

// --- «No aplica» ---------------------------------------------------------------------------------------------------------------------------------------

const requirementOf = (readout: ControlReadout, requirementId: string) => {
  if (readout.control.origin === 'own') return null;
  return readout.requirements.find((r) => r.requirement.id === requirementId) ?? null;
};

@Injectable()
export class RequestNotApplicableUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, requirementId: string, dto: NotApplicableRequestDto, meta: RequestMeta): Promise<ActOutcome> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (!leadsControl(scopeOf('controls.na_request', p.role), p.userId, readout.control.access)) throw new DomainError('FORBIDDEN');
      const target = requirementOf(readout, requirementId);
      if (!target) throw new DomainError('NOT_FOUND');
      const reason = required('reason', dto.reason);
      const rows = readout.control.extras?.applicability.get(requirementId) ?? [];
      if (!target.requirement.isApplicable) throw new DomainError('ALREADY_NOT_APPLICABLE');
      if (rows.some((r) => r.status === 'pending')) throw new DomainError('REQUEST_ALREADY_PENDING');
      if (readout.requirements.filter((r) => r.requirement.isApplicable).length <= 1) throw new DomainError('LAST_APPLICABLE_REQUIREMENT');
      const direct = scopeOf('controls.na_decide', p.role) === 'all';
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.createApplicabilityRequest(
        scopeFor(p), controlId, { requirementId, reason, direct }, this.act(p, ctx, meta),
        (stateAfter) => {
          const after = { control_id: controlId, requirement_id: requirementId, requirement_code: target.requirement.code, reason, status: direct ? 'approved' : 'pending', management_state: stateAfter };
          return [this.entry(p, meta, 'requirement_not_applicable.request', 'requirement_not_applicable', before, after), ...(direct ? [this.entry(p, meta, 'requirement_not_applicable.approve', 'requirement_not_applicable', before, after)] : [])];
        },
      );
      return this.finish(saved, direct);
    });
  }
}

@Injectable()
export class DecideNotApplicableUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, requestId: string, dto: RequestDecisionDto, meta: RequestMeta): Promise<ActOutcome & { controlId: string }> {
    return this.run(p, async () => {
      const controlId = await this.controlOfRequest(p, 'not_applicable', requestId);
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (scopeOf('controls.na_decide', p.role) !== 'all') throw new DomainError('FORBIDDEN');
      const request = [...(readout.control.extras?.applicability.values() ?? [])].flat().find((r) => r.id === requestId);
      if (!request) throw new DomainError('NOT_FOUND');
      const { decision, reason } = decisionOf(dto);
      if (request.status !== 'pending') throw new DomainError('ALREADY_DECIDED');
      const target = requirementOf(readout, request.requirementId);
      if (!target) throw new DomainError('NOT_FOUND');
      if (decision === 'approve' && readout.requirements.filter((r) => r.requirement.isApplicable).length <= 1) throw new DomainError('LAST_APPLICABLE_REQUIREMENT');
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.decideApplicability(
        scopeFor(p), controlId, requestId, request.requirementId, { decision, reason }, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, `requirement_not_applicable.${decision}`, 'requirement_not_applicable', before, { id: requestId, control_id: controlId, requirement_code: target.requirement.code, ...(reason ? { reason } : {}), management_state: stateAfter }),
      );
      return { ...(this.finish(saved, false)), controlId };
    });
  }
}

@Injectable()
export class RevertNotApplicableUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, requirementId: string, dto: NotApplicableRequestDto, meta: RequestMeta): Promise<ActOutcome> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (!leadsControl(scopeOf('controls.na_request', p.role), p.userId, readout.control.access)) throw new DomainError('FORBIDDEN');
      const target = requirementOf(readout, requirementId);
      if (!target) throw new DomainError('NOT_FOUND');
      const reason = required('reason', dto.reason);
      const inForce = (readout.control.extras?.applicability.get(requirementId) ?? []).find(isApplicabilityInForce);
      if (target.requirement.isApplicable || !inForce) throw new DomainError('NOT_NOT_APPLICABLE');
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.revertApplicability(
        scopeFor(p), controlId, inForce.id, requirementId, reason, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, 'requirement_not_applicable.revert', 'requirement_not_applicable', before, { id: inForce.id, control_id: controlId, requirement_code: target.requirement.code, reason, management_state: stateAfter }),
      );
      return this.finish(saved, false);
    });
  }
}

// --- «Cuando sea requerido»: ocurrencias y declaración (DT-115) ---------------------------------------------------------------------------------------------

const onDemandOf = (readout: ControlReadout, requirementId: string) => {
  const target = requirementOf(readout, requirementId);
  if (!target) throw new DomainError('NOT_FOUND');
  if (!isEventRequirement(target.requirement)) throw new DomainError('REQUIREMENT_NOT_ON_DEMAND');
  return target;
};

@Injectable()
export class RegisterOccurrenceUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, requirementId: string, dto: RegisterOccurrenceDto, meta: RequestMeta): Promise<ActOutcome> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout } = ctx;
      if (!withinScope('evidence.upload', p, readout.control.access)) throw new DomainError('FORBIDDEN');
      const target = onDemandOf(readout, requirementId);
      const description = required('description', dto.description);
      const occurredOn = new Date(`${dto.occurred_on}T00:00:00.000Z`);
      if (Number.isNaN(occurredOn.getTime())) throw new ValidationException([{ field: 'occurred_on', code: 'date.invalid' }]);
      if (isOccurrenceInFuture(occurredOn, new Date())) throw new ValidationException([{ field: 'occurred_on', code: 'occurred_on.future' }]);
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.createOccurrence(
        scopeFor(p), controlId, { requirementId, occurredOn, description }, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, 'requirement_occurrence.register', 'requirement_occurrence', before, { control_id: controlId, requirement_code: target.requirement.code, occurred_on: dto.occurred_on, description, management_state: stateAfter }),
      );
      if (saved.invalidatedDeclarationIds.length > 0) {
        // La declaración de ese trimestre queda sin efecto: su rastro va aparte, en la misma transacción.
        await this.acts.auditExtra(scopeFor(p), saved.invalidatedDeclarationIds.map((id) => this.entry(p, meta, 'no_occurrence_declaration.invalidate', 'no_occurrence_declaration', { id, control_id: controlId }, { id, control_id: controlId, cause: 'occurrence_registered' })));
      }
      return this.finish(saved, false);
    });
  }
}

@Injectable()
export class DeclareNoOccurrencesUseCase extends ActUseCase {
  constructor(management: ControlManagementRepository, acts: ManagementActsRepository, tx: TransactionRunner) {
    super(management, acts, tx);
  }

  execute(p: Principal, controlId: string, requirementId: string, dto: DeclareNoOccurrencesDto, meta: RequestMeta): Promise<ActOutcome & { window: { start: Date; end: Date } }> {
    return this.run(p, async () => {
      const ctx = await this.lock(p, controlId);
      const { readout, data } = ctx;
      if (!leadsControl(scopeOf('controls.declare_no_occurrences', p.role), p.userId, readout.control.access)) throw new DomainError('FORBIDDEN');
      const target = onDemandOf(readout, requirementId);
      const quarter = currentWindow({ periodicity: 'quarterly', now: data.signals.now });
      if (!quarter) throw new DomainError('NOT_FOUND');
      const occurrences = (readout.control.extras?.occurrences.get(requirementId) ?? []).filter((o) => o.occurredOn >= quarter.start && o.occurredOn < quarter.end);
      if (occurrences.length > 0) throw new DomainError('OCCURRENCES_EXIST');
      if (quarterCoverage([], (readout.control.extras?.declarations.get(requirementId) ?? []).some((d) => d.windowStart.getTime() === quarter.start.getTime()), false) === 'declared') throw new DomainError('ALREADY_DECLARED');
      const end = new Date(quarter.end.getTime() - 86_400_000);
      const before = { control_id: controlId, control_code: readout.control.catalogCode ?? readout.control.ownCode, management_state: readout.managementState };
      const saved = await this.acts.createDeclaration(
        scopeFor(p), controlId, { requirementId, windowStart: quarter.start, windowEnd: end, note: text(dto.note) }, this.act(p, ctx, meta),
        (stateAfter) => this.entry(p, meta, 'no_occurrence_declaration.declare', 'no_occurrence_declaration', before, { control_id: controlId, requirement_code: target.requirement.code, window_start: dayOf(quarter.start), window_end: dayOf(end), management_state: stateAfter }),
      );
      return { ...(this.finish(saved, false)), window: { start: quarter.start, end } };
    });
  }
}
