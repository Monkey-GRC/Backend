// Checks del motor de nube, su mapeo a los marcos y su asignación propuesta a las pruebas T-CLD (D56) → base de datos.
//
//   npm run cloud:load              # dry-run
//   npm run cloud:load -- --apply   # escribe, en UNA transacción
//   --platform aws|gcp              # por defecto, todas las plataformas con dataset
//   npm run cloud:verify            # solo lectura; sale con código 1 si algo no cuadra
//
// También escribe la guía en español de cada check (D90, data/cloud-checks-es.json para AWS y data/cloud-<plataforma>-checks-es.json para las demás: `title_es`, `remediation_es`, `translation_origin = machine`) sin pisar una que una persona ya revisó;
// `--verify` falla si algún check queda sin traducir. `npm run cloud:translate` hace solo esta parte.
//
// Mismas reglas que los otros seeds: solo inserta lo que falta, aborta con diff si una fila existe con contenido distinto,
// no borra nada y se niega a correr como `monkey_app`. Requiere el catálogo de SOC 2 ya cargado (las pruebas T-CLD).
import { readFileSync } from 'node:fs';
import { connectAsOwner, short } from './soc2/db';
import { CloudDataset, Platform } from './cloud/build';
import { datasetPath, selectedPlatforms, translationsPath } from './cloud/datasets';
import { CheckTranslation, validateTranslations } from './cloud/translations';

const apply = process.argv.includes('--apply');
const verify = process.argv.includes('--verify');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

type Prisma = Awaited<ReturnType<typeof connectAsOwner>>['prisma'];

type Plan = {
  platform: Platform;
  ds: CloudDataset;
  translations: CheckTranslation[];
  testIdByCode: Map<string, string>;
  checkMissing: CloudDataset['checks'];
  mapMissing: CloudDataset['mappings'];
  tcMissing: CloudDataset['testChecks'];
  translationMissing: CheckTranslation[];
  orphans: string[];
  untranslated: string[];
  errors: string[];
  total: number;
};

// Solo lee y calcula: nunca escribe ni sale del proceso. Los problemas se acumulan en `errors`.
async function planPlatform(prisma: Prisma, platform: Platform): Promise<Plan> {
  const ds = JSON.parse(readFileSync(datasetPath(platform), 'utf8')) as CloudDataset;
  const tests = await prisma.test.findMany({ where: { code: { startsWith: 'T-CLD-' } }, select: { id: true, code: true } });
  const testIdByCode = new Map(tests.map((t) => [t.code, t.id]));
  const needed = new Set(ds.testChecks.map((t) => t.testCode));
  const missingTests = [...needed].filter((c) => !testIdByCode.has(c));
  const errors: string[] = [];
  if (missingTests.length) errors.push(`[${platform}] Faltan en la base las pruebas ${missingTests.join(', ')}. Carga primero el catálogo (npm run catalog:load -- --apply).`);

  const translations = JSON.parse(readFileSync(translationsPath(platform), 'utf8')) as CheckTranslation[];
  const translationProblems = validateTranslations(translations, new Set(ds.checks.map((c) => c.checkId)));
  translationProblems.slice(0, 30).forEach((p) => errors.push(`[${platform}] traducción: ${p}`));
  const translatedIds = new Set(translations.map((t) => t.checkId));
  const untranslated = ds.checks.filter((c) => !translatedIds.has(c.checkId)).map((c) => `check ${c.checkId} sin traducción al español (D90)`);

  const dbChecks = await prisma.check.findMany({ where: { platform, policyId: 'cloud_configuration' } });
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

  // La guía en español (D90): se escribe lo que falta o cambió, salvo lo que una persona ya revisó.
  const translationMissing = translations.filter((t) => {
    const d = dbByKey.get(t.checkId);
    if (!d) return true;
    return d.translationOrigin !== 'reviewed' && (d.titleEs !== t.titleEs || d.remediationEs !== t.remediationEs || d.translationOrigin !== 'machine');
  });

  conflicts.slice(0, 30).forEach((m) => errors.push(`[${platform}] fila existente con contenido DISTINTO al de la fuente: ${m}`));
  const total = checkMissing.length + mapMissing.length + tcMissing.length + translationMissing.length;
  return { platform, ds, translations, testIdByCode, checkMissing, mapMissing, tcMissing, translationMissing, orphans, untranslated, errors, total };
}

function report(p: Plan) {
  const { ds, translations, checkMissing, mapMissing, tcMissing, translationMissing, orphans, untranslated } = p;
  console.log(`\n== ${p.platform} ==`);
  console.log('\ntabla            fuente   a insertar');
  console.log(`checks           ${String(ds.checks.length).padStart(6)}   ${String(checkMissing.length).padStart(10)}`);
  console.log(`check_mappings   ${String(ds.mappings.length).padStart(6)}   ${String(mapMissing.length).padStart(10)}`);
  console.log(`test_checks      ${String(ds.testChecks.length).padStart(6)}   ${String(tcMissing.length).padStart(10)}`);
  console.log(`checks (guía es)  ${String(translations.length).padStart(6)}   ${String(translationMissing.length).padStart(10)}`);
  untranslated.slice(0, 10).forEach((m) => console.warn('  ⚠ ' + m));
  orphans.slice(0, 10).forEach((m) => console.warn('  ⚠ ' + m + ' (NO se toca)'));
}

async function writePlans(prisma: Prisma, plans: Plan[]) {
  await prisma.$transaction(
    async (tx) => {
      for (const p of plans) {
        await tx.check.createMany({ data: p.checkMissing.map((c) => ({ ...c, categories: c.categories })) });
        const ids = new Map((await tx.check.findMany({ where: { platform: p.platform, policyId: 'cloud_configuration' }, select: { id: true, checkId: true } })).map((c) => [c.checkId, c.id]));
        await tx.checkMapping.createMany({ data: p.mapMissing.map((m) => ({ checkId: ids.get(m.checkId)!, frameworkCode: m.frameworkCode, frameworkVersion: m.frameworkVersion, requirementCode: m.requirementCode, provenance: m.provenance })) });
        for (const t of p.translationMissing) await tx.check.update({ where: { id: ids.get(t.checkId)! }, data: { titleEs: t.titleEs, remediationEs: t.remediationEs, translationOrigin: 'machine' } });
        await tx.testCheck.createMany({ data: p.tcMissing.map((t) => ({ testId: p.testIdByCode.get(t.testCode)!, checkId: ids.get(t.checkId)!, provenance: t.provenance, confidence: t.confidence, rationale: t.rationale })) });
      }
    },
    { timeout: 120000 },
  );
}

async function main() {
  const platforms = selectedPlatforms(process.argv);
  if (platforms.length === 0) {
    console.error('✗ No hay ningún dataset en prisma/seed/data/cloud-<plataforma>-checks.json (npm run cloud:extract).');
    process.exit(1);
  }
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${verify ? 'verify' : apply ? 'APPLY' : 'dry-run'})  plataformas: ${platforms.join(', ')}`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }
    // Primero se planifica TODO (sin escribir); si algo falla en cualquier plataforma, no se escribe nada.
    const plans: Plan[] = [];
    for (const platform of platforms) plans.push(await planPlatform(prisma, platform));
    plans.forEach(report);
    const errors = plans.flatMap((p) => p.errors);
    if (errors.length) {
      console.error(`\n✗ ${errors.length} problema(s). No se escribe nada:`);
      errors.forEach((e) => console.error('  - ' + e));
      process.exit(1);
    }
    const total = plans.reduce((n, p) => n + p.total, 0);
    if (verify) {
      const orphans = plans.reduce((n, p) => n + p.orphans.length, 0);
      const untranslated = plans.reduce((n, p) => n + p.untranslated.length, 0);
      if (total || orphans || untranslated) {
        plans.flatMap((p) => p.untranslated.map((m) => `[${p.platform}] ${m}`)).slice(0, 30).forEach((m) => console.error('  ✗ ' + m));
        console.error(`\n✗ La base no coincide con la fuente (faltan ${total} filas, ${orphans} huérfanas, ${untranslated} sin traducir).`);
        process.exit(1);
      }
      plans.forEach((p) => console.log(`\n✓ ${p.platform}: checks = ${p.ds.checks.length}, check_mappings = ${p.ds.mappings.length}, test_checks (T-CLD) = ${p.ds.testChecks.length}, guía en español = ${p.translations.length}: idénticos a la fuente.`));
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
    await writePlans(prisma, plans);
    console.log(`\n✓ Cargadas ${total} filas de ${plans.length} plataforma(s) en una sola transacción. Ejecuta: npm run cloud:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
