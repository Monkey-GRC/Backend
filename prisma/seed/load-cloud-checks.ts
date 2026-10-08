// Checks del motor de nube, su mapeo a los marcos y su asignación propuesta a las pruebas T-CLD (D56) → base de datos.
//
//   npm run cloud:load              # dry-run
//   npm run cloud:load -- --apply   # escribe, en UNA transacción
//   npm run cloud:verify            # solo lectura; sale con código 1 si algo no cuadra
//
// Mismas reglas que los otros seeds: solo inserta lo que falta, aborta con diff si una fila existe con contenido distinto,
// no borra nada y se niega a correr como `monkey_app`. Requiere el catálogo de SOC 2 ya cargado (las pruebas T-CLD).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { connectAsOwner, short } from './soc2/db';
import { CloudDataset } from './cloud/build';

const apply = process.argv.includes('--apply');
const verify = process.argv.includes('--verify');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const ds = JSON.parse(readFileSync(resolve('prisma/seed/data/cloud-aws-checks.json'), 'utf8')) as CloudDataset;
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${verify ? 'verify' : apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    const tests = await prisma.test.findMany({ where: { code: { startsWith: 'T-CLD-' } }, select: { id: true, code: true } });
    const testIdByCode = new Map(tests.map((t) => [t.code, t.id]));
    const needed = new Set(ds.testChecks.map((t) => t.testCode));
    const missingTests = [...needed].filter((c) => !testIdByCode.has(c));
    if (missingTests.length) {
      console.error(`✗ Faltan en la base las pruebas ${missingTests.join(', ')}. Carga primero el catálogo (npm run catalog:load -- --apply).`);
      process.exit(1);
    }

    const dbChecks = await prisma.check.findMany({ where: { platform: 'aws', policyId: 'cloud_configuration' } });
    const dbByKey = new Map(dbChecks.map((c) => [c.checkId, c]));
    const conflicts: string[] = [];
    const checkMissing = ds.checks.filter((s) => {
      const d = dbByKey.get(s.checkId);
      if (!d) return true;
      for (const f of ['titleEn', 'condition', 'remediation', 'origin', 'mappingProvenance', 'mappingConfidence', 'serviceName', 'resourceType', 'engineSeverity', 'categories'] as const) {
        if (!same(d[f], s[f])) conflicts.push(`check ${s.checkId}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      }
      return false;
    });
    const orphans = dbChecks.filter((d) => !ds.checks.some((s) => s.checkId === d.checkId)).map((d) => `check ${d.checkId} está en la base y no en la fuente`);

    const mapKey = (m: { checkId: string; frameworkCode: string; frameworkVersion: string; requirementCode: string }) => `${m.checkId}|${m.frameworkCode}|${m.frameworkVersion}|${m.requirementCode}`;
    const dbMaps = await prisma.checkMapping.findMany({ where: { checkId: { in: dbChecks.map((c) => c.id) } } });
    const checkIdOf = new Map(dbChecks.map((c) => [c.id, c.checkId]));
    const dbMapKeys = new Set(dbMaps.map((m) => mapKey({ ...m, checkId: checkIdOf.get(m.checkId)! })));
    const mapMissing = ds.mappings.filter((m) => !dbMapKeys.has(mapKey(m)));

    const dbTcs = await prisma.testCheck.findMany({ where: { checkId: { in: dbChecks.map((c) => c.id) }, test: { code: { startsWith: 'T-CLD-' } } }, include: { test: { select: { code: true } } } });
    const tcKey = (t: { testCode: string; checkId: string }) => `${t.testCode}|${t.checkId}`;
    const dbTcByKey = new Map(dbTcs.map((t) => [tcKey({ testCode: t.test.code, checkId: checkIdOf.get(t.checkId)! }), t]));
    const tcMissing = ds.testChecks.filter((t) => {
      const d = dbTcByKey.get(tcKey(t));
      if (!d) return true;
      // Una asignación que el comité ya ratificó no se pisa con la propuesta (gana el comité).
      if (d.provenance === 'committee_ratified') return false;
      for (const f of ['provenance', 'confidence', 'rationale'] as const) if (!same(d[f], t[f])) conflicts.push(`asignación ${t.testCode}←${t.checkId}: ${f}  BD=${short(d[f])}  fuente=${short(t[f])}`);
      return false;
    });

    console.log('\ntabla            fuente   a insertar');
    console.log(`checks           ${String(ds.checks.length).padStart(6)}   ${String(checkMissing.length).padStart(10)}`);
    console.log(`check_mappings   ${String(ds.mappings.length).padStart(6)}   ${String(mapMissing.length).padStart(10)}`);
    console.log(`test_checks      ${String(ds.testChecks.length).padStart(6)}   ${String(tcMissing.length).padStart(10)}`);
    orphans.slice(0, 10).forEach((m) => console.warn('  ⚠ ' + m + ' (NO se toca)'));
    if (conflicts.length) {
      console.error(`\n✗ ${conflicts.length} fila(s) existen con contenido DISTINTO al de la fuente. No se sobrescribe nada:`);
      conflicts.slice(0, 30).forEach((m) => console.error('  - ' + m));
      process.exit(1);
    }

    const total = checkMissing.length + mapMissing.length + tcMissing.length;
    if (verify) {
      if (total || orphans.length) {
        console.error(`\n✗ La base no coincide con la fuente (faltan ${total} filas, ${orphans.length} huérfanas).`);
        process.exit(1);
      }
      console.log(`\n✓ checks = ${ds.checks.length}, check_mappings = ${ds.mappings.length}, test_checks (T-CLD) = ${ds.testChecks.length}: idénticos a la fuente.`);
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
        await tx.check.createMany({ data: checkMissing.map((c) => ({ ...c, categories: c.categories })) });
        const ids = new Map((await tx.check.findMany({ where: { platform: 'aws', policyId: 'cloud_configuration' }, select: { id: true, checkId: true } })).map((c) => [c.checkId, c.id]));
        await tx.checkMapping.createMany({ data: mapMissing.map((m) => ({ checkId: ids.get(m.checkId)!, frameworkCode: m.frameworkCode, frameworkVersion: m.frameworkVersion, requirementCode: m.requirementCode, provenance: m.provenance })) });
        await tx.testCheck.createMany({ data: tcMissing.map((t) => ({ testId: testIdByCode.get(t.testCode)!, checkId: ids.get(t.checkId)!, provenance: t.provenance, confidence: t.confidence, rationale: t.rationale })) });
      },
      { timeout: 120000 },
    );
    console.log(`\n✓ Cargadas ${total} filas en una sola transacción. Ejecuta: npm run cloud:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
