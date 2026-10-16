import type { INestApplication } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { bootApp, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-110 · El tamaño máximo de una subida es de 25 MB y un archivo de exactamente 25 MB NO se corta. Multer cortaba al llegar al límite, así que uno de 25 MB justos
// recibía 413 aunque el caso de uso lo aceptaba. Sin almacenamiento configurado, el archivo permitido llega hasta el almacenamiento y responde 503 (no 413).
let app: INestApplication;
let a: Tenant;
const MAX = 25 * 1024 * 1024;
const pdf = (bytes: number) => Buffer.concat([Buffer.from('%PDF-1.4\n'), randomBytes(bytes - 9)]);
const upload = (file: Buffer) => a.agent.post(`/v1/services/${a.serviceId}/system-description/file`).attach('file', file, { filename: `d-${RUN}.pdf`, contentType: 'application/pdf' });

beforeAll(async () => {
  app = await bootApp({ S3_BUCKET: '', S3_ACCESS_KEY_ID: '', S3_SECRET_ACCESS_KEY: '' });
  ({ a } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('Límite de tamaño de la Descripción del Sistema', () => {
  it('un archivo de exactamente 25 MB pasa el límite: sin almacenamiento responde 503, no 413', async () => {
    expect((await upload(pdf(MAX)).expect(503)).body.error.code).toBe('STORAGE_UNAVAILABLE');
  });

  it('un archivo de 25 MB y un byte se rechaza con 413', async () => {
    expect((await upload(pdf(MAX + 1)).expect(413)).body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('uno de 1 byte menos que el máximo también pasa', async () => {
    await upload(pdf(MAX - 1)).expect(503);
  });
});
