import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { buildFindings, Finding, FindingLanguage, FindingsSummary } from '../../domain/scan/findings';
import { isScoped } from '../../../../common/authorization/permission-matrix';

// D90, D138 punto 3, MD-502 · Las brechas de una prueba automática de un control: una fila por check y activo, con la plantilla del libro. Lo calcula de la última corrida completada (nunca se guarda) con la
// MISMA lectura que el motor v2, y deja fuera lo que no es del cliente: ni el nombre del proveedor de la sonda ni el texto crudo de cada recurso.
export type FindingsPage = {
  control: { id: string; code: string; name: string };
  test: { id: string; code: string; displayName: string | null };
  measuredAt: Date | null;
  summary: FindingsSummary;
  page: Page<Finding>;
};

@Injectable()
export class ListFindingsUseCase {
  constructor(private readonly repo: ScanRepository) {}

  async execute(principal: Principal, input: { controlId: string; testId: string; language: FindingLanguage; fallbackTitle: string }, page: PageRequest): Promise<FindingsPage> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const test = await this.repo.findAutomatedTestOfControl(scope, input.controlId, input.testId);
    // Un control o una prueba de otra empresa no existen para quien pregunta: 404, no una lista vacía (conventions.md).
    if (!test) throw new DomainError('NOT_FOUND');
    // D102, SEG-66 · Lo automático que falla en la nube le llega al dueño y al ejecutor del control; a otro responsable o delegado, no (existe y es de su empresa: 403).
    if (isScoped('tests.results', principal.role) && !test.responsibleUserIds.includes(principal.userId)) throw new DomainError('FORBIDDEN');
    const source = await this.repo.loadFindingSource(scope, { serviceId: test.serviceId, controlId: input.controlId, testId: input.testId });
    // El control o la prueba ya no están en la lectura del motor (por ejemplo, el requisito ya no la lleva): para quien pregunta no existe.
    if (!source) throw new DomainError('NOT_FOUND');
    const { items, summary } = buildFindings(source.rows, {
      direct: source.direct,
      exceptions: source.exceptions,
      plan: source.plan,
      controlOwner: source.controlOwner,
      language: input.language,
      fallbackTitle: input.fallbackTitle,
    });
    const start = (page.page - 1) * page.pageSize;
    const displayName = input.language === 'en' ? (source.test.displayNameEn ?? source.test.displayName) : (source.test.displayName ?? source.test.displayNameEn);
    return {
      control: source.control,
      test: { id: source.test.id, code: source.test.code, displayName },
      measuredAt: source.measuredAt,
      summary,
      page: { items: items.slice(start, start + page.pageSize), page: page.page, pageSize: page.pageSize, total: items.length },
    };
  }
}
