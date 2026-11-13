// D112 · Completa `data/sonda-es/<política>.json` con lo que se puede traducir SIN escribirlo a mano. Solo lee y escribe archivos (no toca la base).
//
//   npm run sonda:generate -- --gpo --reuse                     # todas las políticas ofrecidas
//   npm run sonda:generate -- --gpo cis_win2022                 # solo esa política
//   npm run sonda:generate -- --reuse cis_ubuntu24-04 --dry-run # cuánto cubriría, sin escribir
//
//   --gpo     las guías de las políticas de Windows con el formato estándar de directiva de grupo (`sonda/gpo-translate.ts`).
//   --reuse   si una guía en inglés es IDÉNTICA a otra ya traducida (de la misma o de otra política), se reutiliza su traducción: mismo texto, mismos comandos.
//
// Nunca pisa una traducción que ya está en el archivo, ni una que el comité ya trae en español. Después hay que correr `npm run sonda:translate -- --check`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { translateGpoRemediation } from './sonda/gpo-translate';
import { loadSondaSource, loadTranslationFiles, SONDA_SOURCE_PATH, SONDA_TRANSLATIONS_DIR, SondaTranslationFile } from './sonda/translations';
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const flag = (n: string) => process.argv.includes(n);
const squash = (s: string): string => s.replace(/\s+/g, ' ').trim();

const data = JSON.parse(gunzipSync(readFileSync(resolve(SONDA_SOURCE_PATH))).toString('utf8')) as { policies: { scaId: string; isOfferable: boolean }[] };
const requested = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const targets = requested.length ? requested : data.policies.filter((p) => p.isOfferable).map((p) => p.scaId);

const source = loadSondaSource();
const files = new Map<string, SondaTranslationFile>(loadTranslationFiles().map((f) => [f.content.policyId, f.content]));
const have = (policyId: string) => new Set((files.get(policyId)?.translations ?? []).map((t) => t.checkId));

// Texto original (normalizado) → su traducción, de todo lo ya traducido.
const reusable = new Map<string, string>();
for (const f of files.values()) {
  for (const t of f.translations) {
    const original = source.get(f.policyId)?.get(t.checkId)?.remediation;
    if (original) reusable.set(squash(original), t.remediationEs);
  }
}

let totalNew = 0;
console.log('política                        nuevas(gpo)  nuevas(reuso)  total traducidas  pendientes');
for (const policyId of targets) {
  const policy = source.get(policyId);
  if (!policy) {
    console.error(`✗ ${policyId}: no existe en el catálogo`);
    process.exit(1);
  }
  const file = files.get(policyId) ?? { policyId, translations: [] };
  const done = have(policyId);
  let gpo = 0;
  let reuse = 0;
  for (const [checkId, c] of policy) {
    if (done.has(checkId) || !c.remediation?.trim() || c.remediationEs?.trim()) continue;
    let es: string | null = null;
    if (flag('--gpo')) es = translateGpoRemediation(c.remediation);
    if (es) gpo += 1;
    else if (flag('--reuse')) {
      es = reusable.get(squash(c.remediation)) ?? null;
      if (es) reuse += 1;
    }
    if (es) file.translations.push({ checkId, remediationEs: es });
  }
  file.translations.sort((a, b) => Number(a.checkId) - Number(b.checkId) || a.checkId.localeCompare(b.checkId));
  const pending = [...policy].filter(([id, c]) => c.remediation?.trim() && !c.remediationEs?.trim() && !file.translations.some((t) => t.checkId === id)).length;
  console.log(`${policyId.padEnd(30)}  ${String(gpo).padStart(10)}  ${String(reuse).padStart(13)}  ${String(file.translations.length).padStart(16)}  ${String(pending).padStart(10)}`);
  totalNew += gpo + reuse;
  if ((gpo + reuse > 0 || files.has(policyId)) && !flag('--dry-run')) {
    mkdirSync(resolve(SONDA_TRANSLATIONS_DIR), { recursive: true });
    writeFileSync(resolve(SONDA_TRANSLATIONS_DIR, `${policyId}.json`), JSON.stringify(file, null, 1) + '\n');
  }
}
console.log(`\n${flag('--dry-run') ? 'Dry-run: nada se escribió. ' : ''}Nuevas: ${totalNew}.`);
