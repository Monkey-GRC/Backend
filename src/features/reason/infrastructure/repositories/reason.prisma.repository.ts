// src/features/reason/infrastructure/repositories/reason.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import {
  ReasonRepository,
  CreateReasonInput,
  UpdateReasonInput,
} from '../../domain/repositories/reason.repository';

@Injectable()
export class ReasonPrismaRepository extends ReasonRepository {
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

  async findAll() {
    const db = await this.db();
    return db.reason.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        created_by_user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            role: true,
            username: true,
          },
        },
        updated_by_user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            role: true,
            username: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: string) {
    const db = await this.db();
    return db.reason.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        created_at: true,
        updated_at: true,
        risks: {
          select: {
            risk: {
              select: { id: true, name: true, code: true, level: true },
            },
          },
        },
        controls: {
          select: {
            control: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                checks: {
                  select: { id: true, check_id: true, title: true, os: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async attachRisks(reasonId: string, riskIds: string[]) {
    const db = await this.db();
    return db.riskReason.createMany({
      data: riskIds.map((riskId) => ({ reason_id: reasonId, risk_id: riskId })),
      skipDuplicates: true,
    });
  }

  async detachRisk(reasonId: string, riskId: string) {
    const db = await this.db();
    return db.riskReason.delete({
      where: { risk_id_reason_id: { risk_id: riskId, reason_id: reasonId } },
    });
  }

  async attachControls(reasonId: string, controlIds: string[]) {
    const db = await this.db();
    return db.reasonControl.createMany({
      data: controlIds.map((controlId) => ({ reason_id: reasonId, control_id: controlId })),
      skipDuplicates: true,
    });
  }

  async detachControl(reasonId: string, controlId: string) {
    const db = await this.db();
    return db.reasonControl.delete({
      where: { reason_id_control_id: { reason_id: reasonId, control_id: controlId } },
    });
  }

  async create(input: CreateReasonInput) {
    const db = await this.db();
    return db.$transaction(async (tx: any) => {
      const reason = await tx.reason.create({
        data: {
          name: input.name,
          description: input.description,
          code: 'PENDING',
          created_by_user: { connect: { id: input.userId } },
        },
      });

      const code = `RSN-${obfuscateSeq(reason.seq)}`;

      return tx.reason.update({
        where: { id: reason.id },
        data: { code },
      });
    });
  }

  async update(id: string, input: UpdateReasonInput) {
    const db = await this.db();
    const updateData: Record<string, any> = {};

    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.description !== undefined)
      updateData['description'] = input.description;
    updateData['updated_by_user'] = { connect: { id: input.userId } };

    return db.reason.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    const db = await this.db();
    return db.reason.delete({ where: { id } });
  }
}
