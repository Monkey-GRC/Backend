import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';

@Injectable()
export class GetAllReasonsUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute() {
    return this.reasonRepository.findAll();
  }
}
