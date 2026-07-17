import { Injectable } from '@nestjs/common';
import { TemplateRepository } from '../../domain/repositories/template.repository';

@Injectable()
export class GetAllTemplatesUseCase {
    constructor(private readonly templateRepository: TemplateRepository) { }

    execute() {
        return this.templateRepository.findAll();
    }
}
