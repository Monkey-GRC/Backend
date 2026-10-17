import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorage } from '../../common/storage/file-storage';
import { S3FileStorage } from './s3-file.storage';
import { UnavailableFileStorage } from './unavailable-file.storage';

// S3_BUCKET, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY activan el almacenamiento; sin ellos queda
// `unavailable`. Con minio: S3_ENDPOINT + S3_FORCE_PATH_STYLE=true. Con AWS S3 basta el bucket y la región.
// S3_PUBLIC_ENDPOINT es la dirección que abre el navegador (la de afuera); con ella se firman los enlaces de descarga. Si el backend y el navegador ven el
// mismo host, no hace falta.
export type StorageEnv = { get(key: string): string | undefined };

export function createFileStorage(config: StorageEnv): FileStorage {
  const bucket = config.get('S3_BUCKET')?.trim();
  const accessKeyId = config.get('S3_ACCESS_KEY_ID')?.trim();
  const secretAccessKey = config.get('S3_SECRET_ACCESS_KEY')?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) {
    new Logger('StorageModule').warn('Almacenamiento de archivos no configurado (S3_*): la carga de archivos responderá 503.');
    return new UnavailableFileStorage();
  }
  return new S3FileStorage({
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint: config.get('S3_ENDPOINT')?.trim() || undefined,
    region: config.get('S3_REGION')?.trim() || 'us-east-1',
    forcePathStyle: config.get('S3_FORCE_PATH_STYLE')?.trim() === 'true',
    publicEndpoint: config.get('S3_PUBLIC_ENDPOINT')?.trim() || undefined,
  });
}

@Global()
@Module({
  providers: [{ provide: FileStorage, inject: [ConfigService], useFactory: (config: ConfigService) => createFileStorage(config) }],
  exports: [FileStorage],
})
export class StorageModule {}
