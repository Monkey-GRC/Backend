import type { INestApplication } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-126 · La evidencia contra un servidor S3 REAL, de punta a punta por la API: subir dos versiones, bajarlas con un enlace firmado que lleva el host PÚBLICO,
// comprobar que son idénticas a lo subido, que sin firma no se abren y que lo de una empresa no existe para otra. Se salta si no se le da un servidor S3
// (mismas variables que ./almacenamiento.e2e-spec.ts):
//   S3_TEST_ENDPOINT=http://localhost:9000 S3_TEST_PUBLIC_ENDPOINT=http://127.0.0.1:9000 S3_TEST_BUCKET=monkey-evidence \
//   S3_TEST_ACCESS_KEY=… S3_TEST_SECRET_KEY=… npm run test:e2e -- test/almacenamiento/evidencia
const endpoint = process.env.S3_TEST_ENDPOINT;
const suite = endpoint ? describe : describe.skip;

suite('Evidencia en el almacenamiento privado (servidor S3 real)', () => {
  let app: INestApplication;
  let a: Tenant;
  let b: Tenant;
  let requirementId: string;
  const publicEndpoint = process.env.S3_TEST_PUBLIC_ENDPOINT ?? endpoint ?? '';
  const pdf = (bytes: number) => Buffer.concat([Buffer.from('%PDF-1.4\n'), randomBytes(bytes - 9)]);
  const sha = (x: Buffer) => createHash('sha256').update(x).digest('hex');
  const upload = (file: Buffer, name: string) => a.agent.post(`/v1/evidence-requirements/${requirementId}/submissions`).attach('file', file, name);
  const link = async (id: string) => (await a.agent.get(`/v1/evidence-submissions/${id}/download`).expect(200)).body.data;

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
    requirementId = (await owner<{ id: string }>(
      `select er.id from tenant.evidence_requirements er join tenant.client_controls cc on cc.id = er.client_control_id where cc.service_id = $1 and cc.is_active order by er.sequence limit 1`,
      [a.serviceId],
    ))[0].id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('una evidencia del tamaño máximo (25 MB) se sube y se descarga idéntica con su enlace firmado, que lleva el host público', async () => {
    const file = pdf(25 * 1024 * 1024);
    const created = (await upload(file, `politica-${RUN}.pdf`).expect(201)).body.data;
    expect(created).toMatchObject({ version: 1, file_size: file.length, integrity_hash: sha(file) });
    const l = await link(created.id);
    expect(l).toMatchObject({ file_name: `politica-${RUN}.pdf`, file_type: 'application/pdf', expires_in: 300 });
    expect(new URL(l.url).origin).toBe(new URL(publicEndpoint).origin);
    const res = await fetch(l.url);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-disposition')).toContain(`politica-${RUN}.pdf`);
    expect(sha(Buffer.from(await res.arrayBuffer()))).toBe(sha(file));
  });

  it('una versión nueva no pisa la anterior: las dos se descargan, cada una con su contenido', async () => {
    const v2 = pdf(1024);
    const second = (await upload(v2, `politica-${RUN}.pdf`).expect(201)).body.data;
    expect(second.version).toBe(2);
    const subs = (await a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(200)).body.data.items;
    expect(subs.map((s: any) => s.version)).toEqual([2, 1]);
    const bytes = async (id: string) => Buffer.from(await (await fetch((await link(id)).url)).arrayBuffer());
    expect(sha(await bytes(subs[0].id))).toBe(sha(v2));
    expect(subs[1].file_size).toBe(25 * 1024 * 1024);
    expect((await bytes(subs[1].id)).length).toBe(25 * 1024 * 1024);
  });

  it('sin la firma, o con la firma alterada, el archivo no se abre', async () => {
    const [first] = (await a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(200)).body.data.items;
    const l = await link(first.id);
    expect([401, 403]).toContain((await fetch(l.url.split('?')[0])).status);
    expect([401, 403]).toContain((await fetch(l.url.replace(/(X-Amz-Signature=)[0-9a-f]{4}/, '$10000'))).status);
  });

  it('un PNG se sube con su tipo; algo que no es lo que dice su extensión se rechaza (415) y no llega al bucket', async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), randomBytes(512)]);
    const ok = (await upload(png, `captura-${RUN}.png`).expect(201)).body.data;
    expect(ok.file_type).toBe('image/png');
    const res = await fetch((await link(ok.id)).url);
    expect(res.headers.get('content-type')).toBe('image/png');
    await upload(Buffer.from('MZ no es un documento'), 'factura.pdf').expect(415);
  });

  it('la evidencia de A no existe para B', async () => {
    const [first] = (await a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(200)).body.data.items;
    await b.agent.get(`/v1/evidence-submissions/${first.id}/download`).expect(404);
    await b.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(404);
  });
});
