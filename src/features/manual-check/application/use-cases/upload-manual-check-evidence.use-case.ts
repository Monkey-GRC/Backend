import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RequestContext } from 'src/common/utils/request-context';
import { StorageRepository } from 'src/infrastructure/storage/storage.repository';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';
import { ALLOWED_EVIDENCE_MIME_TYPES, MAX_EVIDENCE_FILE_SIZE_BYTES } from '../manual-check-evidence.constants';

export type UploadManualCheckEvidenceFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};

@Injectable()
export class UploadManualCheckEvidenceUseCase {
    constructor(
        private readonly manualCheckRepository: ManualCheckRepository,
        private readonly storageRepository: StorageRepository,
    ) {}

    async execute(manualCheckId: string, file: UploadManualCheckEvidenceFile, userId: string) {
        const check = await this.manualCheckRepository.findOne(manualCheckId);
        if (!check) throw new NotFoundException('Check manual no encontrado');

        if (!file) throw new BadRequestException('No se recibió ningún archivo');
        if (!ALLOWED_EVIDENCE_MIME_TYPES.has(file.mimetype)) {
            throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
        }
        if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
            throw new BadRequestException('El archivo supera el tamaño máximo permitido (20MB)');
        }

        const tenantSegment = RequestContext.clientId ?? 'central';
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageKey = `tenants/${tenantSegment}/manual-checks/${manualCheckId}/${randomUUID()}-${safeName}`;

        await this.storageRepository.upload({ key: storageKey, body: file.buffer, mimeType: file.mimetype });

        return this.manualCheckRepository.addEvidence({
            manualCheckId,
            fileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storageKey,
            userId,
        });
    }
}
