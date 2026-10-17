import type { INestApplication } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { bootApp, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-110 · El almacenamiento privado de archivos, de punta a punta por la API: subir la Descripción del Sistema, bajarla con un enlace firmado que
// lleva el host PÚBLICO, y comprobar que sin firma no se abre. Necesita un servidor S3 real: se salta si no se le da uno. Ejemplo (minio o compatible):
//   S3_TEST_ENDPOINT=http://localhost:9000 S3_TEST_PUBLIC_ENDPOINT=http://127.0.0.1:9000 S3_TEST_BUCKET=monkey-evidence \
//   S3_TEST_ACCESS_KEY=… S3_TEST_SECRET_KEY=… npm run test:e2e -- test/almacenamiento
const endpoint = process.env.S3_TEST_ENDPOINT;
const suite = endpoint ? describe : describe.skip;

suite('Almacenamiento privado (servidor S3 real)', () => {
  let app: INestApplication;
  let a: Tenant;
  let b: Tenant;
  const publicEndpoint = process.env.S3_TEST_PUBLIC_ENDPOINT ?? endpoint ?? '';
  const pdf = (bytes: number) => Buffer.concat([Buffer.from('%PDF-1.4\n'), randomBytes(bytes - 9)]);
  const upload = (file: Buffer, name = `descripcion-${RUN}.pdf`, type = 'application/pdf') =>
    a.agent.post(`/v1/services/${a.serviceId}/system-description/file`).attach('file', file, { filename: name, contentType: type });

  beforeAll(async () => {
    app = await bootApp({
      S3_ENDPOINT: endpoint!,
      S3_PUBLIC_ENDPOINT: publicEndpoint,
      S3_BUCKET: process.env.S3_TEST_BUCKET ?? 'monkey-evidence',
      S3_ACCESS_KEY_ID: process.env.S3_TEST_ACCESS_KEY ?? '',
      S3_SECRET_ACCESS_KEY: process.env.S3_TEST_SECRET_KEY ?? '',
      S3_FORCE_PATH_STYLE: 'true',
    });
    ({ a, b } = await dosEmpresas(app));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('un PDF del tamaño máximo (25 MB) se sube y se descarga idéntico con su enlace firmado', async () => {
    const file = pdf(25 * 1024 * 1024);
    await upload(file).expect(200);
    const link = (await a.agent.get(`/v1/services/${a.serviceId}/system-description/file`).expect(200)).body.data;
    expect(link).toMatchObject({ url: expect.any(String), file_name: `descripcion-${RUN}.pdf`, expires_in: 300 });
    // El enlace lleva el host que ve el navegador, no el de la red interna.
    expect(new URL(link.url).origin).toBe(new URL(publicEndpoint).origin);
    const res = await fetch(link.url);
    expect(res.status).toBe(200);
    expect(Buffer.from(await res.arrayBuffer()).equals(file)).toBe(true);
  });

  it('sin la firma el archivo no se abre', async () => {
    const link = (await a.agent.get(`/v1/services/${a.serviceId}/system-description/file`).expect(200)).body.data;
    expect([401, 403]).toContain((await fetch(link.url.split('?')[0])).status);
  });

  it('un archivo de más de 25 MB se rechaza con 413 y uno de otro tipo con 415', async () => {
    await upload(pdf(25 * 1024 * 1024 + 1024)).expect(413);
    await upload(Buffer.from('MZ no es un documento'), 'programa.exe', 'application/octet-stream').expect(415);
  });

  it('el enlace de otra empresa no se pide: el archivo de A no existe para B', async () => {
    await b.agent.get(`/v1/services/${a.serviceId}/system-description/file`).expect(404);
  });
});
