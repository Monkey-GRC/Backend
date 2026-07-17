import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';

@Injectable()
export class GetOneReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(id: string) {
    return this.reasonRepository.findOne(id);
  }
}
