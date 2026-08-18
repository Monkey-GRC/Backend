import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageRepository, UploadFileInput } from './storage.repository';

/**
 * Implementación S3 — funciona igual contra AWS S3 real que contra MinIO (u
 * otro compatible), ya que MinIO habla el mismo protocolo: solo cambia el
 * `endpoint` (URL de MinIO en vez del de AWS) y `forcePathStyle` (obligatorio
 * en MinIO, porque resuelve buckets por path y no por subdominio).
 *
 * Mientras MINIO/S3 no esté configurado (variables de entorno vacías), lanza
 * un error claro y controlado al momento de usarse — no rompe el arranque
 * del resto del backend, que no depende de esto.
 */
@Injectable()
export class S3StorageService extends StorageRepository {
    private client: S3Client | null = null;
    private bucket: string | null = null;

    private getClient(): { client: S3Client; bucket: string } {
        if (this.client && this.bucket) {
            return { client: this.client, bucket: this.bucket };
        }

        const endpoint = process.env.S3_ENDPOINT;
        const region = process.env.S3_REGION ?? 'us-east-1';
        const bucket = process.env.S3_BUCKET;
        const accessKeyId = process.env.S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

        if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
            throw new ServiceUnavailableException(
                'El almacenamiento de evidencia (S3/MinIO) todavía no está configurado.',
            );
        }

        this.bucket = bucket;
        this.client = new S3Client({
            endpoint,
            region,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
            credentials: { accessKeyId, secretAccessKey },
        });

        return { client: this.client, bucket: this.bucket };
    }

    async upload({ key, body, mimeType }: UploadFileInput): Promise<string> {
        const { client, bucket } = this.getClient();
        await client.send(
            new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: mimeType }),
        );
        return key;
    }

    async getDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
        const { client, bucket } = this.getClient();
        return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
            expiresIn: expiresInSeconds,
        });
    }

    async delete(key: string): Promise<void> {
        const { client, bucket } = this.getClient();
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }
}
