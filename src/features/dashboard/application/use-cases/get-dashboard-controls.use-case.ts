import { Injectable } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import {
  ScaCheckResult,
  ScaResultRepository,
} from '../../domain/repositories/sca-result.repository';
import {
  ControlCompliance,
  computeControlCompliance,
} from '../compliance.calculator';

@Injectable()
export class GetDashboardControlsUseCase {
  constructor(
    private readonly controlRepository: ControlComplianceRepository,
    private readonly scaResultRepository: ScaResultRepository,
  ) {}

  async execute(): Promise<ControlCompliance[]> {
    const controls = await this.controlRepository.findControlsWithChecks();
    const resultsByOs = await this.loadResultsByOs(
      controls.flatMap((control) => control.checks.map((check) => check.os)),
    );

    return controls.map((control) =>
      computeControlCompliance(control, resultsByOs),
    );
  }

  private async loadResultsByOs(
    osList: ChecklistOs[],
  ): Promise<Map<ChecklistOs, Map<string, ScaCheckResult>>> {
    const resultsByOs = new Map<ChecklistOs, Map<string, ScaCheckResult>>();

    for (const os of new Set(osList)) {
      resultsByOs.set(
        os,
        await this.scaResultRepository.findAggregatedResultsByOs(os),
      );
    }

    return resultsByOs;
  }
}
