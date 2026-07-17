import { Injectable } from '@nestjs/common';
import { RiskRepository } from '../../domain/repositories/risk.repository';
import { UpdateRiskDto } from '../dtos/update-risk.dto';

@Injectable()
export class UpdateRiskUseCase {
    constructor(private readonly riskRepository: RiskRepository) { }

    execute(id: string, dto: UpdateRiskDto, userId: string) {
        return this.riskRepository.update(id, {
            name: dto.name,
            description: dto.description,
            impact: dto.impact,
            probability: dto.probability,
            templateId: dto.templateId,
            userId,
        });
    }
}
