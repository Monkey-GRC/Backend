import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';

@Injectable()
export class DetachRiskFromReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(reasonId: string, riskId: string) {
    return this.reasonRepository.detachRisk(reasonId, riskId);
  }
}
