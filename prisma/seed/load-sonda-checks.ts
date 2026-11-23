// Políticas, checks y su mapeo a SOC 2 (D113) → base de datos. Los vínculos prueba–check los carga `catalog:load` (TEST_CHECKS, DEV-12).
//
//   npm run sonda:load              # dry-run
//   npm run sonda:load -- --apply   # escribe, en UNA transacción
//   npm run sonda:verify            # solo lectura; sale con código 1 si algo no cuadra
//
// Mismas reglas que los otros seeds: solo inserta lo que falta, aborta con diff si una fila existe con contenido distinto, no borra nada y se niega a
// correr como `monkey_app`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { connectAsOwner, short } from './db';
import { SondaDataset } from './sonda/build';

const apply = process.argv.includes('--apply');
const verify = process.argv.includes('--verify');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const chunks = <T>(xs: T[], n: number): T[][] => Array.from({ length: Math.ceil(xs.length / n) }, (_v, i) => xs.slice(i * n, (i + 1) * n));
const CHUNK = 2000;

async function main() {
  const ds = JSON.parse(gunzipSync(readFileSync(resolve('prisma/seed/data/sonda-checks.json.gz'))).toString('utf8')) as SondaDataset;
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${verify ? 'verify' : apply ? 'APPLY' : 'dry-run'})`);
    console.log(`Fuente: ${ds.meta.sourceFile} (sha256 ${ds.meta.sourceSha256.slice(0, 12)}…), sonda ${ds.meta.sondaVersion}`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    // Políticas.
    const conflicts: string[] = [];
    const dbPolicies = await prisma.scaPolicy.findMany();
    const policyByScaId = new Map(dbPolicies.map((p) => [p.scaId, p]));
    const policyMissing = ds.policies.filter((s) => {
      const d = policyByScaId.get(s.scaId);
      if (!d) return true;
      const src = { benchmark: s.benchmark, platform: s.platformLabel, yamlFile: s.yamlFile, checkCount: s.checkCount, osCode: s.osCode, distribution: s.distribution, distributionName: s.distributionName, versionLabel: s.versionLabel, versionCode: s.versionCode, sortOrder: s.sortOrder, isOfferable: s.isOfferable };
      for (const [f, v] of Object.entries(src)) if (!same((d as Record<string, unknown>)[f], v)) conflicts.push(`política ${s.scaId}: ${f}  BD=${short((d as Record<string, unknown>)[f])}  fuente=${short(v)}`);
      return false;
    });

    // Checks (clave natural: platform + policy_id + check_id).
    const dbChecks = await prisma.check.findMany({ where: { policyId: { in: ds.policies.map((p) => p.scaId) } } });
    const ck = (c: { platform: string; policyId: string; checkId: string }) => `${c.platform}|${c.policyId}|${c.checkId}`;
    const dbCheckByKey = new Map(dbChecks.map((c) => [ck(c), c]));
    const checkMissing = ds.checks.filter((s) => {
      const d = dbCheckByKey.get(ck(s));
      if (!d) return true;
      for (const f of ['titleEn', 'titleEs', 'condition', 'remediation', 'remediationEs', 'translationOrigin', 'verificationRule', 'origin', 'mappingProvenance', 'mappingConfidence'] as const) {
        // Sin guía en español en la fuente, esas dos columnas las escribe después `sonda:translate`: no son una diferencia con la fuente. Si la fuente trae la
        // guía (la del comité), sí se compara.
        if ((f === 'remediationEs' || f === 'translationOrigin') && s.remediationEs == null) continue;
        if (!same(d[f], s[f])) conflicts.push(`check ${s.policyId}/${s.checkId}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      }
      return false;
    });
    const orphans = dbChecks.filter((d) => !ds.checks.some((s) => ck(s) === ck(d))).map((d) => `check ${d.policyId}/${d.checkId} está en la base y no en la fuente`);

    // Mapeos y asignaciones: por el id de base de cada check.
    const keyOfId = new Map(dbChecks.map((c) => [c.id, `${c.policyId}|${c.checkId}`]));
    const mapKey = (m: { policyId: string; checkId: string; frameworkCode: string; frameworkVersion: string; requirementCode: string }) => `${m.policyId}|${m.checkId}|${m.frameworkCode}|${m.frameworkVersion}|${m.requirementCode}`;
    const dbMaps = dbChecks.length ? await prisma.checkMapping.findMany({ where: { checkId: { in: dbChecks.map((c) => c.id) } } }) : [];
    const dbMapKeys = new Set(dbMaps.map((m) => { const [p, c] = keyOfId.get(m.checkId)!.split('|'); return mapKey({ ...m, policyId: p, checkId: c }); }));
    const mapMissing = ds.mappings.filter((m) => !dbMapKeys.has(mapKey(m)));

    console.log('\ntabla            fuente   a insertar');
    console.log(`sca_policies     ${String(ds.policies.length).padStart(6)}   ${String(policyMissing.length).padStart(10)}`);
    console.log(`checks           ${String(ds.checks.length).padStart(6)}   ${String(checkMissing.length).padStart(10)}`);
    console.log(`check_mappings   ${String(ds.mappings.length).padStart(6)}   ${String(mapMissing.length).padStart(10)}`);
    ds.warnings.forEach((w) => console.warn('  ⚠ ' + w));
    orphans.slice(0, 10).forEach((m) => console.warn('  ⚠ ' + m + ' (NO se toca)'));
    if (conflicts.length) {
      console.error(`\n✗ ${conflicts.length} fila(s) existen con contenido DISTINTO al de la fuente. No se sobrescribe nada:`);
      conflicts.slice(0, 30).forEach((m) => console.error('  - ' + m));
      process.exit(1);
    }

    const total = policyMissing.length + checkMissing.length + mapMissing.length;
    if (verify) {
      if (total || orphans.length) {
        console.error(`\n✗ La base no coincide con la fuente (faltan ${total} filas, ${orphans.length} huérfanas).`);
        process.exit(1);
      }
      console.log(`\n✓ sca_policies = ${ds.policies.length}, checks = ${ds.checks.length}, check_mappings = ${ds.mappings.length}: idénticos a la fuente.`);
      return;
    }
    if (total === 0) {
      console.log('\n✓ La base ya coincide con la fuente. Nada que insertar.');
      return;
    }
    if (!apply) {
      console.log(`\nDry-run: se insertarían ${total} filas. Nada se escribió. Repite con -- --apply para cargarlas.`);
      return;
    }

    await prisma.$transaction(
      async (tx) => {
        if (policyMissing.length) {
          await tx.scaPolicy.createMany({
            data: policyMissing.map((p) => ({ platform: p.platformLabel, benchmark: p.benchmark, scaId: p.scaId, yamlFile: p.yamlFile, checkCount: p.checkCount, osCode: p.osCode, distribution: p.distribution, distributionName: p.distributionName, versionLabel: p.versionLabel, versionCode: p.versionCode, sortOrder: p.sortOrder, isOfferable: p.isOfferable })),
          });
        }
        const policyIdByScaId = new Map((await tx.scaPolicy.findMany({ select: { id: true, scaId: true } })).map((p) => [p.scaId, p.id]));
        for (const part of chunks(checkMissing, CHUNK)) {
          await tx.check.createMany({
            data: part.map((c) => ({ platform: c.platform, policyId: c.policyId, checkId: c.checkId, titleEn: c.titleEn, titleEs: c.titleEs, condition: c.condition, remediation: c.remediation, remediationEs: c.remediationEs, translationOrigin: c.translationOrigin, verificationRule: c.verificationRule, origin: c.origin, mappingProvenance: c.mappingProvenance, mappingConfidence: c.mappingConfidence, scaPolicyId: policyIdByScaId.get(c.policyId)! })),
          });
        }
        const ids = new Map((await tx.check.findMany({ where: { policyId: { in: ds.policies.map((p) => p.scaId) } }, select: { id: true, policyId: true, checkId: true } })).map((c) => [`${c.policyId}|${c.checkId}`, c.id]));
        for (const part of chunks(mapMissing, CHUNK)) {
          await tx.checkMapping.createMany({ data: part.map((m) => ({ checkId: ids.get(`${m.policyId}|${m.checkId}`)!, frameworkCode: m.frameworkCode, frameworkVersion: m.frameworkVersion, requirementCode: m.requirementCode, provenance: m.provenance })) });
        }
      },
      { timeout: 600000 },
    );
    console.log(`\n✓ Cargadas ${total} filas en una sola transacción. Ejecuta: npm run sonda:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
