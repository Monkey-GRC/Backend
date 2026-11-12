import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { compareOwnCode, ControlReadout, readControl } from '../../domain/controls/control-readout';
import { ControlRepository } from '../../domain/controls/control.repository';
import { ControlSort } from './list-controls.query';
import { ViewMode, viewModeOf } from '../shared/view-access';
import { canSeeControl } from '../shared/control-visibility';

export type ControlFilters = {
  page: number;
  pageSize: number;
  sort: ControlSort;
  trustCriterion?: string;
  type?: string;
  readiness?: string;
  origin?: string;
  view?: 'technical';
  // El orden alfabético sigue el idioma de la petición (es por omisión).
  locale?: string;
};

@Injectable()
export class ListControlsUseCase {
  constructor(private readonly controls: ControlRepository) {}

  async execute(principal: Principal, serviceId: string, filters: ControlFilters): Promise<{ view: ViewMode; page: Page<ControlReadout> }> {
    const view = viewModeOf(principal, filters.view);
    const data = await this.controls.loadService({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, serviceId);
    if (!data) throw new DomainError('NOT_FOUND');

    let items = data.controls.map((c) => readControl(c, data.assets, data.results));
    // Un `responsable` ve solo lo que tiene asignado; si no tiene nada, la lista es vacía (no es un error).
    items = items.filter((i) => canSeeControl(principal, i.control.assignedUserIds));

    items = items.filter(
      (i) =>
        (!filters.trustCriterion || i.control.trustCriteria.includes(filters.trustCriterion)) &&
        (!filters.type || i.control.type === filters.type) &&
        (!filters.readiness || i.readiness === filters.readiness) &&
        (!filters.origin || i.control.origin === filters.origin),
    );

    const direction = filters.sort.startsWith('-') ? -1 : 1;
    const byName = filters.sort.endsWith('name');
    items.sort((a, b) => direction * (byName ? a.control.name.localeCompare(b.control.name, filters.locale ?? 'es') : compareOwnCode(a.control.ownCode, b.control.ownCode)));

    const start = (filters.page - 1) * filters.pageSize;
    return { view, page: { items: items.slice(start, start + filters.pageSize), total: items.length, page: filters.page, pageSize: filters.pageSize } };
  }
}
