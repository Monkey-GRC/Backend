import { Injectable } from '@nestjs/common';
import { ReasonRepository } from '../../domain/repositories/reason.repository';
import { CreateReasonDto } from '../dtos/create-reason.dto';

@Injectable()
export class CreateReasonUseCase {
  constructor(private readonly reasonRepository: ReasonRepository) {}

  execute(dto: CreateReasonDto, userId: string) {
    return this.reasonRepository.create({
      name: dto.name,
      description: dto.description,
      userId,
    });
  }
}
