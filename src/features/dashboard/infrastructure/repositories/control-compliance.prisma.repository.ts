import { Injectable } from '@nestjs/common';
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

  async findControlsWithChecks(): Promise<ControlWithChecks[]> {
    const db = await this.db();
    const controls = await db.control.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
        checks: {
          select: {
            check_id: true,
            title: true,
            os: true,
          },
        },
        manual_checks: {
          select: {
            id: true,
            status: true,
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
      type: control.type,
      checks: control.checks.map((check: any) => ({
        checkId: check.check_id,
        title: check.title,
        os: check.os,
      })),
      manualChecks: control.manual_checks.map((check: any) => ({
        id: check.id,
        status: check.status,
      })),
    }));
  }
}
