import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { ArchivedCompany, CompanyRepository } from '../../domain/repositories/company.repository';

// D97 · Las empresas archivadas, de la que se borra antes a la que se borra después. Mientras no existan los avisos por correo y en la app (DT-83), es lo que
// permite a Monkey Admin mostrar cuáles están por vencer.
@Injectable()
export class ListPendingPurgeUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  execute(principal: Principal): Promise<ArchivedCompany[]> {
    return this.companies.listArchived({ companyId: principal.companyId, userId: principal.userId, role: principal.role });
  }
}
