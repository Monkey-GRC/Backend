import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { UnavailableFileStorage } from '../src/infrastructure/storage/unavailable-file.storage';
import { createFileStorage } from '../src/infrastructure/storage/storage.module';

// Comprueba el almacenamiento privado de un entorno contra los criterios de MD-110. Se corre en el propio servidor (o contra él):
//   npm run storage:smoke            (usa las S3_* del .env)
//   SMOKE_API_URL=https://api-dev.monkey360.io/v1 npm run storage:smoke   (además prueba que el proxy deje pasar 25 MB)
//
// Qué comprueba: (1) subir y leer un archivo; (2) que sin enlace firmado el acceso se rechace; (3) que un enlace firmado venza; (4) que una subida del
// tamaño máximo (25 MB) pase por el almacenamiento y, con SMOKE_API_URL, por el proxy de la API. Deja el entorno como estaba: borra lo que subió.
const MAX_BYTES = 25 * 1024 * 1024;
const results: Array<{ name: string; ok: boolean; detail: string }> = [];
const check = (name: string, ok: boolean, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fetchStatus = async (url: string, init?: RequestInit) => (await fetch(url, init)).status;

async function main() {
  const storage = createFileStorage({ get: (key) => process.env[key] });
  if (storage instanceof UnavailableFileStorage) {
    console.error('✗ Almacenamiento sin configurar: faltan S3_BUCKET, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY.');
    process.exit(1);
  }
  const key = `smoke/storage-${Date.now()}-${randomBytes(3).toString('hex')}.bin`;
  const payload = randomBytes(MAX_BYTES);
  try {
    // (1) y (4a) un archivo del tamaño máximo queda guardado y se lee igual
    await storage.put(key, payload, 'application/octet-stream');
    const url = await storage.downloadUrl(key, 'prueba.bin', 300);
    const res = await fetch(url);
    const body = Buffer.from(await res.arrayBuffer());
    check('un archivo de 25 MB se guarda y se descarga con su enlace firmado', res.status === 200 && body.equals(payload), `estado ${res.status}, ${body.length} bytes`);
    check('el enlace descarga con su nombre de archivo', (res.headers.get('content-disposition') ?? '').includes('prueba.bin'), res.headers.get('content-disposition') ?? 'sin Content-Disposition');

    // (2) el mismo objeto, sin firma, no se abre
    const unsigned = url.split('?')[0];
    const anon = await fetchStatus(unsigned);
    check('sin enlace firmado el acceso se rechaza', anon === 401 || anon === 403, `estado ${anon}`);
    const tampered = await fetchStatus(url.replace(/(X-Amz-Signature=)[0-9a-f]+/, '$1' + '0'.repeat(64)));
    check('un enlace con la firma alterada se rechaza', tampered === 401 || tampered === 403, `estado ${tampered}`);

    // (3) un enlace de corta duración vence
    const short = await storage.downloadUrl(key, 'prueba.bin', 2);
    check('el enlace firmado funciona mientras está vigente', (await fetchStatus(short)) === 200);
    await sleep(3500);
    const expired = await fetchStatus(short);
    check('el enlace firmado deja de funcionar al vencer', expired === 401 || expired === 403, `estado ${expired}`);
  } finally {
    await storage.remove(key);
  }

  // (4b) el proxy delante de la API deja pasar una subida del tamaño máximo (sin sesión responde 401; lo que no debe responder es 413)
  const api = process.env.SMOKE_API_URL?.replace(/\/$/, '');
  if (api) {
    const form = new FormData();
    form.append('file', new Blob([Buffer.concat([Buffer.from('%PDF-1.4\n'), randomBytes(MAX_BYTES - 9)])], { type: 'application/pdf' }), 'prueba.pdf');
    const status = await fetchStatus(`${api}/services/00000000-0000-0000-0000-000000000000/system-description/file`, { method: 'POST', body: form });
    check('el proxy de la API deja pasar una subida de 25 MB', status !== 413, `estado ${status} (401 es lo esperado sin sesión)`);
  } else {
    console.log('· Sin SMOKE_API_URL: no se probó el límite de tamaño del proxy de la API.');
  }

  const failed = results.filter((r) => !r.ok);
  console.log(failed.length ? `\n${failed.length} comprobación(es) fallaron.` : '\n✓ El almacenamiento privado cumple lo que pide MD-110.');
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
