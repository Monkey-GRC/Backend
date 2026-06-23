import { Injectable } from '@nestjs/common';
import { RiskRepository } from '../../domain/repositories/risk.repository';

@Injectable()
export class GetAllRisksUseCase {
    constructor(private readonly riskRepository: RiskRepository) { }

    execute() {
        return this.riskRepository.findAll();
    }
}
