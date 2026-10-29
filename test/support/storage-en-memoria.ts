import { DomainError } from '../../src/common/errors/domain-error';
import { DownloadOptions, FileStorage } from '../../src/common/storage/file-storage';

/** Almacenamiento de archivos en memoria para las pruebas e2e: guarda los objetos y firma enlaces falsos. Lo real contra un S3 está en `test/almacenamiento`. */
export class StorageEnMemoria extends FileStorage {
  readonly objects = new Map<string, { body: Buffer; contentType: string }>();
  readonly links: Array<{ key: string; fileName: string; expiresInSeconds: number; disposition: string; contentType: string | null }> = [];
  available = true;

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    if (!this.available) throw new DomainError('STORAGE_UNAVAILABLE');
    this.objects.set(key, { body, contentType });
  }

  async downloadUrl(key: string, fileName: string, expiresInSeconds: number, options: DownloadOptions = {}): Promise<string> {
    if (!this.available) throw new DomainError('STORAGE_UNAVAILABLE');
    this.links.push({ key, fileName, expiresInSeconds, disposition: options.disposition ?? 'attachment', contentType: options.contentType ?? null });
    return `https://storage.prueba/${key}?X-Signature=firma&X-Expires=${expiresInSeconds}`;
  }

  async remove(key: string): Promise<void> {
    this.objects.delete(key);
  }

  async removePrefix(prefix: string): Promise<void> {
    for (const key of [...this.objects.keys()]) if (key.startsWith(prefix)) this.objects.delete(key);
  }
}
