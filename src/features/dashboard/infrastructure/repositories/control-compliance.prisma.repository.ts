import { Injectable } from '@nestjs/common';
import { ControlType } from 'generated/prisma/browser';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  ControlComplianceRepository,
  ControlWithChecks,
} from '../../domain/repositories/control-compliance.repository';

@Injectable()
export class ControlCompliancePrismaRepository extends ControlComplianceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAutomaticControlsWithChecks(): Promise<ControlWithChecks[]> {
    const controls = await this.prisma.control.findMany({
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

    return controls.map((control) => ({
      id: control.id,
      code: control.code,
      name: control.name,
      description: control.description,
      checks: control.checks.map((check) => ({
        checkId: check.check_id,
        title: check.title,
        os: check.os,
      })),
    }));
  }
}
