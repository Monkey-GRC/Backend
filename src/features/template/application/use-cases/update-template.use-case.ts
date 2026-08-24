import { Injectable } from '@nestjs/common';
import { TemplateRepository } from '../../domain/repositories/template.repository';
import { UpdateTemplateDto } from '../dtos/update-template.dto';

@Injectable()
export class UpdateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  execute(id: string, dto: UpdateTemplateDto, userId: string) {
    return this.templateRepository.update(id, {
      name: dto.name,
      description: dto.description,
      objective: dto.objective,
      scope: dto.scope,
      slug: dto.slug,
      userId,
    });
  }
}
