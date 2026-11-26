import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  AuditedPeriod, ControlEvidenceItem, Dimension, NO_LINKS, ReadoutControl, ReadoutRequirement, ReadoutTest, TestLinks, dimensionOfAssetType, resultKey, testAssetKey,
} from '../../domain/controls/control-readout';
import { AssetResult } from '../../domain/engine/states';
import { ServiceReadoutData } from '../../domain/controls/control.repository';
import { ManualResult } from '../../domain/engine/v2/manual-test';
import type { ApprovalRecord } from '../../domain/controls/management-state';
import type { WindowMode } from '../../../../common/evaluation-parameters/parameter-definitions';
import { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import { ModuleFacts } from '../../domain/engine/v2/technical-test';
import { hasPeriodWindows } from '../../domain/engine/v2/windows';
import { Periodicity, TestType } from '../../domain/engine/v2/types';
import { NO_ACCESS } from '../../domain/controls/control-access';
import { loadControlAccess } from './control-access.loader';
import { latestEvaluations, latestManualResults } from './latest-results.query';
import { requirementState, submissionState, SUBMISSION_STATE_SELECT } from '../evidence/evidence-state.mapper';

// Orden canónico de las categorías (enums.md `trust_criterion`).
const CRITERIA_ORDER = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];

// El título de cada check y el código del control dueño de una Dependencia solo los pide `check_links[]` del detalle técnico (`withLinkItems`): las demás lecturas (lista, resumen, los
// eventos de estado) no pagan esas uniones.
const LINK_ITEM_SELECT = { check: { select: { id: true, titleEs: true, titleEn: true } }, ownerControl: { select: { code: true } } } satisfies Prisma.TestCheckSelect;
const testSelect = (withLinkItems: boolean) =>
  ({
    id: true, code: true, dimension: true, displayName: true, displayNameEn: true, displayDescription: true, type: true, primarySource: true, integrationCategory: { select: { name: true } },
    testChecks: { select: { role: true, checkId: true, ownerControlId: true, moduleRef: true, provenance: true, ...(withLinkItems ? LINK_ITEM_SELECT : {}) } },
  }) satisfies Prisma.TestSelect;

type TestRow = Prisma.TestGetPayload<{ select: ReturnType<typeof testSelect> }>;

/** Los vínculos de una prueba con sus checks y módulos (T-04 a T-06). Solo cuentan los que el comité ratificó (D56). `items` solo se llena con `withLinkItems`. */
function linksOf(test: TestRow, withLinkItems: boolean): TestLinks {
  const links: TestLinks = { directCheckCount: 0, complementaryCheckIds: [], modules: [], dependencies: [], directKeys: [], items: [] };
  for (const l of test.testChecks) {
    if (l.provenance !== 'committee_ratified') continue;
    const key = l.checkId ? `check:${l.checkId}` : l.moduleRef ? `module:${l.moduleRef}` : null;
    if (!key) continue;
    if (withLinkItems) {
      links.items.push({
        role: l.role, key, moduleRef: l.checkId ? null : l.moduleRef,
        check: l.check ? { id: l.check.id, titleEs: l.check.titleEs, titleEn: l.check.titleEn } : null,
        owner: l.role === 'dependency' && l.ownerControlId ? { controlId: l.ownerControlId, code: l.ownerControl?.code ?? '' } : null,
      });
    }
    if (l.role === 'dependency') {
      if (l.ownerControlId) links.dependencies.push({ ownerControlId: l.ownerControlId, key });
    } else if (l.role === 'direct') {
      links.directKeys.push(key);
      if (l.checkId) links.directCheckCount++;
      else links.modules.push({ role: 'direct', ref: l.moduleRef as string });
    } else if (l.checkId) links.complementaryCheckIds.push(l.checkId);
    else links.modules.push({ role: 'complementary', ref: l.moduleRef as string });
  }
  return links;
}

const toReadoutTest = (t: TestRow, withLinkItems: boolean): ReadoutTest => ({
  testId: t.id, code: t.code, displayName: t.displayName, displayNameEn: t.displayNameEn, displayDescription: t.displayDescription, testType: t.type, dimension: t.dimension as Dimension, primarySource: t.primarySource, integrationCategory: t.integrationCategory?.name ?? null,
  mandatory: true, active: true, links: linksOf(t, withLinkItems),
});

/** Los marcos y las categorías contratados del servicio: solo los requisitos de ellos cuentan para un control (D80). */
export type Contracted = { criteria: Set<string>; frameworks: Set<string> };
export async function loadContracted(tx: TransactionClient, serviceId: string): Promise<Contracted> {
  return {
    criteria: new Set((await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion)),
    frameworks: new Set((await tx.serviceFramework.findMany({ where: { serviceId }, select: { frameworkId: true } })).map((r) => r.frameworkId)),
  };
}

/** Los requisitos y puntos de enfoque de un control de catálogo que cuentan en el servicio (`POINT_OF_FOCUS_LINKS`, filtrados por lo contratado). */
export const POINT_OF_FOCUS_LINKS = {
  pointOfFocusControls: { select: { pointOfFocus: { select: { number: true, requirement: { select: { code: true, frameworkId: true, trustCriterion: { select: { criterion: true } } } } } } } },
} satisfies Prisma.ControlSelect;
type PointOfFocusRows = Prisma.ControlGetPayload<{ select: typeof POINT_OF_FOCUS_LINKS }>['pointOfFocusControls'];
export function placementsOf(links: PointOfFocusRows | undefined, contracted: Contracted): { criteria: Set<string>; requirementCodes: Set<string>; pointsOfFocus: Set<string> } {
  const out = { criteria: new Set<string>(), requirementCodes: new Set<string>(), pointsOfFocus: new Set<string>() };
  for (const link of links ?? []) {
    const req = link.pointOfFocus.requirement;
    if (!contracted.frameworks.has(req.frameworkId) || !contracted.criteria.has(req.trustCriterion.criterion)) continue;
    out.criteria.add(req.trustCriterion.criterion);
    out.requirementCodes.add(req.code);
    out.pointsOfFocus.add(`${req.code}-POF${link.pointOfFocus.number}`);
  }
  return out;
}

// Los controles del servicio con sus requisitos y las pruebas de cada uno, y la evidencia que se ha entregado. Un número fijo de consultas, sin importar cuántos controles haya.
async function loadControls(
  tx: TransactionClient,
  serviceId: string,
  only: string | readonly string[] | undefined,
  contracted: Contracted,
  withLinkItems: boolean,
  catalogControlIds?: readonly string[],
): Promise<ReadoutControl[]> {
  const rows = await tx.clientControl.findMany({
    where: {
      serviceId, isActive: true,
      ...(only === undefined ? {} : { id: typeof only === 'string' ? only : { in: [...only] } }),
      ...(catalogControlIds ? { controlId: { in: [...catalogControlIds] } } : {}),
    },
    select: {
      id: true, serviceId: true, ownCode: true, name: true, trustCriterion: true, type: true, clientInterpretation: true, controlId: true,
      periodicityJustification: true, periodicityChangedAt: true,
      control: {
        select: {
          code: true, name: true, description: true, periodicity: true,
          ...POINT_OF_FOCUS_LINKS,
        },
      },
      dimensions: { select: { dimension: true, type: true, reasonNotApplicable: true } },
      requirements: {
        select: {
          id: true, periodicity: true, isApplicable: true,
          controlRequirement: {
            select: { code: true, text: true, type: true, pointNumber: true, periodicity: true, tests: { select: { test: { select: testSelect(withLinkItems) } } } },
          },
        },
      },
    },
  });

  // D102 · Dueño y ejecutor de cada control: de ahí sale lo que ven el responsable y el delegado.
  const accessOf = await loadControlAccess(tx, rows.map((r) => r.id));

  // DT-114 · La evidencia que se sube hoy para cada prueba manual (D88), con el estado de su entrega más reciente según haya sido devuelta o no (D132) y su fecha.
  // Un control propio se mide con TODA su evidencia como un requisito documental único. Una sola consulta para el servicio.
  const evidenceRows = rows.length
    ? await tx.evidenceRequirement.findMany({
        where: { clientControlId: { in: rows.map((r) => r.id) } },
        select: { clientControlId: true, testId: true, submissions: { select: { ...SUBMISSION_STATE_SELECT, submittedAt: true } } },
      })
    : [];
  const evidenceOf = new Map<string, ControlEvidenceItem[]>();
  for (const e of evidenceRows) {
    const latest = [...e.submissions].sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0))[0];
    const item: ControlEvidenceItem = {
      testId: e.testId, state: requirementState(e.submissions), submittedAt: latest?.submittedAt ?? null,
      history: e.submissions.map((sub) => ({ state: submissionState(sub), submittedAt: sub.submittedAt })),
    };
    evidenceOf.set(e.clientControlId, [...(evidenceOf.get(e.clientControlId) ?? []), item]);
  }

  // MD-504 · D132, D140 · Las aprobaciones y devoluciones del control y el último resultado de cada prueba manual en él. Dos consultas para todos los controles.
  const ids = rows.map((r) => r.id);
  // Solo lo que `deriveManagement` lee: las aprobaciones que nadie invalidó y la última devolución de cada control (las invalidadas y las devoluciones viejas no cambian el estado).
  const lastReturns = ids.length
    ? await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT DISTINCT ON (client_control_id) id FROM tenant.control_approvals
         WHERE client_control_id = ANY(${ids}::uuid[]) AND decision = 'returned' ORDER BY client_control_id, at DESC, id DESC`)
    : [];
  const approvalRows = ids.length
    ? await tx.controlApproval.findMany({
        where: { clientControlId: { in: ids }, OR: [{ decision: 'approved', invalidatedAt: null }, { id: { in: lastReturns.map((r) => r.id) } }] },
        select: { id: true, clientControlId: true, step: true, decision: true, reason: true, at: true, windowStart: true, invalidatedAt: true, actor: { select: { id: true, name: true, lastName: true } } },
        orderBy: { at: 'asc' },
      })
    : [];
  const approvalsOf = new Map<string, ApprovalRecord[]>();
  for (const a of approvalRows) {
    approvalsOf.set(a.clientControlId, [...(approvalsOf.get(a.clientControlId) ?? []), { id: a.id, step: a.step, decision: a.decision, reason: a.reason, actor: a.actor, at: a.at, windowStart: a.windowStart, invalidatedAt: a.invalidatedAt }]);
  }
  const resultRows = await latestManualResults(tx, ids);
  const resultsOf = new Map<string, Map<string, ManualResult>>();
  for (const r of resultRows) {
    const byTest = resultsOf.get(r.clientControlId) ?? new Map<string, ManualResult>();
    byTest.set(r.testId, { result: r.result, at: r.registeredAt });
    resultsOf.set(r.clientControlId, byTest);
  }

  return rows.map((c) => {
    const { criteria, requirementCodes, pointsOfFocus } = placementsOf(c.control?.pointOfFocusControls, contracted);
    const requirements: ReadoutRequirement[] = c.requirements
      .map((r) => ({
        id: r.id,
        code: r.controlRequirement.code,
        text: r.controlRequirement.text,
        type: r.controlRequirement.type as TestType,
        periodicity: (r.periodicity ?? r.controlRequirement.periodicity ?? null) as Periodicity | null,
        suggestedPeriodicity: (r.controlRequirement.periodicity ?? null) as Periodicity | null,
        isApplicable: r.isApplicable,
        tests: r.controlRequirement.tests.map((t) => toReadoutTest(t.test, withLinkItems)).sort((a, b) => a.code.localeCompare(b.code)),
        point: r.controlRequirement.pointNumber ?? 0,
      }))
      .sort((a, b) => a.point - b.point || a.code.localeCompare(b.code))
      .map(({ point: _point, ...rest }) => rest);
    const tests = new Map<string, ReadoutTest>();
    for (const r of requirements) for (const t of r.tests) if (!tests.has(t.testId)) tests.set(t.testId, t);
    return {
      id: c.id,
      serviceId: c.serviceId,
      ownCode: c.ownCode,
      name: c.control?.name ?? c.name ?? c.ownCode,
      origin: c.control ? 'catalog' : 'own',
      type: c.type,
      interpretation: c.clientInterpretation,
      catalogDescription: c.control?.description ?? null,
      dimensions: c.dimensions.map((d) => ({ dimension: d.dimension as Dimension, applies: d.reasonNotApplicable === null, type: d.type, reasonNotApplicable: d.reasonNotApplicable })),
      tests: [...tests.values()],
      // Un control propio no llega a ningún requisito: su categoría es la que eligió la empresa.
      trustCriteria: c.control ? [...criteria].sort((a, b) => CRITERIA_ORDER.indexOf(a) - CRITERIA_ORDER.indexOf(b)) : c.trustCriterion ? [c.trustCriterion] : [],
      access: accessOf.get(c.id) ?? NO_ACCESS,
      approval: 'approved' as const,
      catalogCode: c.control?.code ?? null,
      requirementCodes: [...requirementCodes].sort(),
      pointsOfFocus: [...pointsOfFocus].sort(),
      evidence: evidenceOf.get(c.id) ?? [],
      catalogControlId: c.controlId,
      periodicity: (c.control?.periodicity ?? null) as Periodicity | null,
      requirements,
      manualResults: resultsOf.get(c.id) ?? new Map<string, ManualResult>(),
      management: { approvals: approvalsOf.get(c.id) ?? [], resultDates: [...(resultsOf.get(c.id)?.values() ?? [])].map((r) => r.at) },
      periodicityChange: c.periodicityChangedAt
        ? { periodicity: requirements[0]?.periodicity ?? null, justification: c.periodicityJustification ?? '', changedAt: c.periodicityChangedAt }
        : null,
    };
  });
}

// La foto de un servicio que el motor lee: controles, activos y todo lo que el motor v2 necesita para calcular. La usan las lecturas (controles, resumen) y quien registra
// los cambios de estado de un control (`control-state-events.ts`, D91), así que vive aparte del repositorio. Un número fijo de consultas, sin importar cuántos controles tenga el servicio.
export async function loadServiceSnapshot(
  tx: TransactionClient,
  serviceId: string,
  parameters: EvaluationParameters,
  onlyControlId?: string | readonly string[],
  // `now` solo lo fija quien evalúa el paso del tiempo con SU reloj (la pasada diaria de las ventanas, MD-515); las lecturas usan el instante actual.
  options: { withLinkItems?: boolean; now?: Date } = {},
): Promise<ServiceReadoutData> {
  const withLinkItems = options.withLinkItems ?? false;
  const contracted = await loadContracted(tx, serviceId);

  const controls = await loadControls(tx, serviceId, onlyControlId, contracted, withLinkItems);
  // T-06 · Una Dependencia lee la prueba del control dueño: si se leen solo algunos controles que dependen de otros, se cargan también esos dueños (y los de ellos, si a su vez dependen), no todo el servicio.
  const pool = onlyControlId === undefined ? undefined : await withDependencyOwners(tx, serviceId, controls, contracted, withLinkItems);
  const everyControl = pool ?? controls;

  const assets = (await tx.serviceAsset.findMany({ where: { serviceId, asset: { status: 'active' } }, select: { asset: { select: { id: true, name: true, type: true } } } })).map((r) => r.asset);
  const technicalAssets = assets.filter((a) => dimensionOfAssetType(a.type) !== null);

  // El último resultado de cada (control, test, activo): el histórico es inmutable y la lectura toma el más reciente. Las evaluaciones de origen `manual` son las de antes de D121: el motor ya no las lee;
  // lo manual sale de `manual_test_results` (MD-504).
  const latest = everyControl.length ? await latestEvaluations(tx, serviceId, everyControl.map((c) => c.id)) : [];
  const results = new Map<string, AssetResult>(latest.map((e) => [resultKey(e.clientControlId, e.testId, e.assetId), e.result as AssetResult]));
  const resultDates = new Map<string, Date>(latest.map((e) => [resultKey(e.clientControlId, e.testId, e.assetId), e.evaluatedAt]));

  const now = options.now ?? new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // MD-500 · El período auditado abierto (G-11): con varios marcos en el servicio, el que termina más tarde. Y, solo si hay ventanas de calendario por medir en una prueba técnica,
  // los días con un resultado decidido de cada (control, test, activo) dentro del período: de ahí sale la cobertura de las ventanas ya cerradas.
  const period = await loadOpenPeriod(tx, serviceId);
  const resultDays = period ? await loadResultDays(tx, serviceId, period, everyControl, now, parameters.validityWindows) : undefined;

  // D135 · Una excepción APROBADA y vigente (de 90 días como máximo, PR-04) deja pasar un FAIL de un activo en una prueba, marcado. La pendiente, la rechazada y la vencida no cambian nada.
  const exceptionRows = await tx.exclusion.findMany({
    where: { serviceId, status: 'approved', assetId: { not: null }, validFrom: { lte: today }, validUntil: { gte: today } },
    select: { testId: true, assetId: true, validFrom: true, validUntil: true },
  });
  const exceptions = new Set<string>();
  for (const x of exceptionRows) if (exceptionEndsOn(x.validFrom, x.validUntil, parameters).getTime() >= today.getTime()) exceptions.add(testAssetKey(x.testId, x.assetId as string));

  // S-04 · Los checks Complementarios en FAIL del último resultado de cada activo (de la última corrida completada).
  const complementaryByCheck = new Map<string, string[]>();
  for (const c of everyControl) for (const t of c.tests) for (const id of t.links?.complementaryCheckIds ?? []) complementaryByCheck.set(id, [...new Set([...(complementaryByCheck.get(id) ?? []), t.testId])]);
  const complementaryFails = new Set<string>();
  const complementaryFailChecks = new Set<string>();
  if (complementaryByCheck.size > 0 && technicalAssets.length > 0) {
    const failed = await tx.$queryRaw<{ assetId: string; checkId: string }[]>(Prisma.sql`
      SELECT DISTINCT sa.asset_id AS "assetId", cr.check_id AS "checkId"
        FROM tenant.service_assets sa
       CROSS JOIN LATERAL (SELECT x.id FROM tenant.executions x
                            WHERE x.asset_id = sa.asset_id AND x.kind = 'assessment' AND x.status = 'completed'
                            ORDER BY x.started_at DESC NULLS LAST, x.queued_at DESC LIMIT 1) ex
        JOIN tenant.check_results cr ON cr.execution_id = ex.id
       WHERE sa.service_id = ${serviceId}::uuid AND cr.result = 'failed' AND cr.check_id = ANY(${[...complementaryByCheck.keys()]}::uuid[])`);
    for (const f of failed) {
      for (const testId of complementaryByCheck.get(f.checkId) ?? []) {
        complementaryFails.add(testAssetKey(testId, f.assetId));
        complementaryFailChecks.add(`${testAssetKey(testId, f.assetId)}|${f.checkId}`);
      }
    }
  }

  // D141 · Los hallazgos críticos y altos abiertos de cada activo (vulnerabilidades activas y hallazgos abiertos), solo de los activos con una corrida completada: sin ella no hay dato y nunca se asume cero.
  // El puntaje global (D146) no se guarda todavía en ninguna tabla: sin dato.
  const moduleFacts = new Map<string, ModuleFacts>();
  const needsModules = everyControl.some((c) => c.tests.some((t) => (t.links?.modules.length ?? 0) > 0));
  if (needsModules && technicalAssets.length > 0) {
    const ids = technicalAssets.map((a) => a.id);
    const high = ['critical', 'high'] as const;
    const [scanned, vulnerabilities, findings] = await Promise.all([
      tx.execution.groupBy({ by: ['assetId'], where: { assetId: { in: ids }, kind: 'assessment', status: 'completed' }, _count: { _all: true } }),
      tx.vulnerability.groupBy({ by: ['assetId'], where: { assetId: { in: ids }, status: 'active', severity: { in: [...high] } }, _count: { _all: true } }),
      tx.finding.groupBy({ by: ['assetId'], where: { assetId: { in: ids }, status: 'open', severity: { in: [...high] } }, _count: { _all: true } }),
    ]);
    const open = new Map<string, number>();
    for (const r of [...vulnerabilities, ...findings]) open.set(r.assetId, (open.get(r.assetId) ?? 0) + r._count._all);
    for (const s of scanned) moduleFacts.set(s.assetId, { openCriticalHigh: open.get(s.assetId) ?? 0, scorePercent: null });
  }

  return {
    serviceId,
    controls,
    assets,
    results,
    signals: { now, parameters, resultDates, exceptions, complementaryFails, complementaryFailChecks, moduleFacts, period, ...(resultDays ? { resultDays } : {}) },
    ...(pool ? { pool } : {}),
  };
}

/** Los controles leídos más los dueños de sus Dependencias, a cualquier profundidad (solo los que faltan). `undefined` si ninguno depende de un control que no se leyó. */
async function withDependencyOwners(tx: TransactionClient, serviceId: string, controls: ReadoutControl[], contracted: Contracted, withLinkItems: boolean): Promise<ReadoutControl[] | undefined> {
  const known = new Set(controls.map((c) => c.catalogControlId));
  const extra: ReadoutControl[] = [];
  let frontier: readonly ReadoutControl[] = controls;
  for (;;) {
    const missing = new Set(frontier.flatMap((c) => c.tests.flatMap((t) => (t.links ?? NO_LINKS).dependencies.map((d) => d.ownerControlId))).filter((id) => !known.has(id)));
    if (missing.size === 0) break;
    // Un dueño que no existe en el servicio (fuera del alcance) se da por buscado: no se vuelve a pedir.
    for (const id of missing) known.add(id);
    frontier = await loadControls(tx, serviceId, undefined, contracted, withLinkItems, [...missing]);
    extra.push(...frontier);
  }
  return extra.length > 0 ? [...controls, ...extra] : undefined;
}

/** El período auditado abierto del servicio; con varios marcos activos, el que termina más tarde. `null` si ninguno lo tiene definido. */
export async function loadOpenPeriod(tx: TransactionClient, serviceId: string): Promise<AuditedPeriod | null> {
  const row = await tx.serviceFrameworkPeriod.findFirst({
    where: { status: 'open', serviceFramework: { serviceId, status: 'active' } },
    orderBy: { periodEnd: 'desc' },
    select: { periodStart: true, periodEnd: true },
  });
  return row ? { start: row.periodStart, end: row.periodEnd } : null;
}

async function loadResultDays(tx: TransactionClient, serviceId: string, period: AuditedPeriod, controls: readonly ReadoutControl[], now: Date, windowMode: WindowMode): Promise<Map<string, Set<number>> | undefined> {
  // Solo las pruebas técnicas con un check Directo de un requisito de calendario: son las únicas que se miden por resultado de activo (el resto, por evidencia).
  const pairs = controls.flatMap((c) =>
    (c.requirements ?? [])
      .filter((r) => hasPeriodWindows(r.periodicity, windowMode))
      .flatMap((r) => r.tests.filter((t) => t.testType === 'technical' && (t.links?.directCheckCount ?? 0) > 0).map((t) => ({ controlId: c.id, testId: t.testId }))),
  );
  if (pairs.length === 0) return undefined;
  // Ni más allá de hoy ni del fin del período (los resultados futuros no existen y los posteriores al período no cuentan, G-11).
  const end = new Date(Math.min(now.getTime(), period.end.getTime() + 86_400_000));
  const rows = await tx.$queryRaw<{ clientControlId: string; testId: string; assetId: string; day: Date }[]>(Prisma.sql`
    SELECT e.client_control_id AS "clientControlId", e.test_id AS "testId", e.asset_id AS "assetId", (e.evaluated_at AT TIME ZONE 'UTC')::date AS "day"
      FROM tenant.evaluations e
     WHERE e.service_id = ${serviceId}::uuid AND e.client_control_id = ANY(${[...new Set(pairs.map((p) => p.controlId))]}::uuid[]) AND e.test_id = ANY(${[...new Set(pairs.map((p) => p.testId))]}::uuid[])
       AND e.origin <> 'manual' AND e.result IN ('compliant', 'non_compliant') AND e.evaluated_at >= ${period.start} AND e.evaluated_at < ${end}
     GROUP BY 1, 2, 3, 4`);
  const days = new Map<string, Set<number>>();
  for (const r of rows) {
    const key = resultKey(r.clientControlId, r.testId, r.assetId);
    days.set(key, (days.get(key) ?? new Set()).add(new Date(r.day).getTime()));
  }
  return days;
}
