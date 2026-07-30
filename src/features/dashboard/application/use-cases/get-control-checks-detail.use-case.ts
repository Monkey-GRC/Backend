import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import {
  ScaCheckResult,
  ScaResultRepository,
} from '../../domain/repositories/sca-result.repository';

export type ControlCheckDetail = {
  checkId: string;
  title: string;
  os: ChecklistOs;
  result: ScaCheckResult;
};

export type ControlChecksDetail = {
  id: string;
  code: string;
  name: string;
  checks: ControlCheckDetail[];
};

@Injectable()
export class GetControlChecksDetailUseCase {
  constructor(
    private readonly controlRepository: ControlComplianceRepository,
    private readonly scaResultRepository: ScaResultRepository,
  ) {}

  async execute(controlId: string): Promise<ControlChecksDetail> {
    const controls =
      await this.controlRepository.findAutomaticControlsWithChecks();
    const control = controls.find((item) => item.id === controlId);

    if (!control) {
      throw new NotFoundException('Control no encontrado');
    }

    const resultsByOs = new Map<ChecklistOs, Map<string, ScaCheckResult>>();
    for (const os of new Set(control.checks.map((check) => check.os))) {
      resultsByOs.set(
        os,
        await this.scaResultRepository.findAggregatedResultsByOs(os),
      );
    }

    return {
      id: control.id,
      code: control.code,
      name: control.name,
      checks: control.checks.map((check) => ({
        checkId: check.checkId,
        title: check.title,
        os: check.os,
        result: resultsByOs.get(check.os)?.get(check.checkId) ?? 'not_applicable',
      })),
    };
  }
}
