import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ServiceReadoutData } from '../controls/control.repository';

// Lectura de `GET /v1/assignments` (contracts/gestion-usuarios.md · Asignación de controles): los controles vigentes de cada servicio que entra en la consulta, con el estado que el motor
// calcula por servicio y con quién los tiene a cargo. Todo pasa por withScope: RLS impone el aislamiento entre empresas.

export type AssignedPerson = { id: string; name: string | null; lastName: string | null; role: string };
/** `ownerActive`/`executorActive`: solo la persona activa decide quién ve el control (D102); la inactiva se sigue mostrando a quien ve todo. */
export type AssignmentRecord = { owner: AssignedPerson; executor: AssignedPerson | null; ownerActive: boolean; executorActive: boolean };

export type AssignmentLoadFilters = {
  serviceId?: string;
  frameworkId?: string;
  assignment?: 'unassigned' | 'assigned';
  ownerId?: string;
  executorId?: string;
  /** Un `responsable` o `delegado`: solo los servicios donde tiene algún control (acota el cálculo; la regla de visibilidad la aplica el caso de uso). */
  involvedUserId?: string;
};

export type AssignmentServiceData = { id: string; name: string; readout: ServiceReadoutData };

export type AssignmentListingData = {
  services: AssignmentServiceData[];
  /** Control → su dueño y ejecutor; un control «Sin asignar» no aparece. */
  assignments: ReadonlyMap<string, AssignmentRecord>;
  /** Solo con `framework_id`: control → códigos de los requisitos de ese marco que cubre. */
  frameworkRequirements: ReadonlyMap<string, ReadonlySet<string>> | null;
};

export abstract class AssignmentRepository {
  // Un número fijo de consultas por servicio (el de `loadServiceSnapshot`), sin importar cuántos controles tenga.
  abstract load(scope: TenantScope, filters: AssignmentLoadFilters): Promise<AssignmentListingData>;
}
