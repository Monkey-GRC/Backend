// Verificación posterior a la carga. SOLO LECTURA. Sale con código 1 si algo no cuadra.
//
//   npm run catalog:verify
//
// (a) conteos, (b) comparación fila a fila BD ↔ JSON por hash, (c) reglas estructurales sobre la BD y
// (d) con el rol de la app (APP_DATABASE_URL): lee todo el catálogo y NO puede escribir (RLS, D31).
import { createHash } from 'node:crypto';
import { Client } from 'pg';
import { connectAsOwner, readCatalogJson, short } from './soc2/db';
import { PROVIDER_PATTERN, displayDescriptionOf, displayNameOf } from './soc2/display-names';
import { EXPECTED_CAUSES_WITHOUT_RISK, PREFIX_TO_CRITERION } from './soc2/types';
import { validateCatalog } from './soc2/validate';

let failed = 0;
const ok = (m: string) => console.log(`  ✓ ${m}`);
const bad = (m: string) => {
  failed++;
  console.error(`  ✗ ${m}`);
};
const check = (cond: boolean, pass: string, fail: string) => (cond ? ok(pass) : bad(fail));

const digest = (lines: string[]) => createHash('sha256').update([...lines].sort().join('\n')).digest('hex').slice(0, 16);

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

async function main() {
  const cat = readCatalogJson();
  const invalid = validateCatalog(cat);
  if (invalid.length) {
    invalid.forEach((m) => bad(`JSON: ${m}`));
    process.exit(1);
  }

  const { prisma, target } = await connectAsOwner();
  try {
    console.log(`Verificando ${target.user}@${target.host}:${target.port}/${target.database}\n`);

    const fw = await prisma.framework.findFirst({ where: { code: cat.framework.code, version: cat.framework.version } });
    console.log('1. Conteos');
    check(!!fw, 'framework soc2 existe', 'falta el framework soc2');
    if (!fw) process.exit(1);
    const c = cat.meta.counts;
    const count = {
      tc: await prisma.trustCriterion.count(),
      req: await prisma.requirement.count({ where: { frameworkId: fw.id } }),
      pof: await prisma.pointOfFocus.count({ where: { requirement: { frameworkId: fw.id } } }),
      ctrl: await prisma.control.count(),
      rel: await prisma.pointOfFocusControl.count({ where: { pointOfFocus: { requirement: { frameworkId: fw.id } } } }),
      ver: await prisma.catalogVersion.count(),
      relations: await prisma.requirementRelation.count(),
    };
    check(count.tc === c.trustCriteria, `trust_criteria = ${c.trustCriteria}`, `trust_criteria: ${count.tc} ≠ ${c.trustCriteria}`);
    check(count.req === c.requirements, `requirements = ${c.requirements}`, `requirements: ${count.req} ≠ ${c.requirements}`);
    check(count.pof === c.pointsOfFocus, `points_of_focus = ${c.pointsOfFocus}`, `points_of_focus: ${count.pof} ≠ ${c.pointsOfFocus}`);
    check(count.ctrl === c.controls, `controls = ${c.controls}`, `controls: ${count.ctrl} ≠ ${c.controls}`);
    check(count.rel === c.pointOfFocusControls, `point_of_focus_controls = ${c.pointOfFocusControls}`, `point_of_focus_controls: ${count.rel} ≠ ${c.pointOfFocusControls}`);
    check(count.ver >= 1, `catalog_versions = ${count.ver} (v1 publicada sin publicador humano)`, 'no hay ninguna fila en catalog_versions');
    ok(`requirement_relations = ${count.relations} (las hojas no traen fuente: queda vacía)`);
    const n = {
      risks: await prisma.risk.count(), causes: await prisma.cause.count(), riskCauses: await prisma.riskCause.count(), causeControls: await prisma.causeControl.count(),
      tests: await prisma.test.count(), controlTests: await prisma.controlTest.count(),
      tpl: await prisma.evidenceTemplate.count(), cet: await prisma.controlEvidenceTemplate.count(),
      pol: await prisma.policy.count(), cpol: await prisma.controlPolicy.count(), dim: await prisma.controlDimensionEntry.count(),
    };
    check(n.risks === c.risks, `risks = ${c.risks}`, `risks: ${n.risks} ≠ ${c.risks}`);
    check(n.causes === c.causes, `causes = ${c.causes}`, `causes: ${n.causes} ≠ ${c.causes}`);
    check(n.riskCauses === c.riskCauses, `risk_causes = ${c.riskCauses}`, `risk_causes: ${n.riskCauses} ≠ ${c.riskCauses}`);
    check(n.causeControls === c.causeControls, `cause_controls = ${c.causeControls}`, `cause_controls: ${n.causeControls} ≠ ${c.causeControls}`);
    check(n.tests === c.tests, `tests = ${c.tests}`, `tests: ${n.tests} ≠ ${c.tests}`);
    check(n.controlTests === c.controlTests, `control_tests = ${c.controlTests}`, `control_tests: ${n.controlTests} ≠ ${c.controlTests}`);
    check(n.tpl === c.evidenceTemplates, `evidence_templates = ${c.evidenceTemplates}`, `evidence_templates: ${n.tpl} ≠ ${c.evidenceTemplates}`);
    check(n.cet === c.controlEvidenceTemplates, `control_evidence_templates = ${c.controlEvidenceTemplates}`, `control_evidence_templates: ${n.cet} ≠ ${c.controlEvidenceTemplates}`);
    check(n.pol === c.policies, `policies = ${c.policies}`, `policies: ${n.pol} ≠ ${c.policies}`);
    check(n.cpol === c.controlPolicies, `control_policies = ${c.controlPolicies}`, `control_policies: ${n.cpol} ≠ ${c.controlPolicies}`);
    check(n.dim === c.controlDimensions, `control_dimensions = ${c.controlDimensions}`, `control_dimensions: ${n.dim} ≠ ${c.controlDimensions}`);

    console.log('\n2. Comparación fila a fila BD ↔ fuente');
    const tcDb = await prisma.trustCriterion.findMany();
    compareSets('trust_criteria', tcDb.map((t) => `${t.criterion}|${t.isMandatory}`), cat.trustCriteria.map((t) => `${t.criterion}|${t.isMandatory}`));
    const reqDb = await prisma.requirement.findMany({ where: { frameworkId: fw.id }, include: { trustCriterion: true } });
    compareSets('requirements', reqDb.map((r) => `${r.code}|${r.tscCategory}|${r.criterion}|${r.trustCriterion.criterion}`), cat.requirements.map((r) => `${r.code}|${r.tscCategory}|${r.criterion}|${r.trustCriterion}`));
    const pofDb = await prisma.pointOfFocus.findMany({ where: { requirement: { frameworkId: fw.id } }, include: { requirement: true } });
    compareSets('points_of_focus', pofDb.map((p) => `${p.requirement.code}#${p.number}|${p.description}`), cat.pointsOfFocus.map((p) => `${p.requirementCode}#${p.number}|${p.description}`));
    const ctrlDb = await prisma.control.findMany();
    compareSets('controls', ctrlDb.map((k) => `${k.code}|${k.name}|${k.description}|${k.domain}|${k.sourceRef}`), cat.controls.map((k) => `${k.code}|${k.name}|${k.description}|${k.domain}|${k.sourceRef}`));
    const relDb = await prisma.pointOfFocusControl.findMany({ where: { pointOfFocus: { requirement: { frameworkId: fw.id } } }, include: { pointOfFocus: { include: { requirement: true } }, control: true } });
    compareSets('point_of_focus_controls', relDb.map((r) => `${r.pointOfFocus.requirement.code}#${r.pointOfFocus.number}#${r.control.code}`), cat.pointOfFocusControls.map((r) => `${r.requirementCode}#${r.pointNumber}#${r.controlCode}`));

    const riskDb = await prisma.risk.findMany();
    compareSets('risks', riskDb.map((r) => `${r.code}|${r.name}|${r.description}|${r.trustCriterion}|${JSON.stringify(r.potentialImpact)}|${r.isActive}`), cat.risks.map((r) => `${r.code}|${r.name}|${r.description}|${r.trustCriterion}|${JSON.stringify(r.potentialImpact)}|${r.isActive}`));
    const causeDb = await prisma.cause.findMany();
    compareSets('causes', causeDb.map((k) => `${k.code}|${k.name}|${k.failureCategory}|${k.description}`), cat.causes.map((k) => `${k.code}|${k.name}|${k.failureCategory}|${k.description}`));
    const rcDb = await prisma.riskCause.findMany({ include: { risk: true, cause: true } });
    compareSets('risk_causes', rcDb.map((r) => `${r.code}|${r.risk.code}|${r.cause.code}`), cat.riskCauses.map((r) => `${r.code}|${r.riskCode}|${r.causeCode}`));
    const ccDb = await prisma.causeControl.findMany({ include: { cause: true, control: true } });
    compareSets('cause_controls', ccDb.map((r) => `${r.cause.code}#${r.control.code}`), cat.causeControls.map((r) => `${r.causeCode}#${r.controlCode}`));
    const testDb = await prisma.test.findMany();
    const tf = (x: { code: string; dimension: string; name: string; objective: string; type: string; tool: string; population: string; period: string; populationSize: string; suggestedSampleSize: string; selectionMethod: string; evidenceToRequest: string; prerequisites: string; stepByStep: unknown; attributesToValidate: unknown; complianceCriterion: string; exceptions: string; exceptionsHandling: string; evidenceToRetain: string; automatedCoverage: string; complementaryManualValidation: string; limitations: string }) =>
      [x.code, x.dimension, x.name, x.objective, x.type, x.tool, x.population, x.period, x.populationSize, x.suggestedSampleSize, x.selectionMethod, x.evidenceToRequest, x.prerequisites, JSON.stringify(x.stepByStep), JSON.stringify(x.attributesToValidate), x.complianceCriterion, x.exceptions, x.exceptionsHandling, x.evidenceToRetain, x.automatedCoverage, x.complementaryManualValidation, x.limitations].join('|');
    compareSets('tests', testDb.map(tf), cat.tests.map(tf));
    const ctDb = await prisma.controlTest.findMany({ include: { control: true, test: true } });
    compareSets('control_tests', ctDb.map((r) => `${r.control.code}#${r.test.code}`), cat.controlTests.map((r) => `${r.controlCode}#${r.testCode}`));
    const tplDb = await prisma.evidenceTemplate.findMany();
    compareSets('evidence_templates', tplDb.map((t) => `${t.code}|${t.description}|${t.dimension}`), cat.evidenceTemplates.map((t) => `${t.code}|${t.description}|${t.dimension}`));
    const cetDb = await prisma.controlEvidenceTemplate.findMany({ include: { control: true, evidenceTemplate: true } });
    compareSets('control_evidence_templates', cetDb.map((r) => `${r.control.code}#${r.evidenceTemplate.code}#${r.sequence}`), cat.controlEvidenceTemplates.map((r) => `${r.controlCode}#${r.templateCode}#${r.sequence}`));
    const polDb = await prisma.policy.findMany();
    compareSets('policies', polDb.map((p) => p.name), cat.policies.map((p) => p.name));
    const cpolDb = await prisma.controlPolicy.findMany({ include: { control: true, policy: true } });
    compareSets('control_policies', cpolDb.map((r) => `${r.control.code}#${r.policy.name}#${r.requiresEmployeeAcceptance}`), cat.controlPolicies.map((r) => `${r.controlCode}#${r.policyName}#${r.requiresEmployeeAcceptance}`));
    const dimDb = await prisma.controlDimensionEntry.findMany({ include: { control: true } });
    const df = (code: string, d: string, t: string, a: boolean, b: boolean, g: boolean) => `${code}#${d}|${t}|${a}|${b}|${g}`;
    compareSets('control_dimensions', dimDb.map((r) => df(r.control.code, r.dimension, r.type, r.requiresProbe, r.requiresAi, r.requiresComplianceConfirmation)), cat.controlDimensions.map((r) => df(r.controlCode, r.dimension, r.type, r.requiresProbe, r.requiresAi, r.requiresComplianceConfirmation)));

    console.log('\n3. Reglas estructurales sobre la BD');
    const pofByReq = new Map<string, number[]>();
    pofDb.forEach((p) => pofByReq.set(p.requirement.code, [...(pofByReq.get(p.requirement.code) ?? []), p.number]));
    const noPof = reqDb.filter((r) => !pofByReq.has(r.code)).map((r) => r.code);
    check(noPof.length === 0, 'todo requisito tiene puntos de enfoque', `requisitos sin puntos de enfoque: ${noPof.join(', ')}`);
    const gaps = [...pofByReq].filter(([, ns]) => ns.slice().sort((a, b) => a - b).some((n, i) => n !== i + 1)).map(([r]) => r);
    check(gaps.length === 0, 'numeración de puntos de enfoque contigua desde 1', `numeración no contigua en: ${gaps.join(', ')}`);
    const pofWithCtrl = new Set(relDb.map((r) => r.pointOfFocusId));
    const pofNoCtrl = pofDb.filter((p) => !pofWithCtrl.has(p.id)).length;
    check(pofNoCtrl === 0, 'todo punto de enfoque tiene al menos un control', `${pofNoCtrl} puntos de enfoque sin control`);
    const withRel = new Set(relDb.map((r) => r.controlId));
    const unassigned = ctrlDb.filter((k) => !withRel.has(k.id)).map((k) => k.code).sort();
    check(JSON.stringify(unassigned) === '["CPL-1"]', 'el único control sin punto de enfoque es CPL-1 (Descripción del Sistema)', `controles sin punto de enfoque: ${unassigned.join(', ')}`);
    const wrongCrit = reqDb.filter((r) => PREFIX_TO_CRITERION[/^([A-Z]+)\d/.exec(r.code)![1]] !== r.trustCriterion.criterion).map((r) => r.code);
    check(wrongCrit.length === 0, 'criterio de confianza consistente con el prefijo en los 61 requisitos', `criterio inconsistente en: ${wrongCrit.join(', ')}`);
    const orphanReq = reqDb.filter((r) => !cat.requirements.some((s) => s.code === r.code)).length;
    check(orphanReq === 0, 'sin requisitos huérfanos (fuera de la fuente)', `${orphanReq} requisitos de la base no están en la fuente`);
    const secOnly = tcDb.filter((t) => t.isMandatory).map((t) => t.criterion);
    check(secOnly.length === 1 && secOnly[0] === 'security', 'solo security es obligatorio', `criterios obligatorios: ${secOnly.join(', ')}`);

    const withRisk = new Set(rcDb.map((r) => r.causeId));
    const causeNoRisk = causeDb.filter((k) => !withRisk.has(k.id)).map((k) => k.code).sort();
    check(JSON.stringify(causeNoRisk) === JSON.stringify([...EXPECTED_CAUSES_WITHOUT_RISK].sort()), `las ${causeNoRisk.length} causas sin riesgo son exactamente las que trae el comité`, `causas sin riesgo: ${causeNoRisk.join(', ')}`);
    const withCause = new Set(rcDb.map((r) => r.riskId));
    const riskNoCause = riskDb.filter((r) => !withCause.has(r.id)).length;
    check(riskNoCause === 0, 'todo riesgo tiene al menos una causa', `${riskNoCause} riesgos sin causa`);
    const causeWithCtrl = new Set(ccDb.map((r) => r.causeId));
    const causeNoCtrl = causeDb.filter((k) => !causeWithCtrl.has(k.id)).length;
    check(causeNoCtrl === 0, 'toda causa tiene al menos un control que la mitiga', `${causeNoCtrl} causas sin control`);
    const testWithCtrl = new Set(ctDb.map((r) => r.testId));
    const testNoCtrl = testDb.filter((x) => !testWithCtrl.has(x.id)).length;
    check(testNoCtrl === 0, 'toda prueba tiene al menos un control', `${testNoCtrl} pruebas sin control`);
    const ctrlWithTest = new Set(ctDb.map((r) => r.controlId));
    const ctrlNoTest = ctrlDb.filter((k) => !ctrlWithTest.has(k.id)).map((k) => k.code).sort();
    check(JSON.stringify(ctrlNoTest) === '["CPL-1"]', 'el único control sin prueba es CPL-1', `controles sin prueba: ${ctrlNoTest.join(', ')}`);
    // El nombre neutro que ve el cliente (D70): todas lo tienen, es el del catálogo y ninguno nombra al proveedor de la sonda.
    const srcTestByCode = new Map(cat.tests.map((t) => [t.code, t]));
    const noDisplayName = testDb.filter((x) => !x.displayName?.trim()).map((x) => x.code).sort();
    check(noDisplayName.length === 0, 'toda prueba tiene su nombre neutro (D70)', `${noDisplayName.length} pruebas sin nombre neutro: ${noDisplayName.slice(0, 8).join(', ')}${noDisplayName.length > 8 ? '…' : ''}`);
    const wrongDisplayName = testDb.filter((x) => { const s = srcTestByCode.get(x.code); return !!x.displayName && !!s && x.displayName !== displayNameOf(s); }).map((x) => x.code).sort();
    check(wrongDisplayName.length === 0, 'el nombre neutro de cada prueba es el que fija el catálogo', `nombre neutro distinto al del catálogo: ${wrongDisplayName.join(', ')}`);
    const providerInName = testDb.filter((x) => !!x.displayName && PROVIDER_PATTERN.test(x.displayName)).map((x) => x.code).sort();
    check(providerInName.length === 0, 'ningún nombre neutro nombra al proveedor de la sonda (SEG-39)', `nombran al proveedor: ${providerInName.join(', ')}`);
    // La descripción corta que ve el cliente (D82): misma regla que el nombre.
    const noDisplayDescription = testDb.filter((x) => !x.displayDescription?.trim()).map((x) => x.code).sort();
    check(noDisplayDescription.length === 0, 'toda prueba tiene su descripción corta (D82)', `${noDisplayDescription.length} pruebas sin descripción: ${noDisplayDescription.slice(0, 8).join(', ')}${noDisplayDescription.length > 8 ? '…' : ''}`);
    const wrongDisplayDescription = testDb.filter((x) => { const s = srcTestByCode.get(x.code); return !!x.displayDescription && !!s && x.displayDescription !== displayDescriptionOf(s); }).map((x) => x.code).sort();
    check(wrongDisplayDescription.length === 0, 'la descripción corta de cada prueba es la que fija el catálogo', `descripción distinta a la del catálogo: ${wrongDisplayDescription.join(', ')}`);
    const providerInDescription = testDb.filter((x) => !!x.displayDescription && PROVIDER_PATTERN.test(x.displayDescription)).map((x) => x.code).sort();
    check(providerInDescription.length === 0, 'ninguna descripción corta nombra al proveedor de la sonda (SEG-39)', `nombran al proveedor: ${providerInDescription.join(', ')}`);
    const tplWithCtrl = new Set(cetDb.map((r) => r.evidenceTemplateId));
    const tplNoCtrl = tplDb.filter((x) => !tplWithCtrl.has(x.id)).length;
    check(tplNoCtrl === 0, 'toda plantilla de evidencia está ligada a un control', `${tplNoCtrl} plantillas sin control`);
    const seqs = new Map<string, number[]>();
    cetDb.forEach((r) => seqs.set(r.control.code, [...(seqs.get(r.control.code) ?? []), r.sequence]));
    const badSeq = [...seqs].filter(([, s]) => s.slice().sort((a, b) => a - b).some((v, i) => v !== i + 1)).map(([k]) => k);
    check(badSeq.length === 0, 'secuencias de plantillas contiguas desde 1 en cada control', `secuencias no contiguas en: ${badSeq.join(', ')}`);
    const dimsOf = new Map<string, Set<string>>();
    dimDb.forEach((r) => dimsOf.set(r.control.code, (dimsOf.get(r.control.code) ?? new Set()).add(r.dimension)));
    const ctrlNoDim = ctrlDb.filter((k) => !dimsOf.has(k.code)).map((k) => k.code).sort();
    check(JSON.stringify(ctrlNoDim) === '["CPL-1"]', 'todo control tiene dimensiones salvo CPL-1', `controles sin dimensión: ${ctrlNoDim.join(', ')}`);
    check(!dimDb.some((r) => r.dimension === 'app'), 'ningún control declara la dimensión aplicación (0 pruebas T-APP, P9)', 'hay dimensiones de aplicación');
    check(dimDb.every((r) => r.reasonNotApplicable === null), 'las dimensiones del catálogo son todas aplicables (reason_not_applicable nulo)', 'hay dimensiones del catálogo con reason_not_applicable');
    const polWithCtrl = new Set(cpolDb.map((r) => r.policyId));
    check(polDb.every((p) => polWithCtrl.has(p.id)), 'toda política está ligada a un control', 'hay políticas sin control');

    console.log('\n4. RLS con el rol de la app (D31)');
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
        const nc = await rd('controls');
        check(nc === c.controls, `la app lee los ${nc} controles`, `la app lee ${nc} controles, se esperaban ${c.controls}`);
        const nt = await rd('tests');
        check(nt === c.tests, `la app lee las ${nt} pruebas`, `la app lee ${nt} pruebas, se esperaban ${c.tests}`);
        const ne = await rd('evidence_templates');
        check(ne === c.evidenceTemplates, `la app lee las ${ne} plantillas de evidencia`, `la app lee ${ne} plantillas, se esperaban ${c.evidenceTemplates}`);
        await client.query('begin');
        try {
          await client.query(`insert into catalog.frameworks(id,code,name,version,type,scope_description)
                              values (gen_random_uuid(),'x','x','x','standard','x')`);
          bad('la app PUDO insertar en catalog.frameworks: el RLS de escritura no funciona');
        } catch (e: unknown) {
          const code = (e as { code?: string }).code;
          check(code === '42501', 'la app NO puede escribir en el catálogo (RLS 42501)', `el insert falló por otra razón: ${String(e)}`);
        } finally {
          await client.query('rollback');
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
