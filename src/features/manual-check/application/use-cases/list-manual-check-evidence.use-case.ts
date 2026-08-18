import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageRepository } from 'src/infrastructure/storage/storage.repository';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';

@Injectable()
export class ListManualCheckEvidenceUseCase {
    constructor(
        private readonly manualCheckRepository: ManualCheckRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(manualCheckId: string) {
        const check = await this.manualCheckRepository.findOne(manualCheckId);
        if (!check) throw new NotFoundException('Check manual no encontrado');

        return Promise.all(
            check.evidence.map(async (file) => ({
                ...file,
                downloadUrl: await this.storageRepository.getDownloadUrl(file.storageKey),
            })),
        );
    }
}
