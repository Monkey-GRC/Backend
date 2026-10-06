import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { FileStorage } from '../../../../common/storage/file-storage';
import { ServiceRepository } from '../../domain/repositories/service.repository';

export const DOWNLOAD_URL_TTL_SECONDS = 300;

// GET /v1/services/{id}/system-description/file: enlace temporal para bajar el archivo. El bucket
// nunca es público; el enlace se pide ya autenticado y vence a los 5 minutos.
@Injectable()
export class GetSystemDescriptionFileUrlUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute(principal: Principal, id: string): Promise<{ url: string; fileName: string; expiresIn: number }> {
    const service = await this.services.findById(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      id,
    );
    if (!service) throw new DomainError('NOT_FOUND');

    const description = service.data.systemDescription;
    if (!description?.storageKey || !description.fileName) {
      throw new DomainError('SYSTEM_DESCRIPTION_NOT_A_FILE');
    }
    const url = await this.storage.downloadUrl(
      description.storageKey,
      description.fileName,
      DOWNLOAD_URL_TTL_SECONDS,
    );
    return { url, fileName: description.fileName, expiresIn: DOWNLOAD_URL_TTL_SECONDS };
  }
}
