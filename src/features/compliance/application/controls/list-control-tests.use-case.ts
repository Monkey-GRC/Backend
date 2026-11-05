import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { ControlType, ReadoutTest, readControl } from '../../domain/controls/control-readout';
import type { TestState } from '../../domain/engine/states';
import { ControlRepository } from '../../domain/controls/control.repository';
import { LastVerdict, TestVerdictRepository } from '../../domain/verdicts/test-verdict.repository';
import { viewModeOf } from '../shared/view-access';

export type ControlTestItem = {
  test: ReadoutTest;
  type: ControlType | null;
  state: TestState;
  /** Los otros controles del servicio que llevan el test (D85). Siempre vacío en una prueba documental: su estado es de este control (D88). */
  sharedWith: Array<{ id: string; code: string }>;
  lastVerdict: LastVerdict | null;
};

// Los tests de un control con su estado, todos, también los que aún no tienen activos conectados (contracts/modules/compliance-audit.md). Es la vista técnica (D81): solo `admin_empresa` y
// `auditor`; el `responsable` y `admin_monkey` reciben 403. Ver no es hacer: el veredicto es del `admin_empresa`.
@Injectable()
export class ListControlTestsUseCase {
  constructor(private readonly controls: ControlRepository, private readonly verdicts: TestVerdictRepository) {}

  async execute(p: Principal, controlId: string, page: number, pageSize: number): Promise<Page<ControlTestItem>> {
    viewModeOf(p, 'technical');
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const data = await this.controls.loadControl(scope, controlId);
    if (!data || data.controls.length === 0) throw new DomainError('NOT_FOUND');
    const readout = readControl(data.controls[0], data.assets, data.results);

    const tests = [...readout.tests].sort((a, b) => a.test.code.localeCompare(b.test.code));
    const [shared, last] = await Promise.all([this.controls.sharedControlsOfTests(scope, controlId, tests.map((t) => t.test.testId)), this.verdicts.latestByControl(scope, controlId)]);
    const all = tests.map((t): ControlTestItem => ({
      test: t.test,
      type: readout.control.dimensions.find((d) => d.dimension === t.test.dimension)?.type ?? null,
      state: t.state,
      sharedWith: t.test.dimension === 'policy' ? [] : (shared.get(t.test.testId) ?? []),
      lastVerdict: last.get(t.test.testId) ?? null,
    }));
    return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize };
  }
}
