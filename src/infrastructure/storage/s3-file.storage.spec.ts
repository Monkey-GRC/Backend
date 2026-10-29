import { S3FileStorage } from './s3-file.storage';

// El enlace de descarga se firma con el host que ve el navegador, no con el de la red interna de Docker (MD-110). Firmar no hace llamadas de red.
const base = { bucket: 'monkey-evidence', accessKeyId: 'AKIATEST', secretAccessKey: 'secret-de-prueba', region: 'us-east-1', forcePathStyle: true };

describe('S3FileStorage.downloadUrl', () => {
  it('firma con el endpoint público cuando existe, aunque el backend suba por el interno', async () => {
    const storage = new S3FileStorage({ ...base, endpoint: 'http://minio:9000', publicEndpoint: 'https://storage-dev.monkey360.io' });
    const url = new URL(await storage.downloadUrl('evidence/a/b.pdf', 'informe.pdf', 300));
    expect(url.origin).toBe('https://storage-dev.monkey360.io');
    expect(url.pathname).toBe('/monkey-evidence/evidence/a/b.pdf');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
    expect(url.searchParams.get('X-Amz-Signature')).toBeTruthy();
    expect(url.searchParams.get('response-content-disposition')).toBe('attachment; filename="informe.pdf"');
  });

  it('sin endpoint público firma con el mismo endpoint de siempre', async () => {
    const storage = new S3FileStorage({ ...base, endpoint: 'http://minio:9000' });
    expect(new URL(await storage.downloadUrl('k', 'a.pdf', 60)).origin).toBe('http://minio:9000');
  });

  it('inline y el tipo de contenido quedan fijados al firmar', async () => {
    const storage = new S3FileStorage({ ...base, endpoint: 'http://minio:9000' });
    const url = new URL(await storage.downloadUrl('k', 'a.pdf', 300, { disposition: 'inline', contentType: 'application/pdf' }));
    expect(url.searchParams.get('response-content-disposition')).toBe('inline; filename="a.pdf"');
    expect(url.searchParams.get('response-content-type')).toBe('application/pdf');
    // Sin opciones sigue siendo una descarga y no fija el tipo.
    const plain = new URL(await storage.downloadUrl('k', 'a.pdf', 300));
    expect(plain.searchParams.get('response-content-disposition')).toBe('attachment; filename="a.pdf"');
    expect(plain.searchParams.get('response-content-type')).toBeNull();
  });

  it('el nombre del archivo no puede romper el encabezado', async () => {
    const storage = new S3FileStorage({ ...base, endpoint: 'http://minio:9000' });
    const url = new URL(await storage.downloadUrl('k', 'a"\r\nSet-Cookie: x.pdf', 60));
    expect(url.searchParams.get('response-content-disposition')).not.toMatch(/[\r\n]/);
  });
});
