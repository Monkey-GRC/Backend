import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { DownloadOptions, FileStorage } from '../../common/storage/file-storage';

export type S3StorageConfig = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  // minio y la mayoría de S3 compatibles exigen `bucket` en la ruta y no en el subdominio.
  forcePathStyle: boolean;
  // Dónde llega el NAVEGADOR del cliente. El backend sube por `endpoint` (la red interna de Docker, p. ej. http://minio:9000), pero un enlace firmado con ese
  // nombre no abre fuera de la red. La firma incluye el host, así que el enlace se firma con ESTE: si falta, se usa `endpoint`.
  publicEndpoint?: string;
};

// Adaptador S3 / minio (AWS SDK v3). Sirve igual contra AWS S3 (sin endpoint) que contra un
// minio propio (endpoint + forcePathStyle).
export class S3FileStorage extends FileStorage {
  private readonly logger = new Logger(S3FileStorage.name);
  private readonly client: S3Client;
  // Firmar no hace ninguna llamada de red: este cliente solo existe para que el enlace lleve el host público.
  private readonly signer: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    super();
    const base = { region: config.region, forcePathStyle: config.forcePathStyle, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } };
    this.client = new S3Client({ ...base, endpoint: config.endpoint });
    this.signer = config.publicEndpoint ? new S3Client({ ...base, endpoint: config.publicEndpoint }) : this.client;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  downloadUrl(key: string, fileName: string, expiresInSeconds: number, options: DownloadOptions = {}): Promise<string> {
    // El nombre va entre comillas y sin saltos de línea: es lo único del cliente que entra al header.
    const safeName = fileName.replace(/["\r\n\\]/g, '_');
    return getSignedUrl(
      this.signer,
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ResponseContentDisposition: `${options.disposition ?? 'attachment'}; filename="${safeName}"`,
        ...(options.contentType ? { ResponseContentType: options.contentType } : {}),
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

  async removePrefix(prefix: string): Promise<void> {
    let token: string | undefined;
    do {
      const page = await this.client.send(new ListObjectsV2Command({ Bucket: this.config.bucket, Prefix: prefix, ContinuationToken: token }));
      const keys = (page.Contents ?? []).map((o) => ({ Key: o.Key! }));
      if (keys.length > 0) {
        const result = await this.client.send(new DeleteObjectsCommand({ Bucket: this.config.bucket, Delete: { Objects: keys, Quiet: true } }));
        if (result.Errors?.length) throw new Error(`No se pudo borrar ${result.Errors.length} objeto(s) de ${prefix}`);
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }
}
