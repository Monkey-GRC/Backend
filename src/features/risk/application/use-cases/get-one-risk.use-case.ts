import { Injectable } from '@nestjs/common';
import { RiskRepository } from '../../domain/repositories/risk.repository';

@Injectable()
export class GetOneRiskUseCase {
    constructor(private readonly riskRepository: RiskRepository) { }

    execute(id: string) {
        return this.riskRepository.findOne(id);
    }
}
