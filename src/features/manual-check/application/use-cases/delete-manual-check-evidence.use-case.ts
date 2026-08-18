import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageRepository } from 'src/infrastructure/storage/storage.repository';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';

@Injectable()
export class DeleteManualCheckEvidenceUseCase {
    constructor(
        private readonly manualCheckRepository: ManualCheckRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(evidenceId: string) {
        const evidence = await this.manualCheckRepository.findEvidence(evidenceId);
        if (!evidence) throw new NotFoundException('Evidencia no encontrada');

        await this.storageRepository.delete(evidence.storageKey);
        await this.manualCheckRepository.deleteEvidence(evidenceId);
    }
}
