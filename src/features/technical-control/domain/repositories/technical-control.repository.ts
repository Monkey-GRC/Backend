import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import {
  DeploymentScenarioValue,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import {
  Asset,
  AssetFilters,
  NewAsset,
  ProbeTarget,
  ScopeCounts,
  TechnicalControlState,
} from '../entities/technical-control.entities';

// Todo el Componente 3 de UNA empresa. Pasa por withScope: RLS impone el aislamiento entre
// empresas. Un servicio o activo de otra empresa simplemente no existe para quien pregunta.
export abstract class TechnicalControlRepository {
  // ---- escenario y scope (por servicio) ----
  // null si el servicio no existe. Lanza CAPABILITY_NOT_APPLICABLE si el nuevo escenario deja
  // fuera la conexión de un activo que ya está registrado en ese servicio.
  abstract setDeploymentScenario(
    scope: TenantScope,
    serviceId: string,
    scenario: DeploymentScenarioValue,
  ): Promise<{ before: DeploymentScenarioValue | null; state: TechnicalControlState } | null>;
  abstract setScope(
    scope: TenantScope,
    serviceId: string,
    counts: ScopeCounts,
  ): Promise<{ before: ScopeCounts | null; state: TechnicalControlState } | null>;
  abstract getState(scope: TenantScope, serviceId: string): Promise<TechnicalControlState | null>;

  // ---- activos (de la organización; se enlazan a servicios) ----
  // Lanza ORGANIZATION_NOT_DECLARED, DEPLOYMENT_SCENARIO_NOT_SET, CAPABILITY_NOT_APPLICABLE y un
  // 422 si algún service_ids o el responsable no existe.
  abstract createAsset(scope: TenantScope, input: NewAsset): Promise<Asset>;
  abstract listAssets(scope: TenantScope, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>>;
  abstract findAsset(scope: TenantScope, id: string): Promise<Asset | null>;

  // Lo que la sonda necesita, leído FUERA de la transacción de escritura para no tener la base
  // abierta mientras se comprueba una conexión.
  abstract findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null>;
  abstract recordValidation(
    scope: TenantScope,
    id: string,
    result: { ok: boolean; technicalCoverage?: string },
  ): Promise<{ before: Asset; after: Asset }>;
  // Lanza ASSET_NOT_VALIDATED / ASSET_ALREADY_ACTIVE.
  abstract activateAsset(
    scope: TenantScope,
    id: string,
    operationalStatus: 'operational' | 'warning',
  ): Promise<{ before: Asset; after: Asset }>;
  // Lanza ASSET_NOT_ACTIVE / FREQUENCY_NOT_SUPPORTED.
  abstract scheduleAsset(
    scope: TenantScope,
    id: string,
    frequency: ScheduleFrequencyValue,
  ): Promise<{ before: Asset; after: Asset }>;
}
