import type { Principal } from '../../../../common/auth/principal';
import { Page } from '../../../../common/pagination/page';
import { compareOwnCode, readControl } from '../../domain/controls/control-readout';
import { ControlState } from '../../domain/engine/states';
import { AssignedPerson, AssignmentListingData } from '../../domain/assignments/assignment.repository';
import { canSeeControl } from '../../domain/controls/control-access';

// Lógica pura de `GET /v1/assignments`: de lo que se cargó a la página que se muestra. Sin Prisma ni Nest.

export type AssignmentListFilters = {
  page: number;
  pageSize: number;
  serviceId?: string;
  frameworkId?: string;
  category?: string;
  requirementCode?: string;
  status?: ControlState;
  assignment?: 'unassigned' | 'assigned';
  ownerId?: string;
  executorId?: string;
  q?: string;
  // El orden alfabético sigue el idioma de la petición (es por omisión).
  locale?: string;
};

export type AssignmentItem = {
  clientControlId: string;
  code: string;
  requirementCodes: string[];
  name: string;
  service: { id: string; name: string };
  categories: string[];
  assignment: 'unassigned' | 'assigned';
  owner: AssignedPerson | null;
  executor: AssignedPerson | null;
  state: ControlState;
  ownCode: string;
};

/** La categoría de un requisito es su prefijo: las letras antes del primer dígito (`CC6.1` → `CC`). Un código sin letras no tiene categoría. */
export const categoryOfRequirement = (code: string): string => code.replace(/\d.*$/, '');

/** Minúsculas y sin acentos, para buscar sin distinguir ni mayúsculas ni tildes. */
export const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const categoriesOf = (requirementCodes: readonly string[]): string[] => [...new Set(requirementCodes.map(categoryOfRequirement).filter((c) => c !== ''))].sort();

export function listAssignments(p: Principal, data: AssignmentListingData, f: AssignmentListFilters): Page<AssignmentItem> {
  const query = f.q ? fold(f.q.trim()) : '';
  const items: AssignmentItem[] = [];
  for (const service of data.services) {
    for (const control of service.readout.controls) {
      const record = data.assignments.get(control.id);
      // Quién ve qué: la misma regla que el resto del cumplimiento (D102), sobre el dueño y el ejecutor ACTIVOS de la asignación.
      if (!canSeeControl(p, { owner: record?.ownerActive ? record.owner : null, executor: record?.executorActive ? record.executor : null })) continue;
      const assignment = record ? 'assigned' : 'unassigned';
      if (f.assignment && f.assignment !== assignment) continue;
      if (f.ownerId && record?.owner.id !== f.ownerId) continue;
      if (f.executorId && record?.executor?.id !== f.executorId) continue;
      const requirementCodes = control.requirementCodes;
      const categories = categoriesOf(requirementCodes);
      if (f.category && !categories.includes(f.category)) continue;
      if (f.requirementCode && !requirementCodes.includes(f.requirementCode)) continue;
      if (f.frameworkId && !requirementCodes.some((c) => data.frameworkRequirements?.get(control.id)?.has(c))) continue;
      const code = control.catalogCode ?? control.ownCode;
      if (query && ![code, ...requirementCodes, control.name].some((text) => fold(text).includes(query))) continue;
      // El estado se deriva y se calcula por servicio (regla 4): se filtra y se pagina después de calcularlo.
      const { state } = readControl(control, service.readout);
      if (f.status && f.status !== state) continue;
      items.push({
        clientControlId: control.id, code, requirementCodes, name: control.name, service: { id: service.id, name: service.name }, categories, assignment,
        owner: record?.owner ?? null, executor: record?.executor ?? null, state, ownCode: control.ownCode,
      });
    }
  }
  items.sort((a, b) => a.service.name.localeCompare(b.service.name, f.locale ?? 'es') || a.service.id.localeCompare(b.service.id) || compareOwnCode(a.ownCode, b.ownCode) || a.clientControlId.localeCompare(b.clientControlId));
  const start = (f.page - 1) * f.pageSize;
  return { items: items.slice(start, start + f.pageSize), total: items.length, page: f.page, pageSize: f.pageSize };
}
