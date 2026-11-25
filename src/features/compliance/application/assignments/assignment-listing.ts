import type { Principal } from '../../../../common/auth/principal';
import { compareOwnCode } from '../../domain/controls/control-readout';
import { ControlState } from '../../domain/engine/states';
import { AssignedPerson, AssignmentCandidates } from '../../domain/assignments/assignment.repository';
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

/** Un control que pasó los filtros que no necesitan su estado, ya en el orden de la lista. */
export type AssignmentPick = Omit<AssignmentItem, 'state'>;

/**
 * Los controles que cumplen todos los filtros salvo `status`, ordenados. El estado se deriva y es lo caro de calcular (regla 4): el caso de uso lo pide después, solo de los que se muestran
 * (o de todos, si se filtra por él), y pagina.
 */
export function pickAssignments(p: Principal, data: AssignmentCandidates, f: AssignmentListFilters): AssignmentPick[] {
  const query = f.q ? fold(f.q.trim()) : '';
  const items: AssignmentPick[] = [];
  for (const service of data.services) {
    for (const control of service.controls) {
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
      items.push({
        clientControlId: control.id, code, requirementCodes, name: control.name, service: { id: service.id, name: service.name }, categories, assignment,
        owner: record?.owner ?? null, executor: record?.executor ?? null, ownCode: control.ownCode,
      });
    }
  }
  return items.sort((a, b) => a.service.name.localeCompare(b.service.name, f.locale ?? 'es') || a.service.id.localeCompare(b.service.id) || compareOwnCode(a.ownCode, b.ownCode) || a.clientControlId.localeCompare(b.clientControlId));
}
