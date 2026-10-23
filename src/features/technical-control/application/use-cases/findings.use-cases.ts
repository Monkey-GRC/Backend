import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { buildFindings, Finding, FindingLanguage } from '../../domain/scan/findings';

// D90 · Qué falló y cómo corregirlo, para una prueba de nube de un control. Lo calcula de la última evaluación completada (nunca se guarda) y deja fuera lo que no es
// del cliente: ni el nombre del proveedor de la sonda ni el texto crudo de cada recurso.
@Injectable()
export class ListFindingsUseCase {
  constructor(private readonly repo: ScanRepository) {}

  // `includeProposed`: la demo cuenta los vínculos propuestos; producción, solo lo que el comité ratificó (D56), igual que las evaluaciones.
  async execute(
    principal: Principal,
    input: { controlId: string; testId: string; language: FindingLanguage; fallbackTitle: string; includeProposed: boolean },
    page: PageRequest,
  ): Promise<{ measuredAt: Date | null; page: Page<Finding> }> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const test = await this.repo.findCloudTestOfControl(scope, input.controlId, input.testId);
    // Un control o una prueba de otra empresa no existen para quien pregunta: 404, no una lista vacía (conventions.md).
    if (!test) throw new DomainError('NOT_FOUND');
    const { measuredAt, rows } = await this.repo.loadFailedRows(scope, { serviceId: test.serviceId, testId: input.testId, includeProposed: input.includeProposed });
    const all = buildFindings(rows, input.language, input.fallbackTitle);
    const start = (page.page - 1) * page.pageSize;
    return { measuredAt, page: { items: all.slice(start, start + page.pageSize), page: page.page, pageSize: page.pageSize, total: all.length } };
  }
}