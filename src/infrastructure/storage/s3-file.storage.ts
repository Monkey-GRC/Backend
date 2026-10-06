import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { FileStorage } from '../../common/storage/file-storage';

export type S3StorageConfig = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  // minio y la mayoría de S3 compatibles exigen `bucket` en la ruta y no en el subdominio.
  forcePathStyle: boolean;
};

// Adaptador S3 / minio (AWS SDK v3). Sirve igual contra AWS S3 (sin endpoint) que contra un
// minio propio (endpoint + forcePathStyle).
export class S3FileStorage extends FileStorage {
  private readonly logger = new Logger(S3FileStorage.name);
  private readonly client: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    super();
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  downloadUrl(key: string, fileName: string, expiresInSeconds: number): Promise<string> {
    // El nombre va entre comillas y sin saltos de línea: es lo único del cliente que entra al header.
    const safeName = fileName.replace(/["\r\n\\]/g, '_');
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${safeName}"`,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  async remove(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    } catch (error) {
      this.logger.warn(`No se pudo borrar ${key}: ${(error as Error).message}`);
    }
  }
}
