import { Injectable } from '@nestjs/common';
import { RiskRepository } from '../../domain/repositories/risk.repository';

@Injectable()
export class DeleteRiskUseCase {
    constructor(private readonly riskRepository: RiskRepository) { }

    execute(id: string) {
        return this.riskRepository.delete(id);
    }
}
