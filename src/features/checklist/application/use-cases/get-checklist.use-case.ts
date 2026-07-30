import { Injectable } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { CisCheckRepository } from '../../domain/repositories/cis-check.repository';

@Injectable()
export class GetChecklistUseCase {
    constructor(private readonly cisCheckRepository: CisCheckRepository) { }

    execute(os: ChecklistOs, search?: string) {
        return this.cisCheckRepository.findByOs(os, search);
    }
}
