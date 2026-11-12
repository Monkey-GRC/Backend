import { ControlReadout, Readiness, ALMOST_READY_CUTOFF } from '../controls/control-readout';
import { effectiveCutoff, isPeriodDefined } from '../periods/evaluation-period';
import { evaluateCategory, evaluateFramework } from '../engine/rollup';
import { ControlState, RollupState, TestState } from '../engine/states';
import type { OverviewCriterionData, OverviewFrameworkData, Placement } from '../controls/control.repository';

// El resumen de un servicio por marco, categoría y acción que falla (contracts/modules/compliance-overview.md, MD-137). Lógica pura: recibe los controles ya leídos con
// el motor del comité (`readControl`) y los reparte en marcos y categorías. Nunca existe un número de toda la empresa: el cumplimiento es servicio × marco.

// Orden canónico de las categorías (enums.md `trust_criterion`).
const CRITERIA_ORDER = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];

export type Ratio = { done: number; total: number };
export type Coverage = { measured: number; applicable: number };

export type OverviewFailingControl = {
  readout: ControlReadout;
  code: string;
  ownCode: string | null;
  requirementCodes: string[];
};

export type OverviewControlLine = { readout: ControlReadout; code: string; blockingTests: Array<{ code: string; displayName: string | null; displayNameEn: string | null; dimension: string; state: TestState }> };

export type OverviewCategory = {
  trustCriterion: string;
  readiness: Readiness;
  progress: Ratio;
  coverage: Coverage;
  failingControls: OverviewFailingControl[];
  technical: { state: RollupState; controls: OverviewControlLine[] };
};

export type OverviewFramework = {
  frameworkCode: string;
  name: string;
  readiness: Readiness;
  progress: Ratio;
  coverage: Coverage;
  // `cutoffDate` es la fecha de corte EFECTIVA (D87): la congelada o, si no la hay, hoy sin salirse del período. Nula solo si el período no está definido.
  evaluation: { catalogVersion: number; periodStart: Date | null; periodEnd: Date | null; cutoffDate: Date | null; cutoffFrozen: boolean | null };
  categories: OverviewCategory[];
  technical: { state: RollupState; uniqueControls: number; failing: string[]; pending: string[] };
};

const isDecided = (s: ControlState) => s === 'effective' || s === 'ineffective' || s === 'expired';
const isFailing = (s: ControlState) => s === 'ineffective' || s === 'expired';

/** El código con el que se nombra un control (D80): el del catálogo (`IAC-12`) o el propio (`C01`). */
export const codeOfControl = (r: ControlReadout): string => r.control.catalogCode ?? r.control.ownCode;

/**
 * El semáforo de una categoría o de un marco, con los mismos cortes que el de un control (D62, P16): Sin medir si nada se pudo decidir; Preparado si todos son
 * efectivos; Casi listo si nada falla (solo falta decidir) o si el avance llega al 80 %; Requiere trabajo si no.
 */
export function readinessOfRollup(input: { total: number; measured: number; done: number; failing: number }): Readiness {
  if (input.total === 0 || input.measured === 0) return 'not_measured';
  if (input.done === input.total) return 'ready';
  if (input.failing === 0) return 'almost_ready';
  return input.done / input.total >= ALMOST_READY_CUTOFF ? 'almost_ready' : 'needs_work';
}

const ratioOf = (controls: readonly ControlReadout[]): { progress: Ratio; coverage: Coverage; failing: number } => ({
  progress: { done: controls.filter((c) => c.state === 'effective').length, total: controls.length },
  coverage: { measured: controls.filter((c) => isDecided(c.state)).length, applicable: controls.length },
  failing: controls.filter((c) => isFailing(c.state)).length,
});

const blockingTests = (r: ControlReadout): OverviewControlLine['blockingTests'] =>
  r.tests
    .filter((t) => t.state !== 'compliant' && t.state !== 'not_applicable' && t.state !== 'deactivated')
    .map((t) => ({ code: t.test.code, displayName: t.test.displayName, displayNameEn: t.test.displayNameEn, dimension: t.test.dimension, state: t.state }));

export type OverviewInput = {
  readouts: readonly ControlReadout[];
  frameworks: readonly OverviewFrameworkData[];
  criteria: readonly OverviewCriterionData[];
  placements: ReadonlyMap<string, readonly Placement[]>;
  /** Un `responsable` ve el marco y las categorías completos, pero solo los controles que falla entre los que tiene asignados. */
  onlyFailingOf?: string | null;
  /** Hoy como día UTC, para la fecha de corte efectiva (por defecto, el día de hoy). */
  today?: Date;
};

export function buildOverview(input: OverviewInput): OverviewFramework[] {
  const inScope = (criterion: string) => {
    const c = input.criteria.find((x) => x.criterion === criterion);
    return !!c && (c.mandatory || c.selected);
  };

  return input.frameworks.map((fw) => {
    // Sin período auditado el motor no ejecuta (REQ-004, D87): el marco queda «Sin medir» y no se inventa ningún resultado. La fecha de corte no hace falta
    // guardarla: sin valor es «hoy».
    const defined = isPeriodDefined(fw);
    const cutoff = effectiveCutoff(fw, input.today);
    const criteria = input.criteria
      .filter((c) => inScope(c.criterion))
      .map((c) => c.criterion)
      .sort((a, b) => CRITERIA_ORDER.indexOf(a) - CRITERIA_ORDER.indexOf(b));

    const categories: OverviewCategory[] = [];
    for (const criterion of criteria) {
      const controls = input.readouts.filter((r) => (input.placements.get(r.control.id) ?? []).some((p) => p.frameworkId === fw.frameworkId && p.criterion === criterion));
      const mandatory = input.criteria.find((c) => c.criterion === criterion)?.mandatory ?? false;
      if (controls.length === 0 && !mandatory) continue;
      const evaluation = evaluateCategory({ inScope: true, controls: controls.map((r) => ({ controlId: r.control.id, state: r.state })) });
      const counts = ratioOf(controls);
      const shown = defined ? counts : { progress: { done: 0, total: controls.length }, coverage: { measured: 0, applicable: controls.length }, failing: 0 };
      const failing = !defined ? [] : controls.filter((r) => isFailing(r.state) && (!input.onlyFailingOf || r.control.assignedUserIds.includes(input.onlyFailingOf)));
      categories.push({
        trustCriterion: criterion,
        readiness: defined ? readinessOfRollup({ total: shown.progress.total, measured: shown.coverage.measured, done: shown.progress.done, failing: shown.failing }) : 'not_measured',
        progress: shown.progress,
        coverage: shown.coverage,
        failingControls: failing.map((r) => ({
          readout: r,
          code: codeOfControl(r),
          ownCode: r.control.origin === 'own' ? r.control.ownCode : null,
          requirementCodes: r.control.requirementCodes,
        })),
        technical: {
          state: defined ? evaluation.state : 'evaluating',
          controls: controls.map((r) => ({ readout: r, code: codeOfControl(r), blockingTests: blockingTests(r) })),
        },
      });
    }

    // El marco cuenta controles ÚNICOS: uno compartido entre categorías vale una vez (RN-19).
    const unique = new Map<string, ControlReadout>();
    for (const category of categories) for (const line of category.technical.controls) unique.set(line.readout.control.id, line.readout);
    const all = [...unique.values()];
    const counts = ratioOf(all);
    const shown = defined ? counts : { progress: { done: 0, total: all.length }, coverage: { measured: 0, applicable: all.length }, failing: 0 };
    const engine = evaluateFramework(
      categories.map((c) => ({ inScope: true, controls: c.technical.controls.map((l) => ({ controlId: l.readout.control.id, state: l.readout.state })) })),
    );

    return {
      frameworkCode: fw.code,
      name: fw.name,
      readiness: defined ? readinessOfRollup({ total: shown.progress.total, measured: shown.coverage.measured, done: shown.progress.done, failing: shown.failing }) : 'not_measured',
      progress: shown.progress,
      coverage: shown.coverage,
      evaluation: { catalogVersion: fw.catalogVersion, periodStart: fw.periodStart, periodEnd: fw.periodEnd, cutoffDate: cutoff?.date ?? null, cutoffFrozen: cutoff?.frozen ?? null },
      categories,
      technical: {
        state: defined ? engine.state : 'evaluating',
        uniqueControls: all.length,
        failing: defined ? engine.failing.map((id) => codeOfControl(unique.get(id)!)) : [],
        pending: defined ? engine.pending.map((id) => codeOfControl(unique.get(id)!)) : all.map(codeOfControl),
      },
    };
  });
}
