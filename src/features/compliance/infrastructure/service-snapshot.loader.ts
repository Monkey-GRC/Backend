import { TransactionClient } from '../../../infrastructure/database/prisma.service';
import { Dimension, ReadoutControl, resultKey } from '../domain/control-readout';
import { AssetResult } from '../domain/engine/states';
import { ServiceReadoutData } from '../domain/repositories/control.repository';
import { DocumentaryEvidence } from '../domain/evidence';
import { DIMENSION_ORDER, loadControlResponsibles, usersOf } from './control-responsibles';
import { requirementState, reviewsOf } from './repositories/evidence-review.mapper';

// Orden canónico de las categorías (enums.md `trust_criterion`).
const CRITERIA_ORDER = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];

// La foto de un servicio que el motor lee: controles, activos y el último resultado de cada activo en cada test. La usan las lecturas (controles, resumen) y quien registra
// los cambios de estado de un control (`control-state-events.ts`, D91), así que vive aparte del repositorio.
// Un número fijo de consultas, sin importar cuántos controles tenga el servicio.
export async function loadServiceSnapshot(tx: TransactionClient, serviceId: string, onlyControlId?: string): Promise<ServiceReadoutData> {
  const contractedCriteria = new Set(
    (await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion),
  );
  const contractedFrameworks = new Set((await tx.serviceFramework.findMany({ where: { serviceId }, select: { frameworkId: true } })).map((r) => r.frameworkId));

  const rows = await tx.clientControl.findMany({
    where: { serviceId, isActive: true, ...(onlyControlId ? { id: onlyControlId } : {}) },
    select: {
      id: true, serviceId: true, ownCode: true, name: true, trustCriterion: true, type: true, clientInterpretation: true,
      control: {
        select: {
          code: true, name: true, description: true,
          pointOfFocusControls: {
            select: { pointOfFocus: { select: { number: true, requirement: { select: { code: true, frameworkId: true, trustCriterion: { select: { criterion: true } } } } } } },
          },
        },
      },
      dimensions: { select: { dimension: true, type: true, reasonNotApplicable: true } },
      tests: { select: { testId: true, test: { select: { code: true, dimension: true, displayName: true, displayDescription: true } } } },
    },
  });

  // D97 · Quiénes atienden cada dimensión: los funcionales con esa especialidad. De ahí sale lo que un funcional ve.
  const responsibles = await loadControlResponsibles(tx, rows.map((r) => r.id));

  // D88 · Las evidencias requeridas de estas acciones, con el estado de su última entrega según la revisión del admin_empresa (la que consume el motor, D96): de ellas sale el estado
  // de cada prueba documental en su control. Una sola consulta para todo el servicio.
  const documentaryRows = rows.length
    ? await tx.evidenceRequirement.findMany({
        // Solo lo entregado PARA una prueba (D88): un documento que el catálogo sugiere sin decir a qué prueba sirve no cuenta para ninguna.
        where: { clientControlId: { in: rows.map((r) => r.id) }, dimension: 'policy', testId: { not: null } },
        select: { clientControlId: true, testId: true, submissions: { select: { version: true, aiVerdict: true, reviews: reviewsOf('admin_empresa') } } },
      })
    : [];
  const documentaryOf = new Map<string, DocumentaryEvidence[]>();
  for (const d of documentaryRows) documentaryOf.set(d.clientControlId, [...(documentaryOf.get(d.clientControlId) ?? []), { testId: d.testId as string, state: requirementState(d.submissions) }]);

  const controls: ReadoutControl[] = rows.map((c) => {
    const criteria = new Set<string>();
    const requirementCodes = new Set<string>();
    const pointsOfFocus = new Set<string>();
    for (const link of c.control?.pointOfFocusControls ?? []) {
      const req = link.pointOfFocus.requirement;
      if (!contractedFrameworks.has(req.frameworkId) || !contractedCriteria.has(req.trustCriterion.criterion)) continue;
      criteria.add(req.trustCriterion.criterion);
      requirementCodes.add(req.code);
      pointsOfFocus.add(`${req.code}-POF${link.pointOfFocus.number}`);
    }
    const byDimension = responsibles.byControl.get(c.id);
    const assignedIds = usersOf(byDimension);
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
      // `client_control_tests` todavía no guarda «obligatorio» ni «vigente» (D68): hasta entonces todo test vinculado es obligatorio y vigente.
      tests: c.tests.map((t) => ({ testId: t.testId, code: t.test.code, displayName: t.test.displayName, displayDescription: t.test.displayDescription, dimension: t.test.dimension as Dimension, mandatory: true, active: true })),
      // Un control propio no llega a ningún requisito: su categoría es la que eligió la empresa.
      trustCriteria: c.control ? [...criteria].sort((a, b) => CRITERIA_ORDER.indexOf(a) - CRITERIA_ORDER.indexOf(b)) : c.trustCriterion ? [c.trustCriterion] : [],
      // Con varias personas por dimensión (D97) no hay «una» persona a cargo que mostrar.
      assignee: null,
      assignedUserIds: assignedIds,
      responsibleByDimension: Object.fromEntries(DIMENSION_ORDER.flatMap((d) => (byDimension?.has(d) ? [[d, byDimension.get(d)]] : []))),
      approval: 'approved',
      catalogCode: c.control?.code ?? null,
      requirementCodes: [...requirementCodes].sort(),
      pointsOfFocus: [...pointsOfFocus].sort(),
      documentary: documentaryOf.get(c.id) ?? [],
    };
  });

  const assets = (await tx.serviceAsset.findMany({ where: { serviceId, asset: { status: 'active' } }, select: { asset: { select: { id: true, name: true, type: true } } } })).map((r) => r.asset);

  // El último resultado de cada (control, test, activo): el histórico es inmutable y la lectura toma el más reciente.
  const latest = controls.length
    ? await tx.evaluation.findMany({
        where: { serviceId, clientControlId: { in: controls.map((c) => c.id) } },
        orderBy: { evaluatedAt: 'desc' },
        distinct: ['clientControlId', 'testId', 'assetId'],
        select: { clientControlId: true, testId: true, assetId: true, result: true },
      })
    : [];
  const results = new Map<string, AssetResult>(latest.map((e) => [resultKey(e.clientControlId, e.testId, e.assetId), e.result as AssetResult]));

  // Una exclusión APROBADA y vigente saca al activo del universo del test (su resultado es `excluded`, RN-05); la pendiente, la rechazada y la vencida no cambian nada:
  // el activo sigue contando. El veredicto de la sonda no se toca: la exclusión se superpone al leer (MD-144, D78).
  const day = new Date();
  const now = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
  const excluded = await tx.exclusion.findMany({
    where: { serviceId, status: 'approved', assetId: { not: null }, validFrom: { lte: now }, validUntil: { gte: now } },
    select: { testId: true, assetId: true },
  });
  for (const x of excluded) {
    for (const c of controls) if (c.tests.some((t) => t.testId === x.testId)) results.set(resultKey(c.id, x.testId, x.assetId as string), 'excluded');
  }

  return { serviceId, controls, assets, results };
}
