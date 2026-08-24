import { Injectable } from '@nestjs/common';
import { TemplateRepository } from '../../domain/repositories/template.repository';
import { CreateTemplateDto } from '../dtos/create-template.dto';

@Injectable()
export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  execute(dto: CreateTemplateDto, userId: string) {
    return this.templateRepository.create({
      name: dto.name,
      description: dto.description,
      objective: dto.objective,
      scope: dto.scope,
      slug: dto.slug,
      userId,
    });
  }
}
