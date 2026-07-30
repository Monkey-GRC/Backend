import { Injectable } from '@nestjs/common';
import { ControlType } from 'generated/prisma-tenant/browser';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import {
  ControlComplianceRepository,
  ControlWithChecks,
} from '../../domain/repositories/control-compliance.repository';

@Injectable()
export class ControlCompliancePrismaRepository extends ControlComplianceRepository {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantConnection: TenantConnectionManager,
  ) {
    super();
  }

  private db(): Promise<any> {
    const tenantId = RequestContext.clientId;
    return tenantId ? this.tenantConnection.getClientFor(tenantId) : Promise.resolve(this.centralPrisma);
  }

  async findAutomaticControlsWithChecks(): Promise<ControlWithChecks[]> {
    const db = await this.db();
    const controls = await db.control.findMany({
      where: { type: ControlType.AUTOMATIC },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        checks: {
          select: {
            check_id: true,
            title: true,
            os: true,
          },
        },
      },
      orderBy: { seq: 'asc' },
    });

    return controls.map((control: any) => ({
      id: control.id,
      code: control.code,
      name: control.name,
      description: control.description,
      checks: control.checks.map((check: any) => ({
        checkId: check.check_id,
        title: check.title,
        os: check.os,
      })),
    }));
  }
}
