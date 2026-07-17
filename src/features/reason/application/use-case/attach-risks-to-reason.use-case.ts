import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';
import { AttachRisksDto } from '../dtos/attach-risks.dto';

@Injectable()
export class AttachRisksToReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(reasonId: string, dto: AttachRisksDto) {
    return this.reasonRepository.attachRisks(reasonId, dto.riskIds);
  }
}
