import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorage } from '../../common/storage/file-storage';
import { S3FileStorage } from './s3-file.storage';
import { UnavailableFileStorage } from './unavailable-file.storage';

// S3_BUCKET, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY activan el almacenamiento; sin ellos queda
// `unavailable`. Con minio: S3_ENDPOINT + S3_FORCE_PATH_STYLE=true. Con AWS S3 basta el bucket y la región.
function createFileStorage(config: ConfigService): FileStorage {
  const bucket = config.get<string>('S3_BUCKET')?.trim();
  const accessKeyId = config.get<string>('S3_ACCESS_KEY_ID')?.trim();
  const secretAccessKey = config.get<string>('S3_SECRET_ACCESS_KEY')?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) {
    new Logger('StorageModule').warn('Almacenamiento de archivos no configurado (S3_*): la carga de archivos responderá 503.');
    return new UnavailableFileStorage();
  }
  return new S3FileStorage({
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint: config.get<string>('S3_ENDPOINT')?.trim() || undefined,
    region: config.get<string>('S3_REGION')?.trim() || 'us-east-1',
    forcePathStyle: config.get<string>('S3_FORCE_PATH_STYLE')?.trim() === 'true',
  });
}

@Global()
@Module({
  providers: [{ provide: FileStorage, inject: [ConfigService], useFactory: createFileStorage }],
  exports: [FileStorage],
})
export class StorageModule {}
