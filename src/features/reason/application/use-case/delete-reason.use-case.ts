import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';

@Injectable()
export class DeleteReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(id: string) {
    return this.reasonRepository.delete(id);
  }
}
