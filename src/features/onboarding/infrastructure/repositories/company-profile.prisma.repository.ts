import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { CompanyProfileRepository, UpsertCompanyProfileInput } from '../../domain/repositories/company-profile.repository';

@Injectable()
export class CompanyProfilePrismaRepository extends CompanyProfileRepository {
  constructor(private readonly tenantConnection: TenantConnectionManager) {
    super();
  }

  /** CompanyProfile solo existe en la DB de un tenant — nunca en la central. */
  private async db(): Promise<any> {
    const tenantId = RequestContext.clientId;
    if (!tenantId) throw new UnauthorizedException();
    return this.tenantConnection.getClientFor(tenantId);
  }

  async get() {
    const db = await this.db();
    return db.companyProfile.findFirst();
  }

  async upsert(input: UpsertCompanyProfileInput) {
    const db = await this.db();
    const existing = await db.companyProfile.findFirst();

    if (existing) {
      return db.companyProfile.update({ where: { id: existing.id }, data: input });
    }
    return db.companyProfile.create({ data: input });
  }
}
