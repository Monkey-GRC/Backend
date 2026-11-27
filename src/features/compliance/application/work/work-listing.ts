import { Page } from '../../../../common/pagination/page';
import { AssignmentListingData } from '../../domain/assignments/assignment.repository';
import { isOwnerOf, isPartyOf } from '../../domain/controls/control-access';
import { compareOwnCode, ControlReadout, exceptionTestIdsOf, isPendingPlanLive, readControl, Readiness } from '../../domain/controls/control-readout';
import { Coverage, Ratio, summarizeControls } from '../../domain/overview/compliance-overview';
import { ControlState } from '../../domain/engine/states';
import { isValidRequest, leadsControl, pendingOverrideOf } from '../../domain/controls/management-extras';
import { classifyControlWork, pendingItemsOf, RoleInControl, WORK_BUCKETS, WorkBucket } from '../../domain/work/work-bucket';
import { ControlDeliveries, WorkPerson } from '../../domain/work/work.repository';
import { fold } from '../assignments/assignment-listing';

// Lógica pura de `GET /v1/me/work` y `GET /v1/team/workload` (D122): de lo que se cargó (el estado de cada servicio, una sola vez) a lo que se muestra. Sin Prisma ni Nest.

export type Progress = { readiness: Readiness; progress: Ratio; coverage: Coverage };

export type MyControl = { service: { id: string; name: string }; readout: ControlReadout };

/** Los controles de los que la persona es dueña o ejecutora ACTIVA (D102), ya leídos con el motor. */
export function pickMyControls(userId: string, data: AssignmentListingData): MyControl[] {
  const mine: MyControl[] = [];
  for (const service of data.services) {
    for (const control of service.readout.controls) {
      if (!isPartyOf(userId, control.access)) continue;
      mine.push({ service: { id: service.id, name: service.name }, readout: readControl(control, service.readout) });
    }
  }
  return mine;
}

export type WorkListFilters = { page: number; pageSize: number; bucket?: WorkBucket; q?: string; locale?: string };

/** MD-529 · Lo que le toca decidir a quien mira (`work_decision_kind`). */
export const WORK_DECISION_KINDS = ['control_approval', 'manual_result', 'level_override', 'remediation_plan', 'not_applicable'] as const;
export type WorkDecisionKind = (typeof WORK_DECISION_KINDS)[number];

export type WorkListItem = {
  clientControlId: string;
  code: string;
  title: string;
  service: { id: string; name: string };
  roleInControl: RoleInControl | 'approver';
  bucket: WorkBucket;
  pendingItems: number;
  state: ControlState;
  /** MD-529 · Las decisiones que le tocan en este control (`[]` fuera de `to_review`). */
  pendingDecisions: WorkDecisionKind[];
};

const NO_DELIVERIES: ControlDeliveries = { items: [], openObservations: 0 };

export function listMyWork(userId: string, mine: readonly MyControl[], deliveries: ReadonlyMap<string, ControlDeliveries>, f: WorkListFilters): { page: Page<WorkListItem>; progress: Progress | null } {
  const query = f.q ? fold(f.q.trim()) : '';
  const entries = mine.map((m) => {
    const c = m.readout.control;
    const role: RoleInControl = isOwnerOf(userId, c.access) ? 'owner' : 'executor';
    const d = deliveries.get(c.id) ?? NO_DELIVERIES;
    const work = classifyControlWork({ userId, role, executorId: c.access.executor?.id ?? null }, d.items);
    const code = c.catalogCode ?? c.ownCode;
    // MD-529 · Lo que espera la decisión del dueño (la primera aprobación y el resultado de una prueba) es `to_review`; lo que él propuso y espera al administrador es `in_review`.
    const decisions: WorkDecisionKind[] = role === 'owner' ? ownerDecisions(m.readout, work.resultsToRegister) : [];
    const waitingOnOthers = role === 'owner' && waitsOnAdmin(m.readout);
    const base = work.bucket === 'to_review' ? 'to_upload' : work.bucket;
    const bucket: WorkBucket = work.rejected > 0 ? 'rejected' : decisions.length > 0 ? 'to_review' : base === 'done' && waitingOnOthers ? 'in_review' : base;
    const item: WorkListItem = {
      clientControlId: c.id, code, title: c.name, service: m.service, roleInControl: role, bucket, pendingItems: pendingItemsOf({ ...work, toReview: decisions.length }, d.openObservations), state: m.readout.state,
      pendingDecisions: bucket === 'to_review' ? decisions : [],
    };
    return { item, ownCode: c.ownCode };
  });
  const shown = entries
    .filter(({ item }) => !f.bucket || item.bucket === f.bucket)
    .filter(({ item }) => !query || [item.code, item.title].some((t) => fold(t).includes(query)))
    .sort(
      (a, b) =>
        WORK_BUCKETS.indexOf(a.item.bucket) - WORK_BUCKETS.indexOf(b.item.bucket) ||
        a.item.service.name.localeCompare(b.item.service.name, f.locale ?? 'es') ||
        a.item.service.id.localeCompare(b.item.service.id) ||
        compareOwnCode(a.ownCode, b.ownCode) ||
        a.item.clientControlId.localeCompare(b.item.clientControlId),
    )
    .map(({ item }) => item);
  const start = (f.page - 1) * f.pageSize;
  // El avance es de todos sus controles (los del servicio, si se filtró por él: lo decide qué se cargó), no de la página ni de los otros filtros.
  return { page: { items: shown.slice(start, start + f.pageSize), total: shown.length, page: f.page, pageSize: f.pageSize }, progress: summarizeControls(mine.map((m) => m.readout)) };
}

/** Lo que el dueño del control decide: la primera aprobación (`pending_approval`) y el resultado de cada prueba manual cuya evidencia ya está. */
function ownerDecisions(readout: ControlReadout, resultsToRegister: number): WorkDecisionKind[] {
  const out: WorkDecisionKind[] = [];
  if (readout.managementState === 'pending_approval') out.push('control_approval');
  if (resultsToRegister > 0) out.push('manual_result');
  return out;
}

/** Lo que el dueño propuso o aprobó y espera la decisión del administrador. */
function waitsOnAdmin(readout: ControlReadout): boolean {
  const extras = readout.control.extras;
  const exceptions = exceptionTestIdsOf(readout);
  return (
    readout.managementState === 'owner_approved' ||
    (extras?.overrides ?? []).some((o) => o.status === 'pending' && isValidRequest(o, readout.suggestedLevelValue, readout.windowStart)) ||
    (extras?.plans ?? []).some((p) => isPendingPlanLive(p, readout, exceptions)) ||
    [...(extras?.applicability.values() ?? [])].flat().some((a) => a.status === 'pending')
  );
}

/** Las decisiones que le tocan al `admin_empresa` en un control: la aprobación (final, o única si lleva el control) y toda propuesta pendiente y vigente de nivel, plan o «No aplica». */
export function adminDecisions(userId: string, readout: ControlReadout): WorkDecisionKind[] {
  const out: WorkDecisionKind[] = [];
  const extras = readout.control.extras;
  const sole = leadsControl('all', userId, readout.control.access);
  if (readout.managementState === 'owner_approved' || (readout.managementState === 'pending_approval' && sole)) out.push('control_approval');
  if (pendingOverrideOf(extras?.overrides ?? [], readout.suggestedLevelValue, readout.windowStart)) out.push('level_override');
  const exceptions = exceptionTestIdsOf(readout);
  if ((extras?.plans ?? []).some((p) => isPendingPlanLive(p, readout, exceptions))) out.push('remediation_plan');
  if ([...(extras?.applicability.values() ?? [])].flat().some((a) => a.status === 'pending')) out.push('not_applicable');
  return out;
}

/** MD-529 · La bandeja «Por aprobar» del `admin_empresa`: todos los controles de la empresa con algo que decidir, en el bucket `to_review`. Sin avance (no hay un avance de «toda la empresa»). */
export function listAdminApprovals(userId: string, data: AssignmentListingData, f: WorkListFilters & { serviceId?: string }): Page<WorkListItem> {
  const query = f.q ? fold(f.q.trim()) : '';
  const entries = data.services
    .filter((s) => !f.serviceId || s.id === f.serviceId)
    .flatMap((service) =>
      service.readout.controls.flatMap((control) => {
        const readout = readControl(control, service.readout);
        const decisions = adminDecisions(userId, readout);
        if (decisions.length === 0) return [];
        const item: WorkListItem = {
          clientControlId: control.id, code: control.catalogCode ?? control.ownCode, title: control.name, service: { id: service.id, name: service.name }, roleInControl: isOwnerOf(userId, control.access) ? 'owner' : 'approver',
          bucket: 'to_review', pendingItems: decisions.length, state: readout.state, pendingDecisions: decisions,
        };
        return [{ item, ownCode: control.ownCode }];
      }),
    )
    .filter(({ item }) => !query || [item.code, item.title].some((t) => fold(t).includes(query)))
    .sort((a, b) => a.item.service.name.localeCompare(b.item.service.name, f.locale ?? 'es') || a.item.service.id.localeCompare(b.item.service.id) || compareOwnCode(a.ownCode, b.ownCode) || a.item.clientControlId.localeCompare(b.item.clientControlId))
    .map(({ item }) => item);
  const start = (f.page - 1) * f.pageSize;
  return { items: entries.slice(start, start + f.pageSize), total: entries.length, page: f.page, pageSize: f.pageSize };
}

export type WorkloadItem = { user: WorkPerson; ownedCount: number; executedCount: number; progress: Progress };

const ROLE_ORDER = ['responsable', 'delegado', 'admin_empresa'];
const nameOf = (u: WorkPerson): string => `${u.name ?? ''} ${u.lastName ?? ''}`.trim();

/** Cada control se lee una vez y se reparte entre su dueño y su ejecutor; lo «Sin asignar» es lo vigente sin dueño activo. */
export function buildWorkload(people: readonly WorkPerson[], data: AssignmentListingData, locale = 'es'): { items: WorkloadItem[]; unassignedCount: number } {
  const owned = new Map<string, ControlReadout[]>();
  const executed = new Map<string, ControlReadout[]>();
  let unassignedCount = 0;
  const push = (m: Map<string, ControlReadout[]>, id: string, r: ControlReadout) => m.set(id, [...(m.get(id) ?? []), r]);
  for (const service of data.services) {
    for (const control of service.readout.controls) {
      if (!control.access.owner) {
        unassignedCount++;
        continue;
      }
      const readout = readControl(control, service.readout);
      push(owned, control.access.owner.id, readout);
      if (control.access.executor) push(executed, control.access.executor.id, readout);
    }
  }
  const items = people
    .map((user): WorkloadItem => {
      const own = owned.get(user.id) ?? [];
      const exec = executed.get(user.id) ?? [];
      const union = new Map([...own, ...exec].map((r) => [r.control.id, r]));
      return { user, ownedCount: own.length, executedCount: exec.length, progress: summarizeControls([...union.values()]) };
    })
    .filter((i) => i.user.role !== 'admin_empresa' || i.ownedCount > 0)
    .sort((a, b) => ROLE_ORDER.indexOf(a.user.role) - ROLE_ORDER.indexOf(b.user.role) || nameOf(a.user).localeCompare(nameOf(b.user), locale) || a.user.id.localeCompare(b.user.id));
  return { items, unassignedCount };
}
