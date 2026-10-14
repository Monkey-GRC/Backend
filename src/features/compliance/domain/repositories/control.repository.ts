import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ReadoutAsset, ReadoutControl, ResultsIndex } from '../control-readout';

// Las acciones de protección de UN servicio (tenant.client_controls) y todo lo que hace falta para leerlas, cargado EN BLOQUE: la lista de un
// servicio recién clonado trae unas 80 y no puede hacer una consulta por control. Todo pasa por withScope: RLS impone el aislamiento entre empresas.

export type ServiceReadoutData = {
  serviceId: string;
  controls: ReadoutControl[];
  /** Los activos vigentes del servicio: el universo de los tests por dimensión. */
  assets: ReadoutAsset[];
  /** El último resultado de cada activo en cada test de cada control. */
  results: ResultsIndex;
};

export type ControlEvidence = {
  requirementId: string;
  code: string;
  sequence: number;
  description: string;
  dimension: string;
  validityWithinPeriod: string;
  origin: 'catalog' | 'own';
  responsible: { id: string; type: string; personName: string } | null;
  latestSubmission: { id: string; version: number; validationStatus: string } | null;
};

export type ControlDetailData = ServiceReadoutData & {
  evidence: ControlEvidence[];
  causes: Array<{ id: string; name: string }>;
};

export abstract class ControlRepository {
  // null si el servicio no existe (o es de otra empresa: RLS no deja verlo).
  abstract loadService(scope: TenantScope, serviceId: string): Promise<ServiceReadoutData | null>;

  // null si la acción no existe (o es de otra empresa). Trae solo ese control, pero con los activos y resultados de su servicio.
  abstract loadControl(scope: TenantScope, controlId: string): Promise<ControlDetailData | null>;
}
