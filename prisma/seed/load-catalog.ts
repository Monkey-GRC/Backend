// Catálogo v2 (VF18, RC-01): JSON versionado → base de datos, en UNA transacción y en el orden de la tabla 10 de 01_DESARROLLO.
//
//   npm run catalog:load              # dry-run: muestra qué haría, no escribe nada
//   npm run catalog:load -- --apply   # escribe
//
// Reglas (prisma/seed/README.md):
//  - Solo INSERTA. La v2 va sobre una base recreada: si ya hay un catálogo del comité que no es esta v2 (la v1, o una carga a medias) ABORTA con un mensaje claro,
//    y si la v2 ya está cargada no hace nada (la fila a fila la comprueba `catalog:verify`). Nunca sobrescribe ni borra.
//  - Solo mira lo que viene del comité (`origin = committee`): lo agregado desde Monkey Admin se ignora.
//  - Requiere los checks cargados antes (`sonda:load` y `cloud:load`): los vínculos de TEST_CHECKS apuntan a ellos.
//  - Puentes con el código v1 (contracts/catalogo-maestro.md): `control_tests` (658) y `control_dimensions.type` derivado del tipo del control.
//  - Se niega a correr como `monkey_app` (usa DATABASE_URL, el rol dueño).
import { connectAsOwner, readCatalogJson } from './db';
import { validateCatalog } from './catalog/validate';
import { CatalogV2, ControlType } from './catalog/types';

const apply = process.argv.includes('--apply');
const COMMITTEE = { origin: 'committee' } as const;
const CHUNK = 2000;
const chunks = <T>(xs: T[], n = CHUNK): T[][] => Array.from({ length: Math.ceil(xs.length / n) }, (_v, i) => xs.slice(i * n, (i + 1) * n));

// control_dimensions.type de la v1 a partir del tipo del control (contrato, «Puentes con el código v1»).
const DIMENSION_TYPE: Record<ControlType, 'manual' | 'automated' | 'hybrid'> = { manual: 'manual', automated: 'automated', it_dependent_manual: 'hybrid' };

const checkKey = (platform: string, policyId: string, checkId: string) => `${platform}|${policyId}|${checkId}`;

const summaryRows = (c: CatalogV2): [string, number][] => [
  ['frameworks', 1],
  ['trust_criteria', c.trustCriteria.length],
  ['requirements', c.requirements.length],
  ['points_of_focus', c.pointsOfFocus.length],
  ['risks', c.risks.length],
  ['causes', c.causes.length],
  ['risk_causes', c.riskCauses.length],
  ['documents', c.documents.length],
  ['standard_procedures', c.standardProcedures.length],
  ['integration_categories', c.integrationCategories.length],
  ['controls', c.controls.length],
  ['point_of_focus_controls', c.pointOfFocusControls.length],
  ['cause_controls', c.causeControls.length],
  ['control_documents', c.controlDocuments.length],
  ['control_dimensions', c.controlDimensions.length],
  ['integration_category_procedures', c.integrationCategories.reduce((n, k) => n + k.procedureCodes.length, 0)],
  ['integration_category_controls', c.integrationCategoryControls.length],
  ['control_framework_mappings', c.controlFrameworkMappings.length],
  ['control_requirements', c.controlRequirements.length],
  ['tests', c.tests.length],
  ['control_requirement_tests', c.controlRequirementTests.length],
  ['control_requirement_documents', c.controlRequirementDocuments.length],
  ['test_checks', c.testChecks.length],
  ['control_tests (puente v1)', c.controlTests.length],
  ['catalog_versions', 1],
];

async function main() {
  const cat = readCatalogJson();
  const verdict = validateCatalog(cat);
  if (verdict.errors.length) {
    console.error(`✗ El JSON del catálogo no es consistente (${verdict.errors.length} errores); no se toca la base:`);
    verdict.errors.forEach((m) => console.error('  - ' + m));
    process.exit(1);
  }

  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    console.log(`Fuente : ${cat.meta.sourceFile}  sha256 ${cat.meta.sourceSha256.slice(0, 16)}…  (catálogo v${cat.meta.catalogVersion})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    // ---- 1. Estado de la base: ¿vacía, ya en la v2, o con otro catálogo? ----
    const present = {
      controls: await prisma.control.count({ where: COMMITTEE }),
      tests: await prisma.test.count({ where: COMMITTEE }),
      risks: await prisma.risk.count({ where: COMMITTEE }),
      causes: await prisma.cause.count({ where: COMMITTEE }),
      requirements: await prisma.requirement.count(),
      documents: await prisma.document.count(),
    };
    const v2 = await prisma.catalogVersion.count({ where: { number: 2 } });
    const anything = Object.values(present).some((n) => n > 0);
    if (v2 > 0 && present.controls === cat.controls.length && present.tests === cat.tests.length) {
      console.log('\n✓ El catálogo v2 ya está cargado. Nada que insertar (`npm run catalog:verify` lo compara fila a fila).');
      return;
    }
    if (anything) {
      console.error(
        `\n✗ La base ya tiene un catálogo del comité que no es esta v2 (${Object.entries(present).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`).join(', ')}).\n` +
          '  La v2 reemplaza a la v1 y NO convive con ella (D128): se carga sobre una base recreada (la de desarrollo se recrea y la de pruebas con `npm run test:db -- rebuild`). No se escribió nada.',
      );
      process.exit(1);
    }

    // ---- 2. Los checks de los vínculos tienen que estar cargados ----
    const keys = [...new Set(cat.testChecks.filter((t) => t.checkId !== null).map((t) => checkKey(t.platform!, t.policyId!, t.checkId!)))];
    const dbChecks = await prisma.check.findMany({ select: { id: true, platform: true, policyId: true, checkId: true } });
    const checkId = new Map(dbChecks.map((c) => [checkKey(c.platform, c.policyId, c.checkId), c.id]));
    const missingChecks = keys.filter((k) => !checkId.has(k));
    if (missingChecks.length) {
      console.error(`\n✗ Faltan ${missingChecks.length} checks en la base (p. ej. ${missingChecks.slice(0, 3).join(', ')}). Carga antes los checks: npm run sonda:load -- --apply y npm run cloud:load -- --apply.`);
      process.exit(1);
    }
    const fwDb = await prisma.framework.findFirst({ where: { code: cat.framework.code, version: cat.framework.version } });

    console.log('\ntabla                              fuente   a insertar');
    summaryRows(cat).forEach(([t, n]) => console.log(`${t.padEnd(34)} ${String(n).padStart(6)}   ${String(t === 'frameworks' && fwDb ? 0 : n).padStart(10)}`));
    if (!apply) {
      console.log('\nDry-run: nada se escribió. Repite con -- --apply para cargarlo.');
      return;
    }

    // ---- 3. Carga: UNA transacción; cualquier error revierte todo ----
    await prisma.$transaction(
      async (tx) => {
        const fw = fwDb ?? (await tx.framework.create({ data: { ...cat.framework, availability: 'available' } }));
        for (const t of cat.trustCriteria) {
          if (!(await tx.trustCriterion.findFirst({ where: { criterion: t.criterion } }))) await tx.trustCriterion.create({ data: { criterion: t.criterion, isMandatory: t.isMandatory } });
        }
        const tcId = new Map((await tx.trustCriterion.findMany()).map((t) => [t.criterion as string, t.id]));

        // 1. Criterios y puntos de enfoque
        await tx.requirement.createMany({ data: cat.requirements.map((r) => ({ frameworkId: fw.id, trustCriterionId: tcId.get(r.trustCriterion)!, code: r.code, tscCategory: r.tscCategory, criterion: r.criterion })) });
        const reqId = new Map((await tx.requirement.findMany({ where: { frameworkId: fw.id } })).map((r) => [r.code, r.id]));
        await tx.pointOfFocus.createMany({ data: cat.pointsOfFocus.map((p) => ({ requirementId: reqId.get(p.requirementCode)!, number: p.number, description: p.description })) });
        const pofId = new Map((await tx.pointOfFocus.findMany({ where: { requirement: { frameworkId: fw.id } }, include: { requirement: true } })).map((p) => [`${p.requirement.code}#${p.number}`, p.id]));

        // 2. Riesgos y 3. causas con sus vínculos
        await tx.risk.createMany({
          data: cat.risks.map((r) => ({
            code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact, likelihood: r.likelihood, impact: r.impact,
            inherentRiskValue: r.inherentRiskValue, inherentRiskLevel: r.inherentRiskLevel,
          })),
        });
        await tx.cause.createMany({ data: cat.causes.map((c) => ({ code: c.code, description: c.description, causeOrigin: c.causeOrigin, causeType: c.causeType })) });
        const riskId = new Map((await tx.risk.findMany({ where: COMMITTEE })).map((r) => [r.code, r.id]));
        const causeId = new Map((await tx.cause.findMany({ where: COMMITTEE })).map((c) => [c.code, c.id]));
        await tx.riskCause.createMany({ data: cat.riskCauses.map((r) => ({ riskId: riskId.get(r.riskCode)!, causeId: causeId.get(r.causeCode)! })) });

        // 4. Documentos (su T-DOC se enlaza al crear las pruebas) y 5. procedimientos y categorías de integración
        await tx.document.createMany({
          data: cat.documents.map((d) => ({
            code: d.code, type: d.type, name: d.name, description: d.description, minimumContent: d.minimumContent, reviewPeriodicity: d.reviewPeriodicity,
            suggestedApproverRole: d.suggestedApproverRole, suggestedOwnerRole: d.suggestedOwnerRole, origin: d.origin, suggestedAcceptance: d.suggestedAcceptance,
          })),
        });
        await tx.standardProcedure.createMany({ data: cat.standardProcedures.map((p) => ({ code: p.code, name: p.name, whenUsed: p.whenUsed, genericSteps: p.genericSteps, typicalEvidence: p.typicalEvidence })) });
        await tx.integrationCategory.createMany({
          data: cat.integrationCategories.map((c) => ({ name: c.name, exampleTools: c.exampleTools, evidenceProvided: c.evidenceProvided })),
        });
        const docId = new Map((await tx.document.findMany()).map((d) => [d.code, d.id]));
        const categoryId = new Map((await tx.integrationCategory.findMany()).map((c) => [c.name, c.id]));
        const procedureId = new Map((await tx.standardProcedure.findMany()).map((p) => [p.code, p.id]));
        await tx.integrationCategoryProcedure.createMany({
          data: cat.integrationCategories.flatMap((c) => c.procedureCodes.map((code) => ({ integrationCategoryId: categoryId.get(c.name)!, standardProcedureId: procedureId.get(code)! }))),
        });

        // 6. Controles con sus vínculos (puntos de enfoque, causas, documentos) y lo que cuelga de ellos
        await tx.control.createMany({ data: cat.controls.map((k) => ({ code: k.code, name: k.name, description: k.description, type: k.type, periodicity: k.periodicity, suggestedOwnerRole: k.suggestedOwnerRole })) });
        const ctrlId = new Map((await tx.control.findMany({ where: COMMITTEE })).map((k) => [k.code, k.id]));
        const ctrlType = new Map(cat.controls.map((k) => [k.code, k.type]));
        await tx.pointOfFocusControl.createMany({ data: cat.pointOfFocusControls.map((r) => ({ pointOfFocusId: pofId.get(`${r.requirementCode}#${r.pointNumber}`)!, controlId: ctrlId.get(r.controlCode)!, domain: r.domain })) });
        await tx.causeControl.createMany({ data: cat.causeControls.map((r) => ({ causeId: causeId.get(r.causeCode)!, controlId: ctrlId.get(r.controlCode)! })) });
        await tx.controlDocument.createMany({ data: cat.controlDocuments.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, documentId: docId.get(r.documentCode)! })) });
        await tx.controlDimensionEntry.createMany({
          data: cat.controlDimensions.map((r) => ({
            controlId: ctrlId.get(r.controlCode)!, dimension: r.dimension, type: DIMENSION_TYPE[ctrlType.get(r.controlCode)!], requiresProbe: false, requiresAi: false, requiresComplianceConfirmation: false,
          })),
        });
        await tx.integrationCategoryControl.createMany({ data: cat.integrationCategoryControls.map((r) => ({ integrationCategoryId: categoryId.get(r.categoryName)!, controlId: ctrlId.get(r.controlCode)! })) });
        await tx.controlFrameworkMapping.createMany({
          data: cat.controlFrameworkMappings.map((m) => ({ controlId: ctrlId.get(m.controlCode)!, frameworkCode: m.frameworkCode, requirementRef: m.requirementRef, relationType: m.relationType, justification: m.justification })),
        });

        // 7. Requisitos del control
        await tx.controlRequirement.createMany({
          data: cat.controlRequirements.map((r) => ({
            code: r.code, controlId: ctrlId.get(r.controlCode)!, pointNumber: r.pointNumber, text: r.text, type: r.type, periodicity: r.periodicity, isMandatory: r.isMandatory, assemblyNote: r.assemblyNote,
          })),
        });
        const reqCtrlId = new Map((await tx.controlRequirement.findMany()).map((r) => [r.code, r.id]));

        // 8. Pruebas (y la T-DOC de cada documento)
        await tx.test.createMany({
          data: cat.tests.map((t) => ({
            code: t.code, dimension: t.dimension, type: t.type, objective: t.objective, controlId: t.controlCode ? ctrlId.get(t.controlCode)! : null, primarySource: t.primarySource,
            standardProcedureId: procedureId.get(t.standardProcedureCode)!, whyItMatters: t.whyItMatters, stepByStep: t.stepByStep, correctIf: t.correctIf, exceptionIf: t.exceptionIf,
            observationIf: t.observationIf, evidenceToRetain: t.evidenceToRetain, level: t.level, frequencySample: t.frequencySample,
            integrationCategoryId: t.integrationCategoryName ? categoryId.get(t.integrationCategoryName)! : null, automation: t.automation, displayName: t.displayName,
            displayNameReviewed: t.displayNameReviewed, displayDescription: t.displayDescription, displayNameEn: t.displayNameEn,
          })),
        });
        const testId = new Map((await tx.test.findMany({ where: COMMITTEE })).map((t) => [t.code, t.id]));
        for (const d of cat.documents) await tx.document.update({ where: { code: d.code }, data: { testId: testId.get(d.testCode)! } });
        for (const part of chunks(cat.controlRequirementTests)) await tx.controlRequirementTest.createMany({ data: part.map((r) => ({ controlRequirementId: reqCtrlId.get(r.requirementCode)!, testId: testId.get(r.testCode)! })) });
        await tx.controlRequirementDocument.createMany({ data: cat.controlRequirementDocuments.map((r) => ({ controlRequirementId: reqCtrlId.get(r.requirementCode)!, documentId: docId.get(r.documentCode)! })) });

        // 9–10. Vínculos prueba–check (los define el comité: entran ratificados, DEV-12)
        for (const part of chunks(cat.testChecks)) {
          await tx.testCheck.createMany({
            data: part.map((t) => ({
              testId: testId.get(t.testCode)!, checkId: t.checkId === null ? null : checkId.get(checkKey(t.platform!, t.policyId!, t.checkId))!, role: t.role, commonObjective: t.commonObjective,
              ownerControlId: t.ownerControlCode ? ctrlId.get(t.ownerControlCode)! : null, appliesWhen: t.appliesWhen, moduleRef: t.moduleRef, provenance: 'committee_ratified' as const,
            })),
          });
        }

        // Puente con el código v1
        await tx.controlTest.createMany({ data: cat.controlTests.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, testId: testId.get(r.testCode)! })) });

        const c = cat.meta.counts;
        await tx.catalogVersion.create({
          data: {
            number: 2,
            publishedAt: new Date(new Date().toISOString().slice(0, 10)),
            publishedBy: null,
            propagatedAutomatically: false,
            requiresAcceptance: false,
            changeSummary:
              `Catálogo v2 (VF18, RC-01; prisma/seed/load-catalog.ts): ${c.requirements} criterios y ${c.pointsOfFocus} puntos de enfoque; ${c.controls} controles en ${c.pointOfFocusControls} vínculos; ` +
              `${c.controlRequirements} requisitos; ${c.tests} pruebas con ${c.testChecks} vínculos con checks; ${c.documents} documentos; ${c.risks} riesgos, ${c.causes} causas, ` +
              `${c.riskCauses} vínculos riesgo–causa y ${c.causeControls} causa–control. Fuente: ${cat.meta.sourceFile} (sha256 ${cat.meta.sourceSha256}). Sonda ${cat.meta.sondaVersion}, motor de nube ${cat.meta.cloudEngineVersion}.`,
          },
        });
      },
      { timeout: 300_000, maxWait: 10_000 },
    );
    console.log('\n✓ Catálogo v2 cargado en una sola transacción. Ejecuta: npm run catalog:verify');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
