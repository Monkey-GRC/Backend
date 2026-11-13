import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Platform, PLATFORMS } from './build';

export const datasetPath = (p: Platform) => resolve(`prisma/seed/data/cloud-${p}-checks.json`);
// AWS conserva su archivo original; el resto lleva la plataforma en el nombre (un mismo checkId puede existir en dos nubes).
export const translationsPath = (p: Platform) => resolve(p === 'aws' ? 'prisma/seed/data/cloud-checks-es.json' : `prisma/seed/data/cloud-${p}-checks-es.json`);

/** Plataformas a procesar: la de `--platform` o todas las que tienen dataset. */
export function selectedPlatforms(argv: string[]): Platform[] {
  const i = argv.indexOf('--platform');
  if (i >= 0) {
    const p = argv[i + 1] as Platform;
    if (!PLATFORMS.includes(p)) throw new Error(`plataforma desconocida: ${argv[i + 1]} (${PLATFORMS.join('|')})`);
    return [p];
  }
  return PLATFORMS.filter((p) => existsSync(datasetPath(p)));
}
