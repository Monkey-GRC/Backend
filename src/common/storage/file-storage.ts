// Puerto de almacenamiento de archivos del cliente (hoy: la Descripción del Sistema, DT-12).
// El dominio y los casos de uso no saben si detrás hay minio, S3 u otro; ver
// infrastructure/storage. Las llaves las arma la aplicación, nunca el cliente.
export abstract class FileStorage {
  // Guarda el binario bajo `key`. Lanza DomainError('STORAGE_UNAVAILABLE') si no hay almacenamiento.
  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;

  // Enlace temporal de descarga. `fileName` es el nombre con que el navegador guarda el archivo.
  abstract downloadUrl(key: string, fileName: string, expiresInSeconds: number): Promise<string>;

  // Borrado de mejor esfuerzo: no lanza si el objeto ya no existe.
  abstract remove(key: string): Promise<void>;

  // Borra TODO lo que cuelga de un prefijo (los archivos de una empresa, D95). A diferencia de `remove`, **no** es de mejor esfuerzo: si algo no se pudo
  // borrar lanza, para que el borrado definitivo no se dé por hecho y se reintente.
  abstract removePrefix(prefix: string): Promise<void>;
}
