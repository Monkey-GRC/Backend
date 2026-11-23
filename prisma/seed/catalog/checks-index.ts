// El índice de checks que usa el cruce de TEST_CHECKS, a partir de los datasets ya extraídos (sonda y motor de nube): así lo que cruza es, por construcción,
// lo que `sonda:load` y `cloud:load` van a tener en la tabla `checks`.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { CloudDataset, platformOfLabel, PLATFORMS } from '../cloud/build';
import { datasetPath } from '../cloud/datasets';
import { SondaDataset } from '../sonda/build';
import { ChecksIndex, CLOUD_POLICY_ID } from './checks-cross';

export const SONDA_DATA = 'prisma/seed/data/sonda-checks.json.gz';

export function readSondaDataset(): SondaDataset {
  const f = resolve(SONDA_DATA);
  if (!existsSync(f)) throw new Error(`Falta ${SONDA_DATA}: corre antes npm run sonda:extract.`);
  return JSON.parse(gunzipSync(readFileSync(f)).toString('utf8')) as SondaDataset;
}

export function readCloudDatasets(): Map<string, CloudDataset> {
  const out = new Map<string, CloudDataset>();
  for (const p of PLATFORMS) {
    const f = datasetPath(p);
    if (!existsSync(f)) throw new Error(`Falta ${f}: corre antes npm run cloud:extract.`);
    out.set(p, JSON.parse(readFileSync(f, 'utf8')) as CloudDataset);
  }
  return out;
}

export function buildChecksIndex(sonda: SondaDataset, cloud: ReadonlyMap<string, CloudDataset>): ChecksIndex {
  const policies = new Map(sonda.policies.map((p) => [`${p.platformLabel}||${p.benchmark}`, { platform: p.platform, policyId: p.scaId }]));
  const sondaChecks = new Set(sonda.checks.map((c) => `${c.platform}|${c.policyId}|${c.checkId}`));
  const cloudChecks = new Set([...cloud].flatMap(([platform, ds]) => ds.checks.map((c) => `${platform}|${c.checkId}`)));
  return {
    sondaPolicy: (label, benchmark) => policies.get(`${label}||${benchmark}`) ?? null,
    hasSondaCheck: (platform, policyId, checkId) => sondaChecks.has(`${platform}|${policyId}|${checkId}`),
    cloudPlatform: (label) => platformOfLabel(label),
    hasCloudCheck: (platform, checkId) => cloudChecks.has(`${platform}|${checkId}`),
  };
}

export { CLOUD_POLICY_ID };
