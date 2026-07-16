import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';
import { UpdateReasonDto } from '../dtos/update-reason.dto';

@Injectable()
export class UpdateReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(id: string, dto: UpdateReasonDto, userId: string) {
    return this.reasonRepository.update(id, {
      name: dto.name,
      description: dto.description,
      userId,
    });
  }
}
