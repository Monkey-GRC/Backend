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

  async findControlsWithChecks(templateId?: string): Promise<ControlWithChecks[]> {
    const db = await this.db();
    const controls = await db.control.findMany({
      where: templateId
        ? { reasons: { some: { reason: { risks: { some: { risk: { template_id: templateId } } } } } } }
        : undefined,
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
            dimension: true,
          },
        },
        manual_checks: {
          select: {
            id: true,
            status: true,
            dimension: true,
          },
        },
        dimensions: {
          select: {
            dimension: true,
            type: true,
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
        dimension: check.dimension,
      })),
      manualChecks: control.manual_checks.map((check: any) => ({
        id: check.id,
        status: check.status,
        dimension: check.dimension,
      })),
      dimensionRequirements: control.dimensions.map((req: any) => ({
        dimension: req.dimension,
        type: req.type,
      })),
    }));
  }
}
