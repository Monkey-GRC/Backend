// JSON versionado → base de datos. Seguro e idempotente.
//
//   npm run catalog:load              # dry-run: muestra qué haría, no escribe nada
//   npm run catalog:load -- --apply   # escribe, en UNA transacción
//
// Reglas (ver prisma/seed/README.md):
//  - Solo INSERTA lo que falta, por clave natural. Nunca sobrescribe ni borra.
//  - Única excepción: `tests.display_name` y `tests.display_description` (el nombre neutro D70 y la descripción corta D82 que ve el cliente). Son nullable y se cargan
//    como dato: si están VACÍOS se completan; si ya tienen un valor distinto, es un conflicto como cualquier otro (no se pisa lo escrito).
//  - Si una fila existe con contenido distinto, ABORTA y muestra el diff: cambiar el catálogo exige
//    una versión nueva y aceptación (decisiones A4 y D33), no una recarga.
//  - Las filas de la base que no están en la fuente se REPORTAN, no se tocan.
//  - Solo mira lo que viene del comité (`origin = committee`). Lo que se agregó desde Monkey Admin (`origin = monkey_admin`) y sus vínculos se IGNORAN: ni se
//    comparan ni se reportan como huérfanos. Una fila del comité que se EDITÓ desde Admin aparece como conflicto, marcada «editado desde Monkey Admin», con el
//    cambio en `audit.audit_logs` (`catalog.*`): hay que decidir con el comité qué versión queda.
//  - Se niega a correr como `monkey_app`.
import { connectAsOwner, readCatalogJson, short } from './soc2/db';
import { DISPLAY_NAMES_EN, displayDescriptionOf, displayNameEnOf, displayNameOf } from './soc2/display-names';
import { validateCatalog } from './soc2/validate';

const apply = process.argv.includes('--apply');
// Lo que se agregó desde Monkey Admin no es del Excel: el seed no lo compara ni lo toca.
const COMMITTEE = { origin: 'committee' } as const;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const cat = readCatalogJson();
  const invalid = validateCatalog(cat);
  if (invalid.length) {
    console.error(`✗ El JSON del catálogo no es consistente (${invalid.length} errores); no se toca la base:`);
    invalid.forEach((m) => console.error('  - ' + m));
    process.exit(1);
  }

  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    console.log(`Fuente : ${cat.meta.sourceFile}  sha256 ${cat.meta.sourceSha256.slice(0, 16)}…`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    // ---- 1. Estado actual de la base -----------------------------------------------------
    const fwDb = await prisma.framework.findFirst({ where: { code: cat.framework.code, version: cat.framework.version } });
    const inFw = fwDb ? { requirement: { frameworkId: fwDb.id } } : undefined;
    const tcDb = await prisma.trustCriterion.findMany();
    const reqDb = fwDb ? await prisma.requirement.findMany({ where: { frameworkId: fwDb.id }, include: { trustCriterion: true } }) : [];
    const pofDb = inFw ? await prisma.pointOfFocus.findMany({ where: inFw, include: { requirement: true } }) : [];
    const ctrlDb = await prisma.control.findMany({ where: COMMITTEE });
    const relDb = fwDb
      ? await prisma.pointOfFocusControl.findMany({ where: { pointOfFocus: inFw, control: COMMITTEE }, include: { pointOfFocus: { include: { requirement: true } }, control: true } })
      : [];
    const riskDb = await prisma.risk.findMany({ where: COMMITTEE });
    const causeDb = await prisma.cause.findMany({ where: COMMITTEE });
    const riskCauseDb = await prisma.riskCause.findMany({ where: { risk: COMMITTEE, cause: COMMITTEE }, include: { risk: true, cause: true } });
    const causeCtrlDb = await prisma.causeControl.findMany({ where: { cause: COMMITTEE, control: COMMITTEE }, include: { cause: true, control: true } });
    const testDb = await prisma.test.findMany({ where: COMMITTEE });
    const ctrlTestDb = await prisma.controlTest.findMany({ where: { control: COMMITTEE, test: COMMITTEE }, include: { control: true, test: true } });
    const tplDb = await prisma.evidenceTemplate.findMany({ where: COMMITTEE });
    const ctrlTplDb = await prisma.controlEvidenceTemplate.findMany({ where: { control: COMMITTEE, evidenceTemplate: COMMITTEE }, include: { control: true, evidenceTemplate: true } });
    const polDb = await prisma.policy.findMany();
    const ctrlPolDb = await prisma.controlPolicy.findMany({ where: { control: COMMITTEE }, include: { control: true, policy: true } });
    const dimDb = await prisma.controlDimensionEntry.findMany({ where: { control: COMMITTEE }, include: { control: true } });
    const versions = await prisma.catalogVersion.count();

    // ---- 2. Diff contra la fuente ---------------------------------------------------------
    const conflicts: string[] = [];
    const orphans: string[] = [];

    /** Filas de la fuente que faltan en la base; las que existen y difieren van a `conflicts`. */
    function diff<S, D>(what: string, src: S[], db: D[], key: (s: S) => string, dbKey: (d: D) => string, fields: (d: D, s: S) => Record<string, [unknown, unknown]>, label: (s: S) => string = key, orphanNote = 'está en la base y no en la fuente'): S[] {
      const byKey = new Map(db.map((d) => [dbKey(d), d]));
      const missing: S[] = [];
      for (const s of src) {
        const d = byKey.get(key(s));
        if (!d) {
          missing.push(s);
          continue;
        }
        for (const [f, [dv, sv]] of Object.entries(fields(d, s))) {
          if (!same(dv, sv)) conflicts.push(`${what} ${label(s)}: ${f}  BD=${short(dv)}  fuente=${short(sv)}`);
        }
      }
      const srcKeys = new Set(src.map(key));
      for (const d of db) if (!srcKeys.has(dbKey(d))) orphans.push(`${what} ${dbKey(d)} ${orphanNote}`);
      return missing;
    }

    if (fwDb) {
      for (const [f, v] of Object.entries({ name: cat.framework.name, type: cat.framework.type, scopeDescription: cat.framework.scopeDescription })) {
        if (!same((fwDb as never)[f], v)) conflicts.push(`framework ${cat.framework.code}: ${f}  BD=${short((fwDb as never)[f])}  fuente=${short(v)}`);
      }
    }
    const tcMissing = diff('trust_criteria', cat.trustCriteria, tcDb, (t) => t.criterion, (t) => t.criterion as string, (d, s) => ({ isMandatory: [d.isMandatory, s.isMandatory] }));
    const reqMissing = diff('requisito', cat.requirements, reqDb, (r) => r.code, (r) => r.code, (d, s) => ({ tscCategory: [d.tscCategory, s.tscCategory], criterion: [d.criterion, s.criterion], trustCriterion: [d.trustCriterion.criterion, s.trustCriterion] }));
    const pk = (code: string, n: number) => `${code}#${n}`;
    const pofMissing = diff('punto de enfoque', cat.pointsOfFocus, pofDb, (p) => pk(p.requirementCode, p.number), (p) => pk(p.requirement.code, p.number), (d, s) => ({ description: [d.description, s.description] }));
    const ctrlMissing = diff('control', cat.controls, ctrlDb, (k) => k.code, (k) => k.code, (d, s) => ({ name: [d.name, s.name], description: [d.description, s.description], domain: [d.domain, s.domain], sourceRef: [d.sourceRef, s.sourceRef] }), undefined, 'está en la base y no en esta fuente (puede venir de otro marco)');
    const relMissing = diff('relación punto de enfoque↔control', cat.pointOfFocusControls, relDb, (r) => `${r.requirementCode}#${r.pointNumber}#${r.controlCode}`, (r) => `${r.pointOfFocus.requirement.code}#${r.pointOfFocus.number}#${r.control.code}`, () => ({}));
    const riskMissing = diff('riesgo', cat.risks, riskDb, (r) => r.code, (r) => r.code, (d, s) => ({ name: [d.name, s.name], description: [d.description, s.description], trustCriterion: [d.trustCriterion, s.trustCriterion], potentialImpact: [d.potentialImpact, s.potentialImpact], isActive: [d.isActive, s.isActive] }));
    const causeMissing = diff('causa', cat.causes, causeDb, (r) => r.code, (r) => r.code, (d, s) => ({ name: [d.name, s.name], failureCategory: [d.failureCategory, s.failureCategory], description: [d.description, s.description] }));
    const rcMissing = diff('relación riesgo↔causa', cat.riskCauses, riskCauseDb, (r) => r.code, (r) => r.code, (d, s) => ({ riesgo: [d.risk.code, s.riskCode], causa: [d.cause.code, s.causeCode] }));
    const ccMissing = diff('causa↔control', cat.causeControls, causeCtrlDb, (r) => `${r.causeCode}#${r.controlCode}`, (r) => `${r.cause.code}#${r.control.code}`, () => ({}));
    const testMissing = diff('prueba', cat.tests, testDb, (t) => t.code, (t) => t.code, (d, s) => ({
      dimension: [d.dimension, s.dimension], name: [d.name, s.name], objective: [d.objective, s.objective], type: [d.type, s.type], tool: [d.tool, s.tool],
      population: [d.population, s.population], period: [d.period, s.period], populationSize: [d.populationSize, s.populationSize], suggestedSampleSize: [d.suggestedSampleSize, s.suggestedSampleSize],
      selectionMethod: [d.selectionMethod, s.selectionMethod], evidenceToRequest: [d.evidenceToRequest, s.evidenceToRequest], prerequisites: [d.prerequisites, s.prerequisites],
      stepByStep: [d.stepByStep, s.stepByStep], attributesToValidate: [d.attributesToValidate, s.attributesToValidate], complianceCriterion: [d.complianceCriterion, s.complianceCriterion],
      exceptions: [d.exceptions, s.exceptions], exceptionsHandling: [d.exceptionsHandling, s.exceptionsHandling], evidenceToRetain: [d.evidenceToRetain, s.evidenceToRetain],
      automatedCoverage: [d.automatedCoverage, s.automatedCoverage], complementaryManualValidation: [d.complementaryManualValidation, s.complementaryManualValidation], limitations: [d.limitations, s.limitations],
    }));
    // El nombre neutro (D70) y la descripción corta (D82) de cada prueba: las que ya existen y los tienen vacíos se completan; las nuevas los traen al insertarse; uno distinto es un conflicto.
    const srcTest = new Map(cat.tests.map((t) => [t.code, t]));
    const displayNameFill: string[] = [];
    const displayDescriptionFill: string[] = [];
    const displayNameEnFill: string[] = [];
    const displayFill = new Map<string, { displayName?: string; displayDescription?: string; displayNameEn?: string }>();
    for (const d of testDb) {
      const s = srcTest.get(d.code);
      if (!s) continue;
      const wanted = displayNameOf(s);
      if (d.displayName === null) {
        displayNameFill.push(d.code);
        displayFill.set(d.code, { ...displayFill.get(d.code), displayName: wanted });
      } else if (d.displayName !== wanted) conflicts.push(`prueba ${d.code}: displayName  BD=${short(d.displayName)}  fuente=${short(wanted)}`);
      const wantedEn = displayNameEnOf(s);
      if (wantedEn !== null) {
        if (d.displayNameEn === null) {
          displayNameEnFill.push(d.code);
          displayFill.set(d.code, { ...displayFill.get(d.code), displayNameEn: wantedEn });
        } else if (d.displayNameEn !== wantedEn) conflicts.push(`prueba ${d.code}: displayNameEn  BD=${short(d.displayNameEn)}  fuente=${short(wantedEn)}`);
      }
      const wantedDescription = displayDescriptionOf(s);
      if (d.displayDescription === null) {
        displayDescriptionFill.push(d.code);
        displayFill.set(d.code, { ...displayFill.get(d.code), displayDescription: wantedDescription });
      } else if (d.displayDescription !== wantedDescription) conflicts.push(`prueba ${d.code}: displayDescription  BD=${short(d.displayDescription)}  fuente=${short(wantedDescription)}`);
    }
    const ctMissing = diff('control↔prueba', cat.controlTests, ctrlTestDb, (r) => `${r.controlCode}#${r.testCode}`, (r) => `${r.control.code}#${r.test.code}`, () => ({}));
    const tplMissing = diff('plantilla de evidencia', cat.evidenceTemplates, tplDb, (t) => t.code, (t) => t.code, (d, s) => ({ description: [d.description, s.description], dimension: [d.dimension, s.dimension] }));
    const cetMissing = diff('control↔plantilla', cat.controlEvidenceTemplates, ctrlTplDb, (r) => `${r.controlCode}#${r.templateCode}`, (r) => `${r.control.code}#${r.evidenceTemplate.code}`, (d, s) => ({ sequence: [d.sequence, s.sequence] }));
    const polMissing = diff('política', cat.policies, polDb, (p) => p.name, (p) => p.name, () => ({}));
    const cpMissing = diff('control↔política', cat.controlPolicies, ctrlPolDb, (r) => `${r.controlCode}#${r.policyName}`, (r) => `${r.control.code}#${r.policy.name}`, (d, s) => ({ requiresEmployeeAcceptance: [d.requiresEmployeeAcceptance, s.requiresEmployeeAcceptance] }));
    const dimMissing = diff('dimensión del control', cat.controlDimensions, dimDb, (r) => `${r.controlCode}#${r.dimension}`, (r) => `${r.control.code}#${r.dimension}`, (d, s) => ({
      type: [d.type, s.type], requiresProbe: [d.requiresProbe, s.requiresProbe], requiresAi: [d.requiresAi, s.requiresAi], requiresComplianceConfirmation: [d.requiresComplianceConfirmation, s.requiresComplianceConfirmation],
    }));

    // ---- 3. Resumen --------------------------------------------------------------------
    const rows: [string, number, number][] = [
      ['frameworks', 1, fwDb ? 0 : 1],
      ['trust_criteria', cat.trustCriteria.length, tcMissing.length],
      ['requirements', cat.requirements.length, reqMissing.length],
      ['points_of_focus', cat.pointsOfFocus.length, pofMissing.length],
      ['controls', cat.controls.length, ctrlMissing.length],
      ['point_of_focus_controls', cat.pointOfFocusControls.length, relMissing.length],
      ['risks', cat.risks.length, riskMissing.length],
      ['causes', cat.causes.length, causeMissing.length],
      ['risk_causes', cat.riskCauses.length, rcMissing.length],
      ['cause_controls', cat.causeControls.length, ccMissing.length],
      ['tests', cat.tests.length, testMissing.length],
      ['tests.display_name (a completar)', cat.tests.length, displayNameFill.length],
      ['tests.display_name_en (a completar)', Object.keys(DISPLAY_NAMES_EN).length, displayNameEnFill.length],
      ['tests.display_description (a completar)', cat.tests.length, displayDescriptionFill.length],
      ['control_tests', cat.controlTests.length, ctMissing.length],
      ['evidence_templates', cat.evidenceTemplates.length, tplMissing.length],
      ['control_evidence_templates', cat.controlEvidenceTemplates.length, cetMissing.length],
      ['policies', cat.policies.length, polMissing.length],
      ['control_policies', cat.controlPolicies.length, cpMissing.length],
      ['control_dimensions', cat.controlDimensions.length, dimMissing.length],
      ['catalog_versions', 1, versions === 0 ? 1 : 0],
    ];
    console.log('\ntabla                        fuente   a insertar');
    rows.forEach(([t, s, i]) => console.log(`${t.padEnd(28)} ${String(s).padStart(6)}   ${String(i).padStart(10)}`));

    const ignored = {
      controles: await prisma.control.count({ where: { origin: 'monkey_admin' } }),
      riesgos: await prisma.risk.count({ where: { origin: 'monkey_admin' } }),
      causas: await prisma.cause.count({ where: { origin: 'monkey_admin' } }),
      pruebas: await prisma.test.count({ where: { origin: 'monkey_admin' } }),
      plantillas: await prisma.evidenceTemplate.count({ where: { origin: 'monkey_admin' } }),
    };
    if (Object.values(ignored).some((n) => n > 0)) console.log(`\nIgnoradas (agregadas desde Monkey Admin, no son del Excel): ${Object.entries(ignored).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`).join(', ')}.`);
    if (orphans.length) {
      console.warn(`\n⚠ ${orphans.length} fila(s) de la base no están en la fuente (NO se tocan):`);
      orphans.slice(0, 15).forEach((m) => console.warn('  - ' + m));
      if (orphans.length > 15) console.warn(`  … y ${orphans.length - 15} más`);
    }
    // Las filas del comité que alguien editó desde Monkey Admin: el rastro `catalog.*.update` de la auditoría dice cuáles.
    const edited = new Set<string>();
    for (const e of await prisma.auditLog.findMany({ where: { action: { startsWith: 'catalog.' } }, select: { action: true, afterState: true } })) {
      const code = (e.afterState as { code?: unknown } | null)?.code;
      if (typeof code === 'string' && /\.(update|deactivate|reactivate)$/.test(e.action)) edited.add(code);
    }
    const annotate = (c: string) => ([...edited].some((code) => c.includes(` ${code}:`)) ? `${c}  [editado desde Monkey Admin]` : c);
    if (conflicts.length) {
      console.error(`\n✗ ${conflicts.length} fila(s) existen con contenido DISTINTO al de la fuente. No se sobrescribe nada:`);
      conflicts.slice(0, 25).forEach((m) => console.error('  - ' + annotate(m)));
      if (conflicts.length > 25) console.error(`  … y ${conflicts.length - 25} más`);
      console.error('  Cambiar el catálogo exige una versión nueva y aceptación (A4/D33), no una recarga.');
      process.exit(1);
    }

    const total = rows.reduce((n, r) => n + r[2], 0);
    if (total === 0) {
      console.log('\n✓ La base ya coincide con la fuente. Nada que insertar.');
      return;
    }
    if (!apply) {
      console.log(`\nDry-run: se insertarían ${total} filas. Nada se escribió. Repite con -- --apply para cargarlas.`);
      return;
    }

    // ---- 4. Carga: UNA transacción; cualquier error revierte todo ---------------------------
    await prisma.$transaction(
      async (tx) => {
        const fw = fwDb ?? (await tx.framework.create({ data: { ...cat.framework, availability: 'available' } }));

        for (const t of tcMissing) await tx.trustCriterion.create({ data: { criterion: t.criterion, isMandatory: t.isMandatory } });
        const tcId = new Map((await tx.trustCriterion.findMany()).map((t) => [t.criterion as string, t.id]));

        await tx.requirement.createMany({
          data: reqMissing.map((r) => ({ frameworkId: fw.id, trustCriterionId: tcId.get(r.trustCriterion)!, code: r.code, tscCategory: r.tscCategory, criterion: r.criterion })),
        });
        const reqId = new Map((await tx.requirement.findMany({ where: { frameworkId: fw.id } })).map((r) => [r.code, r.id]));
        await tx.pointOfFocus.createMany({ data: pofMissing.map((p) => ({ requirementId: reqId.get(p.requirementCode)!, number: p.number, description: p.description })) });
        await tx.control.createMany({ data: ctrlMissing.map((k) => ({ ...k })) });

        const pofId = new Map((await tx.pointOfFocus.findMany({ where: { requirement: { frameworkId: fw.id } }, include: { requirement: true } })).map((p) => [pk(p.requirement.code, p.number), p.id]));
        const ctrlId = new Map((await tx.control.findMany()).map((k) => [k.code, k.id]));
        await tx.pointOfFocusControl.createMany({ data: relMissing.map((r) => ({ pointOfFocusId: pofId.get(pk(r.requirementCode, r.pointNumber))!, controlId: ctrlId.get(r.controlCode)! })) });

        // Riesgos y causas (plantillas del catálogo, D28)
        await tx.risk.createMany({ data: riskMissing.map((r) => ({ code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact, isActive: r.isActive })) });
        await tx.cause.createMany({ data: causeMissing.map((k) => ({ ...k })) });
        const riskId = new Map((await tx.risk.findMany()).map((r) => [r.code, r.id]));
        const causeId = new Map((await tx.cause.findMany()).map((r) => [r.code, r.id]));
        await tx.riskCause.createMany({ data: rcMissing.map((r) => ({ code: r.code, riskId: riskId.get(r.riskCode)!, causeId: causeId.get(r.causeCode)! })) });
        await tx.causeControl.createMany({ data: ccMissing.map((r) => ({ causeId: causeId.get(r.causeCode)!, controlId: ctrlId.get(r.controlCode)! })) });

        // Pruebas y su asignación a controles
        await tx.test.createMany({ data: testMissing.map((t) => ({ ...t, displayName: displayNameOf(t), displayNameEn: displayNameEnOf(t), displayDescription: displayDescriptionOf(t) })) });
        for (const [code, data] of displayFill) await tx.test.update({ where: { code }, data });
        const testId = new Map((await tx.test.findMany()).map((t) => [t.code, t.id]));
        await tx.controlTest.createMany({ data: ctMissing.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, testId: testId.get(r.testCode)! })) });

        // Plantillas de evidencia
        await tx.evidenceTemplate.createMany({ data: tplMissing.map((t) => ({ ...t })) });
        const tplId = new Map((await tx.evidenceTemplate.findMany()).map((t) => [t.code, t.id]));
        await tx.controlEvidenceTemplate.createMany({ data: cetMissing.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, evidenceTemplateId: tplId.get(r.templateCode)!, sequence: r.sequence })) });

        // Políticas (plantillas) y dimensiones de cada control (D39)
        await tx.policy.createMany({ data: polMissing.map((p) => ({ name: p.name })) });
        const polId = new Map((await tx.policy.findMany()).map((p) => [p.name, p.id]));
        await tx.controlPolicy.createMany({ data: cpMissing.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, policyId: polId.get(r.policyName)!, requiresEmployeeAcceptance: r.requiresEmployeeAcceptance })) });
        await tx.controlDimensionEntry.createMany({
          data: dimMissing.map((r) => ({ controlId: ctrlId.get(r.controlCode)!, dimension: r.dimension, type: r.type, requiresProbe: r.requiresProbe, requiresAi: r.requiresAi, requiresComplianceConfirmation: r.requiresComplianceConfirmation })),
        });

        if ((await tx.catalogVersion.count()) === 0) {
          const c = cat.meta.counts;
          await tx.catalogVersion.create({
            data: {
              number: 1,
              publishedAt: new Date(new Date().toISOString().slice(0, 10)),
              publishedBy: null,
              propagatedAutomatically: false,
              requiresAcceptance: false,
              changeSummary:
                `Carga inicial del catálogo maestro de SOC 2 (prisma/seed/load-soc2.ts): ${c.requirements} requisitos, ${c.pointsOfFocus} puntos de enfoque, ` +
                `${c.controls} controles (${c.assignedControls} asignados), ${c.pointOfFocusControls} relaciones; ${c.risks} riesgos, ${c.causes} causas y ` +
                `${c.riskCauses} relaciones riesgo↔causa; ${c.tests} pruebas con ${c.controlTests} asignaciones; ${c.evidenceTemplates} plantillas de evidencia ` +
                `con ${c.controlEvidenceTemplates} vínculos; ${c.policies} políticas con ${c.controlPolicies} vínculos y ${c.controlDimensions} dimensiones por control. Fuente: ${cat.meta.sourceFile} (sha256 ${cat.meta.sourceSha256}). ` +
                cat.meta.sourceNotes.join(' '),
            },
          });
        }
      },
      { timeout: 120_000, maxWait: 10_000 },
    );
    console.log(`\n✓ Cargadas ${total} filas en una sola transacción. Ejecuta: npm run catalog:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
