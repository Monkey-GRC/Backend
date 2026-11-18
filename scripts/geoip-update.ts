// D123 · Descarga o actualiza la base GeoLite2-City de MaxMind en GEOIP_DB_PATH. La IP de las personas nunca se manda a MaxMind: esto solo baja el archivo.
// Necesita MAXMIND_ACCOUNT_ID y MAXMIND_LICENSE_KEY del entorno; la clave nunca se imprime. Escritura atómica: archivo temporal + rename.
import 'dotenv/config';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import tar from 'tar-stream';

const URL_DOWNLOAD = 'https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz';

async function main(): Promise<void> {
  const account = process.env['MAXMIND_ACCOUNT_ID']?.trim();
  const key = process.env['MAXMIND_LICENSE_KEY']?.trim();
  if (!account || !key) throw new Error('Faltan MAXMIND_ACCOUNT_ID y MAXMIND_LICENSE_KEY en el entorno.');
  const target = resolve(process.env['GEOIP_DB_PATH']?.trim() || 'geoip/GeoLite2-City.mmdb');
  const temp = `${target}.${process.pid}.tmp`;
  await mkdir(dirname(target), { recursive: true });

  const response = await fetch(URL_DOWNLOAD, { headers: { Authorization: `Basic ${Buffer.from(`${account}:${key}`).toString('base64')}` }, redirect: 'follow' });
  if (!response.ok || !response.body) throw new Error(`MaxMind respondió ${response.status}; revisa las credenciales y el plan GeoLite2.`);

  let found = false;
  try {
    const extract = tar.extract();
    const done = new Promise<void>((ok, fail) => {
      extract.on('entry', (header, stream, next) => {
        if (!found && header.name.endsWith('.mmdb')) {
          found = true;
          pipeline(stream, createWriteStream(temp)).then(() => next(), fail);
        } else {
          stream.resume();
          stream.on('end', next);
        }
      });
      extract.on('finish', ok);
      extract.on('error', fail);
    });
    await Promise.all([pipeline(Readable.fromWeb(response.body as never), createGunzip(), extract), done]);
    if (!found) throw new Error('El archivo descargado no trae un .mmdb.');
    await rename(temp, target);
    console.log(`GeoLite2-City actualizada en ${target}`);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Error desconocido');
  process.exit(1);
});
