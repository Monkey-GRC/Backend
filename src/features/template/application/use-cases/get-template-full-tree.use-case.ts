import { Injectable } from '@nestjs/common';
import { TemplateRepository } from '../../domain/repositories/template.repository';

@Injectable()
export class GetTemplateFullTreeUseCase {
    constructor(private readonly templateRepository: TemplateRepository) { }

    async execute(id: string) {
        const template = await this.templateRepository.findFullTree(id);
        return this.flatten(template);
    }

    private flatten(template: any) {
        return {
            ...template,
            risks: (template.risks ?? []).map((risk: any) => ({
                ...risk,
                reasons: (risk.reasons ?? []).map((riskReason: any) => ({
                    ...riskReason.reason,
                    controls: (riskReason.reason.controls ?? []).map(
                        (reasonControl: any) => reasonControl.control,
                    ),
                })),
            })),
        };
    }
}
