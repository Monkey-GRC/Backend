// Verificación posterior a la carga del catálogo v2 (RC-01). SOLO LECTURA. Sale con código 1 si algo no cuadra.
//
//   npm run catalog:verify              # APP_DATABASE_URL (opcional) añade la comprobación de RLS con el rol de la app
//   npm run catalog:verify -- --detail  # además, una fila por política de la sonda
//
// (1) totales de la tabla 10, (2) base ↔ JSON fila por fila, (3) puentes con el código v1, (4) integridad relacional (IN-01…IN-10 y que no queden vínculos
// ni FKs colgadas), (5) los catálogos de checks por plataforma y por política, con sus vínculos y mapeos, (6) marca blanca y (7) RLS de escritura (D31).
import { createHash } from 'node:crypto';
import { Client } from 'pg';
import { CloudDataset } from './cloud/build';
import { namesProvider } from './catalog/display-names';
import { readCloudDatasets, readSondaDataset } from './catalog/checks-index';
import { CatalogV2, EXPECTED_COUNTS, EXPECTED_DETAIL } from './catalog/types';
import { validateCatalog } from './catalog/validate';
import { connectAsOwner, readCatalogJson, short } from './db';

let failed = 0;
const COMMITTEE = { origin: 'committee' } as const;
const ok = (m: string) => console.log(`  ✓ ${m}`);
const bad = (m: string) => {
  failed++;
  console.error(`  ✗ ${m}`);
};
const check = (cond: boolean, pass: string, fail: string) => (cond ? ok(pass) : bad(fail));
const digest = (lines: string[]) => createHash('sha256').update([...lines].sort().join('\n')).digest('hex').slice(0, 16);
const detail = process.argv.includes('--detail');

function compareSets(name: string, db: string[], src: string[]) {
  const d = new Set(db);
  const s = new Set(src);
  const onlyDb = db.filter((x) => !s.has(x));
  const onlySrc = src.filter((x) => !d.has(x));
  if (!onlyDb.length && !onlySrc.length && db.length === src.length) {
    ok(`${name}: ${db.length} filas idénticas a la fuente (hash ${digest(db)})`);
    return;
  }
  bad(`${name}: BD y fuente difieren (${onlyDb.length} solo en BD, ${onlySrc.length} solo en fuente)`);
  onlyDb.slice(0, 3).forEach((x) => console.error(`      solo BD    : ${short(x, 110)}`));
  onlySrc.slice(0, 3).forEach((x) => console.error(`      solo fuente: ${short(x, 110)}`));
}

const pad = (s: string | number, n: number) => String(s).padEnd(n);
const num = (s: string | number, n: number) => String(s).padStart(n);

async function main() {
  const cat: CatalogV2 = readCatalogJson();
  const verdict = validateCatalog(cat);
  if (verdict.errors.length) {
    verdict.errors.forEach((m) => bad(`JSON: ${m}`));
    process.exit(1);
  }
  const sonda = readSondaDataset();
  const cloud = readCloudDatasets();

  const { prisma, target } = await connectAsOwner();
  try {
    console.log(`Verificando ${target.user}@${target.host}:${target.port}/${target.database}\n`);
    const fw = await prisma.framework.findFirst({ where: { code: cat.framework.code, version: cat.framework.version } });
    check(!!fw, 'framework soc2 existe', 'falta el framework soc2');
    if (!fw) process.exit(1);

    // ---- 1. Totales de la tabla 10 ----
    console.log('1. Totales (tabla 10 de 01_DESARROLLO)');
    const inFw = { requirement: { frameworkId: fw.id } };
    const n: Record<keyof typeof EXPECTED_COUNTS, number> = {
      controls: await prisma.control.count({ where: COMMITTEE }),
      pointOfFocusControls: await prisma.pointOfFocusControl.count({ where: { pointOfFocus: inFw, control: COMMITTEE } }),
      trustCriteria: await prisma.trustCriterion.count(),
      requirements: await prisma.requirement.count({ where: { frameworkId: fw.id } }),
      pointsOfFocus: await prisma.pointOfFocus.count({ where: inFw }),
      controlRequirements: await prisma.controlRequirement.count(),
      controlRequirementTests: await prisma.controlRequirementTest.count(),
      controlRequirementDocuments: await prisma.controlRequirementDocument.count(),
      controlTests: await prisma.controlTest.count({ where: { control: COMMITTEE, test: COMMITTEE } }),
      controlDimensions: await prisma.controlDimensionEntry.count({ where: { control: COMMITTEE } }),
      tests: await prisma.test.count({ where: COMMITTEE }),
      testChecks: await prisma.testCheck.count(),
      documents: await prisma.document.count(),
      controlDocuments: await prisma.controlDocument.count(),
      causes: await prisma.cause.count({ where: COMMITTEE }),
      risks: await prisma.risk.count({ where: COMMITTEE }),
      riskCauses: await prisma.riskCause.count({ where: { risk: COMMITTEE, cause: COMMITTEE } }),
      causeControls: await prisma.causeControl.count({ where: { cause: COMMITTEE, control: COMMITTEE } }),
      standardProcedures: await prisma.standardProcedure.count(),
      integrationCategories: await prisma.integrationCategory.count(),
      integrationCategoryControls: await prisma.integrationCategoryControl.count(),
      controlFrameworkMappings: await prisma.controlFrameworkMapping.count(),
    };
    for (const k of Object.keys(EXPECTED_COUNTS) as (keyof typeof EXPECTED_COUNTS)[]) check(n[k] === EXPECTED_COUNTS[k], `${k} = ${EXPECTED_COUNTS[k]}`, `${k}: ${n[k]} ≠ ${EXPECTED_COUNTS[k]}`);
    const versions = await prisma.catalogVersion.findMany({ where: { number: 2 } });
    check(versions.length === 1, 'catalog_versions: la versión 2 está publicada', `catalog_versions con number = 2: ${versions.length}`);
    const roles = await prisma.testCheck.groupBy({ by: ['role'], _count: true });
    for (const [r, v] of Object.entries(EXPECTED_DETAIL.testChecksByRole)) {
      const have = roles.find((x) => x.role === r)?._count ?? 0;
      check(have === v, `vínculos ${r} = ${v}`, `vínculos ${r}: ${have} ≠ ${v}`);
    }
    const withCheck = await prisma.testCheck.count({ where: { checkId: { not: null } } });
    const modules = await prisma.testCheck.count({ where: { checkId: null, moduleRef: { not: null } } });
    check(withCheck === EXPECTED_COUNTS.testChecks - EXPECTED_DETAIL.moduleLinks, `${withCheck} vínculos cruzan con un check`, `vínculos con check: ${withCheck}`);
    check(modules === EXPECTED_DETAIL.moduleLinks, `${modules} vínculos «N/A» van con module_ref y sin check`, `vínculos «N/A» con module_ref: ${modules} ≠ ${EXPECTED_DETAIL.moduleLinks}`);

    // ---- 2. Base ↔ fuente, fila a fila ----
    console.log('\n2. Comparación fila a fila BD ↔ fuente');
    const tcDb = await prisma.trustCriterion.findMany();
    compareSets('trust_criteria', tcDb.map((t) => `${t.criterion}|${t.isMandatory}`), cat.trustCriteria.map((t) => `${t.criterion}|${t.isMandatory}`));
    const reqDb = await prisma.requirement.findMany({ where: { frameworkId: fw.id }, include: { trustCriterion: true } });
    compareSets('requirements', reqDb.map((r) => `${r.code}|${r.tscCategory}|${r.criterion}|${r.trustCriterion.criterion}`), cat.requirements.map((r) => `${r.code}|${r.tscCategory}|${r.criterion}|${r.trustCriterion}`));
    const pofDb = await prisma.pointOfFocus.findMany({ where: inFw, include: { requirement: true } });
    compareSets('points_of_focus', pofDb.map((p) => `${p.requirement.code}#${p.number}|${p.description}`), cat.pointsOfFocus.map((p) => `${p.requirementCode}#${p.number}|${p.description}`));
    const ctrlDb = await prisma.control.findMany({ where: COMMITTEE });
    const ck = (k: { code: string; name: string; description: string; type: string | null; periodicity: string | null; suggestedOwnerRole: string | null }) =>
      `${k.code}|${k.name}|${k.description}|${k.type}|${k.periodicity}|${k.suggestedOwnerRole}`;
    compareSets('controls', ctrlDb.map(ck), cat.controls.map(ck));
    check(ctrlDb.every((k) => k.domain === null), 'controls.domain es nulo en todos (el dominio es de la fila)', 'hay controles con dominio');
    const relDb = await prisma.pointOfFocusControl.findMany({ where: { pointOfFocus: inFw, control: COMMITTEE }, include: { pointOfFocus: { include: { requirement: true } }, control: true } });
    compareSets('point_of_focus_controls', relDb.map((r) => `${r.pointOfFocus.requirement.code}#${r.pointOfFocus.number}#${r.control.code}|${r.domain}`), cat.pointOfFocusControls.map((r) => `${r.requirementCode}#${r.pointNumber}#${r.controlCode}|${r.domain}`));
    const dimDb = await prisma.controlDimensionEntry.findMany({ where: { control: COMMITTEE }, include: { control: true } });
    compareSets('control_dimensions', dimDb.map((r) => `${r.control.code}#${r.dimension}`), cat.controlDimensions.map((r) => `${r.controlCode}#${r.dimension}`));
    const creqDb = await prisma.controlRequirement.findMany({ include: { control: true } });
    const rf = (r: { code: string; ctrl: string; point: number | null; text: string; type: string; periodicity: string | null; mandatory: boolean; note: string | null }) => `${r.code}|${r.ctrl}|${r.point}|${r.text}|${r.type}|${r.periodicity}|${r.mandatory}|${r.note}`;
    compareSets('control_requirements', creqDb.map((r) => rf({ code: r.code, ctrl: r.control.code, point: r.pointNumber, text: r.text, type: r.type, periodicity: r.periodicity, mandatory: r.isMandatory, note: r.assemblyNote })), cat.controlRequirements.map((r) => rf({ code: r.code, ctrl: r.controlCode, point: r.pointNumber, text: r.text, type: r.type, periodicity: r.periodicity, mandatory: r.isMandatory, note: r.assemblyNote })));
    const crtDb = await prisma.controlRequirementTest.findMany({ include: { controlRequirement: true, test: true } });
    compareSets('control_requirement_tests', crtDb.map((r) => `${r.controlRequirement.code}#${r.test.code}`), cat.controlRequirementTests.map((r) => `${r.requirementCode}#${r.testCode}`));
    const crdDb = await prisma.controlRequirementDocument.findMany({ include: { controlRequirement: true, document: true } });
    compareSets('control_requirement_documents', crdDb.map((r) => `${r.controlRequirement.code}#${r.document.code}`), cat.controlRequirementDocuments.map((r) => `${r.requirementCode}#${r.documentCode}`));
    const docDb = await prisma.document.findMany({ include: { test: true } });
    const df = (d: { code: string; type: string; name: string; description: string | null; minimumContent: string | null; period: string | null; approver: string | null; owner: string | null; origin: string; acceptance: string; test: string | undefined }) =>
      [d.code, d.type, d.name, d.description, d.minimumContent, d.period, d.approver, d.owner, d.origin, d.acceptance, d.test].join('|');
    compareSets('documents', docDb.map((d) => df({ code: d.code, type: d.type, name: d.name, description: d.description, minimumContent: d.minimumContent, period: d.reviewPeriodicity, approver: d.suggestedApproverRole, owner: d.suggestedOwnerRole, origin: d.origin, acceptance: d.suggestedAcceptance, test: d.test?.code })), cat.documents.map((d) => df({ code: d.code, type: d.type, name: d.name, description: d.description, minimumContent: d.minimumContent, period: d.reviewPeriodicity, approver: d.suggestedApproverRole, owner: d.suggestedOwnerRole, origin: d.origin, acceptance: d.suggestedAcceptance, test: d.testCode })));
    const cdDb = await prisma.controlDocument.findMany({ include: { control: true, document: true } });
    compareSets('control_documents', cdDb.map((r) => `${r.control.code}#${r.document.code}`), cat.controlDocuments.map((r) => `${r.controlCode}#${r.documentCode}`));
    const procDb = await prisma.standardProcedure.findMany();
    compareSets('standard_procedures', procDb.map((p) => `${p.code}|${p.name}|${p.whenUsed}|${p.genericSteps}|${p.typicalEvidence}`), cat.standardProcedures.map((p) => `${p.code}|${p.name}|${p.whenUsed}|${p.genericSteps}|${p.typicalEvidence}`));
    const icDb = await prisma.integrationCategory.findMany({ include: { procedures: { include: { standardProcedure: true } } } });
    compareSets('integration_categories', icDb.map((c) => `${c.name}|${c.exampleTools}|${c.evidenceProvided}|${c.procedures.map((p) => p.standardProcedure.code).sort().join(';')}`), cat.integrationCategories.map((c) => `${c.name}|${c.exampleTools}|${c.evidenceProvided}|${[...c.procedureCodes].sort().join(';')}`));
    const iccDb = await prisma.integrationCategoryControl.findMany({ include: { integrationCategory: true, control: true } });
    compareSets('integration_category_controls', iccDb.map((r) => `${r.integrationCategory.name}#${r.control.code}`), cat.integrationCategoryControls.map((r) => `${r.categoryName}#${r.controlCode}`));
    const mapDb = await prisma.controlFrameworkMapping.findMany({ include: { control: true } });
    compareSets('control_framework_mappings', mapDb.map((m) => `${m.control.code}|${m.frameworkCode}|${m.requirementRef}|${m.relationType}|${m.justification}`), cat.controlFrameworkMappings.map((m) => `${m.controlCode}|${m.frameworkCode}|${m.requirementRef}|${m.relationType}|${m.justification}`));
    const riskDb = await prisma.risk.findMany({ where: COMMITTEE });
    const rk = (r: { code: string; name: string; description: string; crit: string; impact: unknown; l: number | null; i: number | null; v: number | null; lvl: string | null }) => `${r.code}|${r.name}|${r.description}|${r.crit}|${JSON.stringify(r.impact)}|${r.l}|${r.i}|${r.v}|${r.lvl}`;
    compareSets('risks', riskDb.map((r) => rk({ code: r.code, name: r.name, description: r.description, crit: r.trustCriterion, impact: r.potentialImpact, l: r.likelihood, i: r.impact, v: r.inherentRiskValue, lvl: r.inherentRiskLevel })), cat.risks.map((r) => rk({ code: r.code, name: r.name, description: r.description, crit: r.trustCriterion, impact: r.potentialImpact, l: r.likelihood, i: r.impact, v: r.inherentRiskValue, lvl: r.inherentRiskLevel })));
    const causeDb = await prisma.cause.findMany({ where: COMMITTEE });
    compareSets('causes', causeDb.map((c) => `${c.code}|${c.causeOrigin}|${c.causeType}|${c.description}`), cat.causes.map((c) => `${c.code}|${c.causeOrigin}|${c.causeType}|${c.description}`));
    check(causeDb.every((c) => c.name === null && c.failureCategory === null), 'causes.name y failure_category son nulos', 'hay causas con nombre o categoría de falla');
    const rcDb = await prisma.riskCause.findMany({ where: { risk: COMMITTEE, cause: COMMITTEE }, include: { risk: true, cause: true } });
    compareSets('risk_causes', rcDb.map((r) => `${r.risk.code}#${r.cause.code}`), cat.riskCauses.map((r) => `${r.riskCode}#${r.causeCode}`));
    const ccDb = await prisma.causeControl.findMany({ where: { cause: COMMITTEE, control: COMMITTEE }, include: { cause: true, control: true } });
    compareSets('cause_controls', ccDb.map((r) => `${r.cause.code}#${r.control.code}`), cat.causeControls.map((r) => `${r.causeCode}#${r.controlCode}`));
    const testDb = await prisma.test.findMany({ where: COMMITTEE, include: { control: true, standardProcedure: true, integrationCategory: true } });
    const tf = (t: Record<string, unknown>) => Object.values(t).join('|');
    compareSets(
      'tests',
      testDb.map((t) => tf({ c: t.code, ctrl: t.control?.code ?? null, ty: t.type, d: t.dimension, o: t.objective, w: t.whyItMatters, s: t.primarySource, p: t.standardProcedure?.code, st: t.stepByStep, ci: t.correctIf, ei: t.exceptionIf, oi: t.observationIf, ev: t.evidenceToRetain, l: t.level, f: t.frequencySample, ic: t.integrationCategory?.name ?? null, a: t.automation, dn: t.displayName, dr: t.displayNameReviewed, dd: t.displayDescription, en: t.displayNameEn })),
      cat.tests.map((t) => tf({ c: t.code, ctrl: t.controlCode, ty: t.type, d: t.dimension, o: t.objective, w: t.whyItMatters, s: t.primarySource, p: t.standardProcedureCode, st: t.stepByStep, ci: t.correctIf, ei: t.exceptionIf, oi: t.observationIf, ev: t.evidenceToRetain, l: t.level, f: t.frequencySample, ic: t.integrationCategoryName, a: t.automation, dn: t.displayName, dr: t.displayNameReviewed, dd: t.displayDescription, en: t.displayNameEn })),
    );
    const tcks = await prisma.testCheck.findMany({ include: { test: true, check: true, ownerControl: true } });
    const tl = (t: { test: string; role: string; platform: string | null; policy: string | null; check: string | null; module: string | null; objective: string | null; owner: string | null; when: string | null; prov: string }) =>
      [t.test, t.role, t.platform, t.policy, t.check, t.module, t.objective, t.owner, t.when, t.prov].join('|');
    compareSets(
      'test_checks',
      tcks.map((t) => tl({ test: t.test.code, role: t.role, platform: t.check?.platform ?? null, policy: t.check?.policyId ?? null, check: t.check?.checkId ?? null, module: t.moduleRef, objective: t.commonObjective, owner: t.ownerControl?.code ?? null, when: t.appliesWhen, prov: t.provenance })),
      cat.testChecks.map((t) => tl({ test: t.testCode, role: t.role, platform: t.platform, policy: t.policyId, check: t.checkId, module: t.moduleRef, objective: t.commonObjective, owner: t.ownerControlCode, when: t.appliesWhen, prov: 'committee_ratified' })),
    );
    check(tcks.every((t) => t.provenance === 'committee_ratified' && t.confidence === null && t.rationale === null), 'todos los vínculos son committee_ratified, sin confianza ni motivo calculados (DEV-12)', 'hay vínculos que no son committee_ratified');

    // ---- 3. Puentes con el código v1 ----
    console.log('\n3. Puentes con el código v1');
    const ctDb = await prisma.controlTest.findMany({ where: { control: COMMITTEE, test: COMMITTEE }, include: { control: true, test: true } });
    compareSets('control_tests', ctDb.map((r) => `${r.control.code}#${r.test.code}`), cat.controlTests.map((r) => `${r.controlCode}#${r.testCode}`));
    const own = testDb.filter((t) => t.control).length;
    const viaDocs = new Set(cdDb.flatMap((r) => (docDb.find((d) => d.id === r.documentId)?.test ? [`${r.control.code}#${docDb.find((d) => d.id === r.documentId)!.test!.code}`] : [])));
    check(own + viaDocs.size === ctDb.length, `control_tests = ${own} por tests.control_id + ${viaDocs.size} T-DOC por control_documents`, `control_tests (${ctDb.length}) ≠ ${own} + ${viaDocs.size}`);
    const ctype = new Map(ctrlDb.map((k) => [k.id, k.type]));
    const wantType = { manual: 'manual', automated: 'automated', it_dependent_manual: 'hybrid' } as Record<string, string>;
    const badDim = dimDb.filter((r) => r.type !== wantType[ctype.get(r.controlId) ?? ''] || r.requiresProbe || r.requiresAi || r.requiresComplianceConfirmation || r.reasonNotApplicable !== null);
    check(badDim.length === 0, 'control_dimensions.type sale del tipo del control (manual→manual, automated→automated, it_dependent_manual→hybrid) y sin banderas', `${badDim.length} dimensiones con tipo o banderas distintos`);

    // ---- 4. Integridad relacional ----
    console.log('\n4. Integridad relacional');
    const orphanSql = async (what: string, sql: string) => {
      const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>(`select count(*)::bigint as n from (${sql}) x`);
      check(Number(rows[0].n) === 0, what, `${what.replace(/^(todo|toda|cada)/, 'incumple:')} → ${rows[0].n} filas`);
    };
    // FKs: ninguna fila apunta a algo que no existe (las claves foráneas lo impiden; se comprueba por si alguna se retiró).
    await orphanSql('ninguna FK colgada en las tablas del catálogo v2', `
      select 1 from catalog.control_requirements r left join catalog.controls c on c.id = r.control_id where c.id is null
      union all select 1 from catalog.control_requirement_tests r left join catalog.tests t on t.id = r.test_id where t.id is null
      union all select 1 from catalog.control_requirement_tests r left join catalog.control_requirements q on q.id = r.control_requirement_id where q.id is null
      union all select 1 from catalog.control_requirement_documents r left join catalog.documents d on d.id = r.document_id where d.id is null
      union all select 1 from catalog.control_documents r left join catalog.documents d on d.id = r.document_id where d.id is null
      union all select 1 from catalog.control_documents r left join catalog.controls c on c.id = r.control_id where c.id is null
      union all select 1 from catalog.test_checks r left join catalog.tests t on t.id = r.test_id where t.id is null
      union all select 1 from catalog.test_checks r where r.check_id is not null and not exists (select 1 from catalog.checks c where c.id = r.check_id)
      union all select 1 from catalog.test_checks r where r.owner_control_id is not null and not exists (select 1 from catalog.controls c where c.id = r.owner_control_id)
      union all select 1 from catalog.tests t where t.control_id is not null and not exists (select 1 from catalog.controls c where c.id = t.control_id)
      union all select 1 from catalog.documents d where d.test_id is not null and not exists (select 1 from catalog.tests t where t.id = d.test_id)
      union all select 1 from catalog.integration_category_procedures r where not exists (select 1 from catalog.integration_categories c where c.id = r.integration_category_id) or not exists (select 1 from catalog.standard_procedures p where p.id = r.standard_procedure_id)
      union all select 1 from catalog.integration_category_controls r left join catalog.integration_categories c on c.id = r.integration_category_id where c.id is null
      union all select 1 from catalog.control_framework_mappings m left join catalog.controls c on c.id = m.control_id where c.id is null`);
    await orphanSql('cada test_check trae un check o un module_ref (nunca los dos ni ninguno)', `select 1 from catalog.test_checks where (check_id is null) = (module_ref is null)`);
    await orphanSql('cada prueba tiene un control o un documento (IN-05)', `select 1 from catalog.tests t where t.control_id is null and not exists (select 1 from catalog.documents d where d.test_id = t.id)`);
    await orphanSql('ninguna prueba tiene control y documento a la vez', `select 1 from catalog.tests t where t.control_id is not null and exists (select 1 from catalog.documents d where d.test_id = t.id)`);
    await orphanSql('cada documento tiene su T-DOC, y es documental y sin control (IN-05)', `select 1 from catalog.documents d left join catalog.tests t on t.id = d.test_id where t.id is null or t.control_id is not null or t.type <> 'documentary'`);
    await orphanSql('cada documento sustenta al menos un control', `select 1 from catalog.documents d where not exists (select 1 from catalog.control_documents c where c.document_id = d.id)`);
    await orphanSql('cada punto de enfoque tiene al menos un control (IN-01)', `select 1 from catalog.points_of_focus p where not exists (select 1 from catalog.point_of_focus_controls c where c.point_of_focus_id = p.id)`);
    await orphanSql('cada control tiene al menos una causa (IN-02)', `select 1 from catalog.controls k where k.origin = 'committee' and not exists (select 1 from catalog.cause_controls c where c.control_id = k.id)`);
    await orphanSql('cada riesgo y cada causa tienen su vínculo (IN-02, IN-03)', `
      select 1 from catalog.risks r where r.origin = 'committee' and not exists (select 1 from catalog.risk_causes c where c.risk_id = r.id)
      union all select 1 from catalog.causes c where c.origin = 'committee' and (not exists (select 1 from catalog.risk_causes x where x.cause_id = c.id) or not exists (select 1 from catalog.cause_controls x where x.cause_id = c.id))`);
    await orphanSql('cada requisito del control tiene al menos un test (IN-04) y cada prueba está en algún requisito', `
      select 1 from catalog.control_requirements r where not exists (select 1 from catalog.control_requirement_tests t where t.control_requirement_id = r.id)
      union all select 1 from catalog.tests t where t.origin = 'committee' and not exists (select 1 from catalog.control_requirement_tests x where x.test_id = t.id)`);
    await orphanSql('cada control tiene su dimensión documental y todas las de sus pruebas', `
      select 1 from catalog.controls k where k.origin = 'committee' and not exists (select 1 from catalog.control_dimensions d where d.control_id = k.id and d.dimension = 'policy')
      union all select 1 from catalog.tests t where t.control_id is not null and t.dimension <> 'process' and not exists (select 1 from catalog.control_dimensions d where d.control_id = t.control_id and d.dimension = t.dimension)`);
    await orphanSql('cada Dependencia tiene control dueño donde el check es Directo (IN-06)', `
      select 1 from catalog.test_checks d where d.role = 'dependency' and (d.owner_control_id is null or not exists (
        select 1 from catalog.test_checks o join catalog.tests ot on ot.id = o.test_id
        where o.role = 'direct' and ot.control_id = d.owner_control_id and ((d.check_id is not null and o.check_id = d.check_id) or (d.check_id is null and o.check_id is null and o.module_ref = d.module_ref))))`);
    await orphanSql('cada control tiene tipo, periodicidad y rol sugerido (IN-09)', `select 1 from catalog.controls k where k.origin = 'committee' and (k.type is null or k.periodicity is null or coalesce(k.suggested_owner_role, '') = '')`);
    await orphanSql('cada documento tiene rol responsable, origen y aceptación; el interno, aprobador (IN-10)', `select 1 from catalog.documents d where coalesce(d.suggested_owner_role, '') = '' or (d.origin = 'internal' and coalesce(d.suggested_approver_role, '') = '')`);
    const ownerless = ctrlDb.filter((k) => !relDb.some((r) => r.controlId === k.id));
    check(ownerless.length === 0, 'todo control cuelga de algún punto de enfoque', `controles sin punto de enfoque: ${ownerless.map((k) => k.code).join(', ')}`);
    const dom = new Set(relDb.map((r) => r.domain));
    check(dom.size === 25, '25 dominios literales en las filas control + punto de enfoque', `dominios: ${dom.size}`);

    // ---- 5. Los catálogos de checks, por plataforma y por política ----
    console.log('\n5. Checks de la sonda y del motor de nube, por plataforma y por política');
    check(sonda.meta.sourceSha256 === cat.meta.sourceSha256 && [...cloud.values()].every((d) => d.sourceSha256 === cat.meta.sourceSha256), 'los catálogos de checks y el catálogo v2 salen del mismo libro (sha256)', 'los catálogos de checks y el catálogo v2 salen de libros distintos');
    type Row = { platform: string; policy_id: string; checks: bigint; mappings: bigint; direct: bigint; complementary: bigint; dependency: bigint; unlinked_policy: bigint };
    const stat = await prisma.$queryRaw<Row[]>`
      select c.platform, c.policy_id,
        count(*)::bigint as checks,
        coalesce(sum((select count(*) from catalog.check_mappings m where m.check_id = c.id)), 0)::bigint as mappings,
        coalesce(sum((select count(*) from catalog.test_checks t where t.check_id = c.id and t.role = 'direct')), 0)::bigint as direct,
        coalesce(sum((select count(*) from catalog.test_checks t where t.check_id = c.id and t.role = 'complementary')), 0)::bigint as complementary,
        coalesce(sum((select count(*) from catalog.test_checks t where t.check_id = c.id and t.role = 'dependency')), 0)::bigint as dependency,
        count(*) filter (where c.sca_policy_id is null and c.policy_id <> 'cloud_configuration')::bigint as unlinked_policy
      from catalog.checks c group by c.platform, c.policy_id`;
    const byKey = new Map(stat.map((r) => [`${r.platform}|${r.policy_id}`, r]));
    const wantLinks = new Map<string, { direct: number; complementary: number; dependency: number }>();
    for (const t of cat.testChecks) {
      if (t.checkId === null) continue;
      const k = `${t.platform}|${t.policyId}`;
      const cur = wantLinks.get(k) ?? { direct: 0, complementary: 0, dependency: 0 };
      cur[t.role]++;
      wantLinks.set(k, cur);
    }
    const problems: string[] = [];
    const cloudRows: [string, number, number, number, number, number][] = [];
    for (const [platform, ds] of cloud) {
      const r = byKey.get(`${platform}|cloud_configuration`);
      const links = wantLinks.get(`${platform}|cloud_configuration`) ?? { direct: 0, complementary: 0, dependency: 0 };
      if (!r || Number(r.checks) !== ds.checks.length) problems.push(`${platform}: ${r ? r.checks : 0} checks en la base, ${ds.checks.length} en la fuente`);
      if (r && Number(r.mappings) !== ds.mappings.length) problems.push(`${platform}: ${r.mappings} mapeos en la base, ${ds.mappings.length} en la fuente`);
      if (r && (Number(r.direct) !== links.direct || Number(r.complementary) !== links.complementary || Number(r.dependency) !== links.dependency)) problems.push(`${platform}: vínculos ${r.direct}/${r.complementary}/${r.dependency} en la base, ${links.direct}/${links.complementary}/${links.dependency} en la fuente`);
      cloudRows.push([platform, Number(r?.checks ?? 0), Number(r?.direct ?? 0), Number(r?.complementary ?? 0), Number(r?.dependency ?? 0), Number(r?.mappings ?? 0)]);
    }
    const scaPolicies = await prisma.scaPolicy.findMany();
    const scaIds = new Map(scaPolicies.map((p) => [p.scaId, p]));
    const platformOfPolicy = new Map(sonda.policies.map((p) => [p.scaId, p.platformLabel]));
    const sondaByPlatform = new Map<string, { policies: number; checks: number; direct: number; complementary: number; dependency: number; mappings: number }>();
    const policyRows: string[] = [];
    for (const p of sonda.policies) {
      const sp = scaIds.get(p.scaId);
      const r = byKey.get(`${p.platform}|${p.scaId}`);
      if (!sp) problems.push(`política ${p.scaId}: falta en sca_policies`);
      else if (sp.checkCount !== p.checkCount) problems.push(`política ${p.scaId}: check_count ${sp.checkCount} ≠ ${p.checkCount}`);
      if (!r || Number(r.checks) !== p.checkCount) problems.push(`política ${p.scaId}: ${r ? r.checks : 0} checks en la base, ${p.checkCount} en la fuente`);
      if (r && Number(r.unlinked_policy) > 0) problems.push(`política ${p.scaId}: ${r.unlinked_policy} checks sin sca_policy_id`);
      const srcMaps = sonda.mappings.filter((m) => m.policyId === p.scaId).length;
      if (r && Number(r.mappings) !== srcMaps) problems.push(`política ${p.scaId}: ${r.mappings} mapeos en la base, ${srcMaps} en la fuente`);
      const links = wantLinks.get(`${p.platform}|${p.scaId}`) ?? { direct: 0, complementary: 0, dependency: 0 };
      if (r && (Number(r.direct) !== links.direct || Number(r.complementary) !== links.complementary || Number(r.dependency) !== links.dependency)) problems.push(`política ${p.scaId}: vínculos distintos a la fuente`);
      const agg = sondaByPlatform.get(p.platformLabel) ?? { policies: 0, checks: 0, direct: 0, complementary: 0, dependency: 0, mappings: 0 };
      agg.policies++;
      agg.checks += Number(r?.checks ?? 0);
      agg.direct += Number(r?.direct ?? 0);
      agg.complementary += Number(r?.complementary ?? 0);
      agg.dependency += Number(r?.dependency ?? 0);
      agg.mappings += Number(r?.mappings ?? 0);
      sondaByPlatform.set(p.platformLabel, agg);
      policyRows.push(`    ${pad(p.scaId, 34)} ${pad(p.platformLabel, 22)} ${num(Number(r?.checks ?? 0), 5)} ${num(Number(r?.direct ?? 0), 5)} ${num(Number(r?.complementary ?? 0), 5)} ${num(Number(r?.dependency ?? 0), 5)} ${num(Number(r?.mappings ?? 0), 6)}`);
    }
    const extraPolicies = scaPolicies.filter((p) => !platformOfPolicy.has(p.scaId)).map((p) => p.scaId);
    if (extraPolicies.length) problems.push(`sca_policies que no están en la fuente: ${extraPolicies.join(', ')}`);
    const knownKeys = new Set([...cloud.keys()].map((p) => `${p}|cloud_configuration`).concat(sonda.policies.map((p) => `${p.platform}|${p.scaId}`)));
    for (const k of byKey.keys()) if (!knownKeys.has(k)) problems.push(`checks de ${k} en la base que ninguna fuente trae`);
    const totalLinked = stat.reduce((s, r) => s + Number(r.direct) + Number(r.complementary) + Number(r.dependency), 0);
    check(totalLinked === EXPECTED_COUNTS.testChecks - EXPECTED_DETAIL.moduleLinks, `los ${totalLinked} vínculos con check caen en una plataforma o política conocida: 0 huérfanos`, `vínculos con check por plataforma: ${totalLinked}`);
    check(scaPolicies.length === sonda.policies.length, `sca_policies = ${sonda.policies.length}`, `sca_policies: ${scaPolicies.length} ≠ ${sonda.policies.length}`);
    check(problems.length === 0, 'cada check cruza con su plataforma o su sca_policy, con sus mapeos y vínculos idénticos a la fuente', `${problems.length} diferencia(s) por plataforma o política`);
    problems.slice(0, 20).forEach((p) => console.error('      ' + p));
    // Lo que el código vivo pide por clave (scan.prisma.repository: platform + 'cloud_configuration'; la sonda por sca_id): nada que pida puede faltar.
    for (const platform of ['aws', 'gcp']) {
      const ds: CloudDataset | undefined = cloud.get(platform);
      const have = await prisma.check.count({ where: { platform, policyId: 'cloud_configuration' } });
      check(!!ds && have === ds.checks.length, `${platform}: los ${have} checks que el trabajador pide existen con la clave (${platform}, cloud_configuration, check)`, `${platform}: ${have} checks en la base, ${ds?.checks.length} en la fuente`);
    }
    console.log('\n  motor de nube          checks  directo  compl.  depend.  mapeos');
    cloudRows.forEach(([p, c, d, co, de, m]) => console.log(`    ${pad(p, 20)} ${num(c, 6)} ${num(d, 8)} ${num(co, 7)} ${num(de, 8)} ${num(m, 7)}`));
    console.log('\n  sonda (por plataforma) políticas  checks  directo  compl.  depend.  mapeos');
    for (const [label, a] of [...sondaByPlatform].sort()) console.log(`    ${pad(label, 22)} ${num(a.policies, 6)} ${num(a.checks, 8)} ${num(a.direct, 8)} ${num(a.complementary, 7)} ${num(a.dependency, 8)} ${num(a.mappings, 7)}`);
    if (detail) {
      console.log('\n    política                           plataforma             checks  dir.  comp.  dep.  mapeos');
      policyRows.forEach((r) => console.log(r));
    }

    // ---- 6. Marca blanca (SEG-39) ----
    console.log('\n6. Marca blanca');
    const named = testDb.filter((t) => namesProvider(t.displayName ?? '') || namesProvider(t.displayDescription ?? '') || namesProvider(t.displayNameEn ?? '')).map((t) => t.code);
    check(named.length === 0, 'ningún nombre ni descripción que ve el cliente nombra al proveedor', `nombran al proveedor: ${named.slice(0, 8).join(', ')}`);
    check(testDb.every((t) => !!t.displayName?.trim() && !!t.displayDescription?.trim() && t.displayNameReviewed === false && t.displayNameEn === null), 'toda prueba tiene nombre y descripción, sin revisar y sin inglés (P50)', 'hay pruebas sin nombre o con nombre revisado/inglés');

    // ---- 7. RLS con el rol de la app (D31) ----
    console.log('\n7. RLS con el rol de la app (D31)');
    const appUrl = process.env.APP_DATABASE_URL;
    if (!appUrl) {
      console.log('  · APP_DATABASE_URL no definida: se omite esta comprobación');
    } else {
      const client = new Client({ connectionString: appUrl });
      await client.connect();
      try {
        const who = (await client.query('select current_user')).rows[0].current_user;
        check(who === 'monkey_app', `conectado como ${who}`, `se esperaba monkey_app y es ${who}`);
        const rd = async (tbl: string) => Number((await client.query(`select count(*) from catalog.${tbl}`)).rows[0].count);
        for (const [tbl, want] of [['controls', EXPECTED_COUNTS.controls], ['tests', EXPECTED_COUNTS.tests], ['documents', EXPECTED_COUNTS.documents], ['control_requirements', EXPECTED_COUNTS.controlRequirements], ['test_checks', EXPECTED_COUNTS.testChecks]] as [string, number][]) {
          const got = await rd(tbl);
          check(got === want, `la app lee las ${got} filas de ${tbl}`, `la app lee ${got} filas de ${tbl}, se esperaban ${want}`);
        }
        for (const [tbl, ins] of [
          ['frameworks', `insert into catalog.frameworks(id,code,name,version,type,scope_description) values (gen_random_uuid(),'x','x','x','standard','x')`],
          ['documents', `insert into catalog.documents(id,code,type,name,origin,suggested_acceptance) values (gen_random_uuid(),'X','policy','x','internal','not_required')`],
          ['standard_procedures', `insert into catalog.standard_procedures(id,code,name) values (gen_random_uuid(),'X','x')`],
        ]) {
          await client.query('begin');
          try {
            await client.query(ins);
            bad(`la app PUDO insertar en catalog.${tbl}: el RLS de escritura no funciona`);
          } catch (e: unknown) {
            const code = (e as { code?: string }).code;
            check(code === '42501', `la app NO puede escribir en catalog.${tbl} (RLS 42501)`, `el insert en ${tbl} falló por otra razón: ${String(e)}`);
          } finally {
            await client.query('rollback');
          }
        }
      } finally {
        await client.end();
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(failed ? `\n✗ ${failed} comprobación(es) fallaron.` : '\n✓ El catálogo en la base coincide con la fuente.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
