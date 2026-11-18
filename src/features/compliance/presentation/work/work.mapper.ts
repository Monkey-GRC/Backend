import { Page, toPageResponse } from '../../../../common/pagination/page';
import { Progress, WorkListItem, WorkloadItem } from '../../application/work/work-listing';

const progress = (p: Progress) => ({ readiness: p.readiness, progress: p.progress, coverage: p.coverage });

export const toMyWork = (page: Page<WorkListItem>, p: Progress) => ({
  ...toPageResponse(page, (i) => ({
    client_control_id: i.clientControlId, code: i.code, title: i.title, service: i.service, role_in_control: i.roleInControl, bucket: i.bucket, pending_items: i.pendingItems, state: i.state,
  })),
  progress: progress(p),
});

export const toWorkload = (r: { items: WorkloadItem[]; unassignedCount: number }) => ({
  items: r.items.map((i) => ({ user: { id: i.user.id, name: i.user.name, last_name: i.user.lastName, role: i.user.role }, owned_count: i.ownedCount, executed_count: i.executedCount, progress: progress(i.progress) })),
  unassigned_count: r.unassignedCount,
});
