import { Injectable } from '@nestjs/common';
import { RiskRepository } from '../../domain/repositories/risk.repository';
import { CreateRiskDto } from '../dtos/create-risk.dto';

@Injectable()
export class CreateRiskUseCase {
    constructor(private readonly riskRepository: RiskRepository) { }

    execute(dto: CreateRiskDto, userId: string) {
        return this.riskRepository.create({
            name: dto.name,
            description: dto.description,
            impact: dto.impact,
            probability: dto.probability,
            templateId: dto.templateId,
            userId,
        });
    }
}
