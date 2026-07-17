import { Injectable } from '@nestjs/common';
import { TemplateRepository } from '../../domain/repositories/template.repository';

@Injectable()
export class DeleteTemplateUseCase {
    constructor(private readonly templateRepository: TemplateRepository) { }

    execute(id: string) {
        return this.templateRepository.delete(id);
    }
}
