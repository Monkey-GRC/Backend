import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageRepository } from 'src/infrastructure/storage/storage.repository';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';

@Injectable()
export class DeleteManualCheckUseCase {
    constructor(
        private readonly manualCheckRepository: ManualCheckRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(id: string) {
        const existing = await this.manualCheckRepository.findOne(id);
        if (!existing) throw new NotFoundException('Check manual no encontrado');

        for (const file of existing.evidence) {
            await this.storageRepository.delete(file.storageKey).catch((err) => {
                console.error('No se pudo borrar evidencia del bucket al eliminar el check manual:', err);
            });
        }

        await this.manualCheckRepository.delete(id);
    }
}
