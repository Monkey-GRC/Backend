// D113 · Qué guías de la sonda faltan por traducir. Solo lee archivos (no toca la base).
//
//   npm run sonda:untranslated                                 # cuántas faltan por política ofrecida
//   npm run sonda:untranslated -- cis_ubuntu22-04              # las pendientes de esa política, en JSON (checkId, título, original)
//   npm run sonda:untranslated -- cis_ubuntu22-04 --from 0 --count 40
//
// «Pendiente» = el comité no trae guía en español y todavía no está en `data/sonda-es/<política>.json`. Sirve para repartir el trabajo en tandas y para ver el avance.
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadTranslationFiles, SONDA_SOURCE_PATH } from './sonda/translations';

type Policy = { scaId: string; benchmark: string; isOfferable: boolean };
type Check = { policyId: string; checkId: string; titleEs: string | null; remediation: string | null; remediationEs: string | null };

const arg = (name: string): number | null => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? Number(process.argv[i + 1]) : null;
};

const data = JSON.parse(gunzipSync(readFileSync(resolve(SONDA_SOURCE_PATH))).toString('utf8')) as { policies: Policy[]; checks: Check[] };
const done = new Map(loadTranslationFiles().map((f) => [f.content.policyId, new Set(f.content.translations.map((t) => t.checkId))]));
const pending = (policyId: string): Check[] => data.checks.filter((c) => c.policyId === policyId && c.remediation?.trim() && !c.remediationEs?.trim() && !done.get(policyId)?.has(c.checkId));

const policyId = process.argv.slice(2).find((a) => !a.startsWith('--') && Number.isNaN(Number(a)));
if (!policyId) {
  console.log('política                        pendientes  traducidas  benchmark');
  for (const p of data.policies.filter((p) => p.isOfferable)) {
    console.log(`${p.scaId.padEnd(30)}  ${String(pending(p.scaId).length).padStart(9)}  ${String(done.get(p.scaId)?.size ?? 0).padStart(10)}  ${p.benchmark}`);
  }
} else {
  const from = arg('--from') ?? 0;
  const count = arg('--count') ?? 1000;
  console.log(JSON.stringify(pending(policyId).slice(from, from + count).map((c) => ({ checkId: c.checkId, title: c.titleEs, remediation: c.remediation })), null, 1));
}
