import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';
import { AttachControlsDto } from '../dtos/attach-controls.dto';

@Injectable()
export class AttachControlsToReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(reasonId: string, dto: AttachControlsDto) {
    return this.reasonRepository.attachControls(reasonId, dto.controlIds);
  }
}
