import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { FileStorage } from '../../../../common/storage/file-storage';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
import {
  assertSystemDescriptionFile,
  systemDescriptionKey,
  UploadedFile,
} from '../system-description-file';

// POST /v1/services/{id}/system-description con multipart: guarda el archivo como Descripción del
// Sistema del servicio (reemplaza el enlace o el archivo anterior).
@Injectable()
export class UploadSystemDescriptionFileUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute(
    principal: Principal,
    id: string,
    file: UploadedFile | undefined,
    meta: RequestMeta,
  ): Promise<ServiceDetail> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    const contentType = assertSystemDescriptionFile(file);

    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    // Antes de tocar el almacenamiento: un servicio ajeno o inexistente es 404 y no deja basura.
    if (!(await this.services.findById(scope, id))) throw new DomainError('NOT_FOUND');

    const key = systemDescriptionKey(principal.companyId, id, file.originalName);
    await this.storage.put(key, file.buffer, contentType);

    let change;
    try {
      change = await this.services.setSystemDescription(scope, id, { fileKey: key }, (done) => ({
        tenantId: principal.companyId,
        userId: principal.userId,
        action: 'service.system_description',
        resource: 'service',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        beforeState: done.before.snapshot(),
        afterState: done.after.snapshot(),
      }));
    } catch (error) {
      await this.storage.remove(key);
      throw error;
    }
    if (!change) {
      await this.storage.remove(key);
      throw new DomainError('NOT_FOUND');
    }

    // Lo anterior ya no está referenciado: si era un archivo, se borra (mejor esfuerzo).
    const previous = change.before.data.systemDescription?.storageKey;
    if (previous && previous !== key) await this.storage.remove(previous);

    return change.after;
  }
}
