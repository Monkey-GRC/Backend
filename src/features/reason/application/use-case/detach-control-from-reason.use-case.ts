import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';

@Injectable()
export class DetachControlFromReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(reasonId: string, controlId: string) {
    return this.reasonRepository.detachControl(reasonId, controlId);
  }
}
