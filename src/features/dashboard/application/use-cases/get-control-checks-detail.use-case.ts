import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { ControlComplianceRepository } from '../../domain/repositories/control-compliance.repository';
import {
  ScaCheckResult,
  ScaResultRepository,
} from '../../domain/repositories/sca-result.repository';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';

export type ControlCheckDetail = {
  checkId: string;
  title: string;
  os: ChecklistOs;
  result: ScaCheckResult;
  description: string | null;
  rationale: string | null;
  /** Solo tiene sentido consultarla cuando result === 'failed'. */
  remediation: string | null;
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
    private readonly cisCheckRepository: CisCheckRepository,
  ) {}

  async execute(controlId: string): Promise<ControlChecksDetail> {
    const controls = await this.controlRepository.findControlsWithChecks();
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

    const cisDetails = await this.cisCheckRepository.findDetailsByCheckIds(
      control.checks.map((check) => check.checkId),
    );

    return {
      id: control.id,
      code: control.code,
      name: control.name,
      checks: control.checks.map((check) => {
        const detail = cisDetails.get(check.checkId);
        return {
          checkId: check.checkId,
          // check.title es una copia congelada del catálogo CIS al momento de crear el
          // control (puede quedar desactualizada o en inglés); se prioriza la traducción
          // vigente y solo se cae al título guardado si el catálogo no tiene ese check_id.
          title: detail?.title ?? check.title,
          os: check.os,
          result: resultsByOs.get(check.os)?.get(check.checkId) ?? 'not_applicable',
          description: detail?.description ?? null,
          rationale: detail?.rationale ?? null,
          remediation: detail?.remediation ?? null,
        };
      }),
    };
  }
}
