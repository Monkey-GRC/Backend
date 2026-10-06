import { DomainError } from '../../common/errors/domain-error';
import { FileStorage } from '../../common/storage/file-storage';

// Sin S3_* configurado la app arranca igual, pero no finge guardar nada: subir un archivo responde
// 503 y el cliente puede usar el enlace. Mismo criterio que la sonda `unavailable`.
export class UnavailableFileStorage extends FileStorage {
  put(): Promise<void> {
    return Promise.reject(new DomainError('STORAGE_UNAVAILABLE'));
  }

  downloadUrl(): Promise<string> {
    return Promise.reject(new DomainError('STORAGE_UNAVAILABLE'));
  }

  remove(): Promise<void> {
    return Promise.resolve();
  }
}
