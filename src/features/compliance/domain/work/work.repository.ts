import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { ConnectedIntegrationCategories } from '../evidence/test-evidence-source';
import type { WorkItem } from './work-bucket';

// Lo que `GET /v1/me/work` y `GET /v1/team/workload` necesitan además del estado de cada control (que sale de `AssignmentRepository.load`): qué se entregó de cada pieza que el control
// pide y cuántas observaciones abiertas tiene. Todo pasa por withScope.

export type WorkPerson = { id: string; name: string | null; lastName: string | null; role: string };

export type ControlDeliveries = {
  /** Las piezas del control: evidencias requeridas de sus pruebas documentales y veredictos de sus pruebas manuales no documentales. */
  items: WorkItem[];
  openObservations: number;
};

export abstract class WorkRepository {
  // Un número fijo de consultas, sin importar cuántos controles se pidan. Un control sin piezas ni observaciones sale con `items: []` y cero.
  // `connected`: las categorías de integración conectadas de cada servicio (se resuelven fuera de la transacción); decide qué pruebas aceptan subida (`workPieceOf`).
  abstract deliveriesOf(scope: TenantScope, controlIds: string[], connected: ReadonlyMap<string, ConnectedIntegrationCategories>): Promise<Map<string, ControlDeliveries>>;

  /** Los `responsable` y `delegado` activos de la empresa y los `admin_empresa` activos (de ellos solo importan los que son dueños de algún control). */
  abstract people(scope: TenantScope): Promise<WorkPerson[]>;
}
