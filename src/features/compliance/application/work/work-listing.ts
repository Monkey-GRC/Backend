import { Page } from '../../../../common/pagination/page';
import { AssignmentListingData } from '../../domain/assignments/assignment.repository';
import { isOwnerOf, isPartyOf } from '../../domain/controls/control-access';
import { compareOwnCode, ControlReadout, readControl, Readiness } from '../../domain/controls/control-readout';
import { Coverage, Ratio, summarizeControls } from '../../domain/overview/compliance-overview';
import { ControlState } from '../../domain/engine/states';
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
      mine.push({ service: { id: service.id, name: service.name }, readout: readControl(control, service.readout.assets, service.readout.results) });
    }
  }
  return mine;
}

export type WorkListFilters = { page: number; pageSize: number; bucket?: WorkBucket; q?: string; locale?: string };

export type WorkListItem = {
  clientControlId: string;
  code: string;
  title: string;
  service: { id: string; name: string };
  roleInControl: RoleInControl;
  bucket: WorkBucket;
  pendingItems: number;
  state: ControlState;
};

const NO_DELIVERIES: ControlDeliveries = { items: [], openObservations: 0 };

export function listMyWork(userId: string, mine: readonly MyControl[], deliveries: ReadonlyMap<string, ControlDeliveries>, f: WorkListFilters): { page: Page<WorkListItem>; progress: Progress } {
  const query = f.q ? fold(f.q.trim()) : '';
  const entries = mine.map((m) => {
    const c = m.readout.control;
    const role: RoleInControl = isOwnerOf(userId, c.access) ? 'owner' : 'executor';
    const d = deliveries.get(c.id) ?? NO_DELIVERIES;
    const work = classifyControlWork({ userId, role, executorId: c.access.executor?.id ?? null }, d.items);
    const code = c.catalogCode ?? c.ownCode;
    const item: WorkListItem = {
      clientControlId: c.id, code, title: c.name, service: m.service, roleInControl: role, bucket: work.bucket, pendingItems: pendingItemsOf(work, d.openObservations), state: m.readout.state,
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
      const readout = readControl(control, service.readout.assets, service.readout.results);
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
