// Catálogo de checks de nube (D56): lee los metadatos y los marcos que trae el motor y escribe prisma/seed/data/cloud-<plataforma>-checks.json.
//
//   npm run cloud:extract -- <carpeta-del-motor> [versión] [--platform gcp]     (por defecto aws)
//
// La carpeta es la copia de `prowler/` de la imagen del motor (la que tiene `compliance/<plataforma>` y `providers/<plataforma>/services`); se
// obtiene con `docker run --rm --entrypoint sh <imagen> -c "cd /home/prowler/prowler && tar cf - compliance/<plataforma>/*.json providers/<plataforma>/services/*/*/*.metadata.json"`.
// Si algo no cuadra, NO escribe.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildCloudDataset, EngineCheckMeta, EngineFramework, Platform, PLATFORMS } from './cloud/build';

const args = process.argv.slice(2);
const pi = args.indexOf('--platform');
const platform = (pi >= 0 ? args.splice(pi, 2)[1] : 'aws') as Platform;
const [dir, versionArg] = args;
const engineVersion = versionArg ?? '5.44.0';
if (!dir || !PLATFORMS.includes(platform)) {
  console.error(`Uso: npm run cloud:extract -- <carpeta-del-motor> [versión] [--platform ${PLATFORMS.join('|')}]`);
  process.exit(1);
}
const OUT = resolve(`prisma/seed/data/cloud-${platform}-checks.json`);

const metas: EngineCheckMeta[] = [];
const services = join(dir, `providers/${platform}/services`);
for (const svc of readdirSync(services, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const chk of readdirSync(join(services, svc.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const f = join(services, svc.name, chk.name, `${chk.name}.metadata.json`);
    try {
      metas.push(JSON.parse(readFileSync(f, 'utf8')));
    } catch {
      /* carpeta sin metadatos (p. ej. lib) */
    }
  }
}
const frameworks: EngineFramework[] = readdirSync(join(dir, `compliance/${platform}`))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, `compliance/${platform}`, f), 'utf8')));
const soc2 = JSON.parse(readFileSync(resolve('prisma/seed/data/soc2-catalog.json'), 'utf8'));

const { dataset, errors, warnings } = buildCloudDataset(engineVersion, metas, frameworks, soc2, platform);
if (errors.length) {
  console.error(`✗ ${errors.length} error(es); no se escribió nada:`);
  errors.slice(0, 40).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
warnings.forEach((w) => console.warn('  ⚠ ' + w));
writeFileSync(OUT, JSON.stringify(dataset, null, 2) + '\n');
const byTest = new Map<string, number>();
dataset.testChecks.forEach((t) => byTest.set(t.testCode, (byTest.get(t.testCode) ?? 0) + 1));
const assigned = new Set(dataset.testChecks.map((t) => t.checkId));
console.log(`✓ ${OUT}\n  checks ${dataset.checks.length} · mapeos de marcos ${dataset.mappings.length} · asignaciones check→prueba ${dataset.testChecks.length}`);
console.log(`  checks sin prueba (cobertura no alcanzada): ${dataset.checks.length - assigned.size}`);
[...byTest].sort().forEach(([t, n]) => console.log(`  ${t}: ${n}`));
