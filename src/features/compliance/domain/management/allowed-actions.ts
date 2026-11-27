import { scopeOf } from '../../../../common/authorization/permission-matrix';
import { approvalStepFor, approverStepOf, canRegisterManualResult } from '../controls/management-state';
import { isOwnerOf, isPartyOf, Parties, withinScope } from '../controls/control-access';
import { isEventRequirement, type ControlReadout } from '../controls/control-readout';
import { isApplicabilityInForce, leadsControl, pendingOverrideOf, planOfTest, proposableLevels } from '../controls/management-extras';
import { currentWindow } from '../engine/v2/windows';

// MD-529 (aprobacion.md, «El detalle del control») · Lo que quien llama puede hacer AHORA sobre un control, para que la pantalla pinte los botones sin duplicar la matriz de permisos. Lógica pura: usa las
// mismas reglas que los casos de uso (nunca incluye una acción que acabaría en 403) y es solo una ayuda: cada escritura vuelve a comprobarse en el servidor.

export const MANAGEMENT_ACTIONS = [
  'approve', 'return', 'register_result', 'propose_level', 'decide_level', 'register_plan', 'decide_plan', 'request_not_applicable', 'decide_not_applicable', 'revert_not_applicable', 'declare_no_occurrences', 'register_occurrence',
] as const;
export type ManagementAction = (typeof MANAGEMENT_ACTIONS)[number];

export type Actor = { role: string; userId: string };
export type ActionsView = {
  /** La unión de las de los elementos, más las que son del control entero. */
  control: ManagementAction[];
  /** Por prueba en excepción. */
  exceptions: ReadonlyMap<string, ManagementAction[]>;
  /** Por requisito. */
  requirements: ReadonlyMap<string, ManagementAction[]>;
  /** Por prueba manual no documental. */
  manualTests: ReadonlyMap<string, ManagementAction[]>;
};

/** Quién ve los niveles en `management.level` (duda 2 de MD-529): `auditor`, `admin_empresa` y el responsable dueño del control. */
export const seesLevels = (p: Actor, readout: ControlReadout): boolean => scopeOf('controls.approve_final', p.role) === 'all' || p.role === 'auditor' || isOwnerOf(p.userId, readout.control.access);
/** Lo mismo con solo las partes del control (el historial no lee el control entero). */
export const seesLevelsOf = (p: Actor, access: Parties): boolean => scopeOf('controls.approve_final', p.role) === 'all' || p.role === 'auditor' || isOwnerOf(p.userId, access);
/** Quién ve los requisitos en `management.requirements[]`: los mismos y el ejecutor, que registra las ocurrencias. */
export const seesRequirements = (p: Actor, readout: ControlReadout): boolean => seesLevels(p, readout) || isPartyOf(p.userId, readout.control.access);

export function allowedActionsOf(p: Actor, readout: ControlReadout, now: Date): ActionsView {
  const access = readout.control.access;
  const extras = readout.control.extras;
  const lead = (permission: Parameters<typeof scopeOf>[0]) => leadsControl(scopeOf(permission, p.role), p.userId, access);
  const decides = (permission: Parameters<typeof scopeOf>[0]) => scopeOf(permission, p.role) === 'all';
  const state = readout.managementState;
  const suggested = readout.suggestedLevelValue;
  const control = new Set<ManagementAction>();

  const pendingLevel = pendingOverrideOf(extras?.overrides ?? [], suggested, readout.windowStart);
  const step = approverStepOf(p, access);
  if (step) {
    if (!pendingLevel && 'step' in approvalStepFor(p, access, state)) control.add('approve');
    if (state === 'pending_approval' || state === 'owner_approved') control.add('return');
  }
  if (canRegisterManualResult(p, access)) control.add('register_result');
  if (lead('controls.propose_level') && !pendingLevel && proposableLevels(suggested, readout.levelValue).length > 0) control.add('propose_level');
  if (decides('controls.decide_level') && pendingLevel) control.add('decide_level');

  const plans = extras?.plans ?? [];
  const exceptions = new Map<string, ManagementAction[]>();
  for (const r of readout.requirements) {
    if (!r.requirement.isApplicable || r.status === 'not_applicable') continue;
    for (const t of r.tests) {
      if (t.status !== 'exception' || exceptions.has(t.test.testId)) continue;
      const plan = planOfTest(plans, t.test.testId, readout.windowStart);
      const actions: ManagementAction[] = [];
      if (!plan || plan.status === 'rejected') {
        if (lead('controls.plan_register')) actions.push('register_plan');
      } else if (plan.status === 'pending' && decides('controls.plan_decide')) actions.push('decide_plan');
      exceptions.set(t.test.testId, actions);
      actions.forEach((a) => control.add(a));
    }
  }

  const quarter = currentWindow({ periodicity: 'quarterly', now });
  const applicableCount = readout.requirements.filter((r) => r.requirement.isApplicable).length;
  const requirements = new Map<string, ManagementAction[]>();
  if (readout.control.origin !== 'own') {
    for (const r of readout.requirements) {
      const id = r.requirement.id;
      const rows = extras?.applicability.get(id) ?? [];
      const actions: ManagementAction[] = [];
      if (r.requirement.isApplicable) {
        if (lead('controls.na_request') && !rows.some((x) => x.status === 'pending') && applicableCount > 1) actions.push('request_not_applicable');
        if (decides('controls.na_decide') && rows.some((x) => x.status === 'pending') && applicableCount > 1) actions.push('decide_not_applicable');
      } else if (lead('controls.na_request') && rows.some(isApplicabilityInForce)) actions.push('revert_not_applicable');
      if (r.requirement.isApplicable && isEventRequirement(r.requirement)) {
        if (withinScope('evidence.upload', p, access)) actions.push('register_occurrence');
        const inQuarter = quarter ? (extras?.occurrences.get(id) ?? []).some((o) => o.occurredOn >= quarter.start && o.occurredOn < quarter.end) : true;
        const declared = quarter ? (extras?.declarations.get(id) ?? []).some((d) => d.windowStart.getTime() === quarter.start.getTime()) : true;
        if (lead('controls.declare_no_occurrences') && !inQuarter && !declared) actions.push('declare_no_occurrences');
      }
      requirements.set(id, actions);
      actions.forEach((a) => control.add(a));
    }
  }

  const manualTests = new Map<string, ManagementAction[]>();
  if (canRegisterManualResult(p, access)) for (const t of readout.tests) if (t.manual && t.test.testType !== 'documentary') manualTests.set(t.test.testId, ['register_result']);

  return { control: MANAGEMENT_ACTIONS.filter((a) => control.has(a)), exceptions, requirements, manualTests };
}
