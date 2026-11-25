import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ReadoutAsset, ReadoutControl, ReadoutSignals, ResultsIndex } from './control-readout';
import type { EvidenceState } from '../evidence/evidence';

// Las acciones de protección de UN servicio (tenant.client_controls) y todo lo que hace falta para leerlas, cargado EN BLOQUE: la lista de un
// servicio recién clonado trae unas 80 y no puede hacer una consulta por control. Todo pasa por withScope: RLS impone el aislamiento entre empresas.

export type ServiceReadoutData = {
  serviceId: string;
  controls: ReadoutControl[];
  /** Los activos vigentes del servicio: el universo de los tests por dimensión. */
  assets: ReadoutAsset[];
  /** El último resultado de cada activo en cada test de cada control. */
  results: ResultsIndex;
  /** El reloj, los parámetros y los datos de la sonda y de las personas que el motor v2 lee (MD-498). */
  signals: ReadoutSignals;
  /** Todos los controles del servicio, cuando `controls` trae solo uno: la Dependencia (T-06) lee la prueba del control dueño. */
  pool?: ReadoutControl[];
};

export type ControlEvidence = {
  requirementId: string;
  code: string;
  sequence: number;
  description: string;
  dimension: string;
  /** D88: la prueba a la que sirve el requerimiento (null = compartido). */
  testId: string | null;
  validityWithinPeriod: string;
  origin: 'catalog' | 'own';
  responsible: { id: string; type: string; personName: string } | null;
  latestSubmission: { id: string; version: number; evidenceState: EvidenceState } | null;
};

export type ControlDetailData = ServiceReadoutData & {
  evidence: ControlEvidence[];
  causes: Array<{ id: string; code: string; name: string | null }>;
};

// Lo que el resumen del servicio necesita además de los controles: los marcos contratados con su evaluación, qué categorías están en alcance y en qué marco y
// categoría cae cada control (por los requisitos a los que sirve; un control propio, por la categoría que eligió la empresa).
export type OverviewFrameworkData = {
  frameworkId: string;
  code: string;
  name: string;
  catalogVersion: number;
  periodStart: Date | null;
  periodEnd: Date | null;
  cutoffDate: Date | null;
  /** PR-16 (MD-499) · Meses mínimos del período auditado de este marco; nulo si no exige mínimo. */
  minPeriodMonths: number | null;
};
export type OverviewCriterionData = { criterion: string; mandatory: boolean; selected: boolean };
export type Placement = { frameworkId: string; criterion: string };

export type ServiceOverviewData = ServiceReadoutData & {
  frameworks: OverviewFrameworkData[];
  criteria: OverviewCriterionData[];
  placements: ReadonlyMap<string, Placement[]>;
};

export abstract class ControlRepository {
  // null si el servicio no existe (o es de otra empresa). Los controles y resultados son los de `loadService`, más los marcos y la ubicación de cada control.
  abstract loadOverview(scope: TenantScope, serviceId: string): Promise<ServiceOverviewData | null>;

  // null si el servicio no existe (o es de otra empresa: RLS no deja verlo).
  abstract loadService(scope: TenantScope, serviceId: string): Promise<ServiceReadoutData | null>;

  // null si la acción no existe (o es de otra empresa). Trae solo ese control, pero con los activos y resultados de su servicio.
  abstract loadControl(scope: TenantScope, controlId: string, withLinkItems: boolean): Promise<ControlDetailData | null>;

  // Los OTROS controles vigentes del servicio que llevan cada uno de estos tests (D85): test → controles. Vacío si el control no existe para esta empresa.
  abstract sharedControlsOfTests(scope: TenantScope, controlId: string, testIds: string[]): Promise<Map<string, Array<{ id: string; code: string }>>>;
}
