export type UploadFileInput = {
    key: string;
    body: Buffer;
    mimeType: string;
};

export abstract class StorageRepository {
    /** Sube el archivo al bucket y devuelve la key con la que quedó guardado. */
    abstract upload(input: UploadFileInput): Promise<string>;

    /** URL firmada de solo lectura, válida por tiempo limitado (el bucket no es público). */
    abstract getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

    abstract delete(key: string): Promise<void>;
}
