import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { ResourceKindValue } from '../../../../common/catalogs/technical-catalogs';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import {
  DeploymentScenarioValue,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import {
  Asset,
  AssetEdit,
  ResourceListing,
  AssetFilters,
  NewAsset,
  ProbeTarget,
  TechnicalControlState,
} from '../entities/technical-control.entities';

export type AssetChange = { before: Asset; after: Asset };
export type ScenarioChange = { before: DeploymentScenarioValue | null; state: TechnicalControlState };

// Todo el Componente 3 de UNA empresa. Pasa por withScope: RLS impone el aislamiento entre
// empresas. Un servicio o activo de otra empresa simplemente no existe para quien pregunta.
// Toda acción que cambia datos recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).
export abstract class TechnicalControlRepository {
  // ---- escenario y scope (por servicio) ----
  // null si el servicio no existe. Lanza CAPABILITY_NOT_APPLICABLE si el nuevo escenario deja
  // fuera la conexión de un activo que ya está registrado en ese servicio.
  abstract setDeploymentScenario(
    scope: TenantScope,
    serviceId: string,
    scenario: DeploymentScenarioValue,
    audit: AuditIntent<ScenarioChange>,
  ): Promise<ScenarioChange | null>;
  abstract getState(scope: TenantScope, serviceId: string): Promise<TechnicalControlState | null>;

  // ---- activos (de la organización; se enlazan a servicios) ----
  // Lanza ORGANIZATION_NOT_DECLARED, DEPLOYMENT_SCENARIO_NOT_SET, CAPABILITY_NOT_APPLICABLE y un
  // 422 si algún service_ids o el responsable no existe.
  abstract createAsset(scope: TenantScope, input: NewAsset, audit: AuditIntent<Asset>): Promise<Asset>;
  abstract listAssets(scope: TenantScope, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>>;
  abstract findAsset(scope: TenantScope, id: string): Promise<Asset | null>;
  // Los activos que el descubrimiento encontró en la cuenta, en las regiones declaradas. Null si el activo no existe.
  abstract listResources(scope: TenantScope, assetId: string, filter: { kind?: ResourceKindValue }, page: PageRequest): Promise<ResourceListing | null>;

  // Lo que la sonda necesita, leído FUERA de la transacción de escritura para no tener la base
  // abierta mientras se comprueba una conexión.
  abstract findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null>;
  // Una conexión activa se puede volver a comprobar: solo se anota la fecha, su estado no cambia.
  abstract recordValidation(
    scope: TenantScope,
    id: string,
    result: { ok: boolean; technicalCoverage?: string },
    audit: AuditIntent<AssetChange>,
  ): Promise<AssetChange>;
  // Lanza ASSET_NOT_VALIDATED / ASSET_ALREADY_ACTIVE.
  abstract activateAsset(
    scope: TenantScope,
    id: string,
    operationalStatus: 'operational' | 'warning',
    audit: AuditIntent<AssetChange>,
  ): Promise<AssetChange>;
  // Lanza ASSET_NOT_ACTIVE / FREQUENCY_NOT_SUPPORTED.
  // Fija el ARN del rol de solo lectura (canal `readonly_role`). Lanza CONNECTION_METHOD_NOT_APPLICABLE si el activo no usa ese canal y
  // ASSET_ALREADY_ACTIVE si ya está activo. La conexión vuelve a `pending`: hay que comprobarla de nuevo.
  abstract setConnection(scope: TenantScope, id: string, roleArn: string, audit: AuditIntent<AssetChange>): Promise<AssetChange>;
  // Edita un activo. Si `resetsConnection`, la activación y la programación se pierden y la conexión vuelve a `pending`.
  // Lanza EXECUTION_IN_PROGRESS si hay una evaluación o comprobación en curso.
  abstract updateAsset(scope: TenantScope, id: string, edit: AssetEdit, audit: AuditIntent<AssetChange>): Promise<AssetChange>;
  // Da de baja un activo (`status = inactive`): deja de listarse y de evaluarse, pero su historial se conserva. Lanza EXECUTION_IN_PROGRESS.
  abstract retireAsset(scope: TenantScope, id: string, audit: AuditIntent<AssetChange>): Promise<AssetChange>;
  abstract scheduleAsset(
    scope: TenantScope,
    id: string,
    frequency: ScheduleFrequencyValue,
    audit: AuditIntent<AssetChange>,
  ): Promise<AssetChange>;
}
