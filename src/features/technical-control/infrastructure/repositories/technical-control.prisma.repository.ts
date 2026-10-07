import { Injectable } from '@nestjs/common';
import {
  ASSET_TYPE_BY_CATEGORY,
  ConnectionCategory,
  DeploymentScenarioValue,
  FREQUENCIES_BY_CATEGORY,
  NO_COVERAGE,
  SCENARIO_CAPABILITIES,
  SCOPE_KEYS,
  SCOPE_KEY_BY_ASSET_TYPE,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page, PageRequest } from '../../../../common/pagination/page';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  Asset,
  AssetFilters,
  Capability,
  NewAsset,
  ProbeTarget,
  Scope,
  ScopeCounts,
  TechnicalControlState,
} from '../../domain/entities/technical-control.entities';
import {
  AssetChange,
  ScenarioChange,
  ScopeChange,
  TechnicalControlRepository,
} from '../../domain/repositories/technical-control.repository';

const ASSET_PREFIX = 'AST-';

// Las altas de una misma empresa se ponen en fila por el candado del código AST-####: con varias a
// la vez, la última espera a las demás y puede pasar de los 5 s que Prisma da por defecto a una
// transacción. Margen explícito para que ninguna alta legítima se pierda.
const ASSET_CREATION_TRANSACTION = { timeoutMs: 30_000 };
// Una conexión ya comprobada cuenta como «conectada» frente a lo que el cliente declaró.
const CONNECTED_STATUSES = ['validated', 'active', 'scheduled'] as const;

const ASSET_INCLUDE = {
  serviceAssets: { include: { service: { select: { id: true, name: true } } } },
  provisionings: { include: { automatedCapability: { select: { catalogCode: true } } } },
} as const;

// Selección explícita de la capacidad: `provider` NO está y no debe estar nunca (confidencialidad).
const CAPABILITY_SELECT = {
  catalogCode: true,
  category: true,
  supportedPlatforms: true,
  method: true,
  requiredPermissions: true,
  baseFrequency: true,
  generatedEvidence: true,
} as const;

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

@Injectable()
export class TechnicalControlPrismaRepository extends TechnicalControlRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // ---- escenario y scope ----------------------------------------------------------------------

  setDeploymentScenario(
    scope: TenantScope,
    serviceId: string,
    scenario: DeploymentScenarioValue,
    audit: AuditIntent<ScenarioChange>,
  ) {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findUnique({
        where: { id: serviceId },
        select: { id: true, deploymentScenario: true },
      });
      if (!service) return null;

      // Cambiar de escenario no puede dejar huérfana una conexión ya registrada en este servicio.
      const allowed = SCENARIO_CAPABILITIES[scenario];
      const orphaned = await tx.asset.findMany({
        where: { serviceAssets: { some: { serviceId } }, connectionCategory: { notIn: [...allowed] } },
        select: { code: true },
      });
      if (orphaned.length > 0) {
        throw new DomainError('CAPABILITY_NOT_APPLICABLE', { assets: orphaned.map((a) => a.code) });
      }

      await tx.service.update({ where: { id: serviceId }, data: { deploymentScenario: scenario } });
      const change = {
        before: service.deploymentScenario as DeploymentScenarioValue | null,
        state: await this.state(tx, serviceId),
      };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  setScope(scope: TenantScope, serviceId: string, counts: ScopeCounts, audit: AuditIntent<ScopeChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } });
      if (!service) return null;
      const existing = await tx.scope.findUnique({ where: { serviceId } });
      const data = {
        serverCount: counts.server_count,
        cloudCount: counts.cloud_count,
        appCount: counts.app_count,
        databaseCount: counts.database_count,
        endpointCount: counts.endpoint_count,
      };
      await tx.scope.upsert({
        where: { serviceId },
        create: { tenantId: scope.companyId, serviceId, ...data },
        update: data,
      });
      const change = {
        before: existing
          ? {
              server_count: existing.serverCount,
              cloud_count: existing.cloudCount,
              app_count: existing.appCount,
              database_count: existing.databaseCount,
              endpoint_count: existing.endpointCount,
            }
          : null,
        state: await this.state(tx, serviceId),
      };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  getState(scope: TenantScope, serviceId: string): Promise<TechnicalControlState | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } });
      return service ? this.state(tx, serviceId) : null;
    });
  }

  // ---- activos --------------------------------------------------------------------------------

  createAsset(scope: TenantScope, input: NewAsset, audit: AuditIntent<Asset>): Promise<Asset> {
    return this.prisma.withScope(scope, async (tx) => {
      const organization = await tx.organization.findUnique({
        where: { companyId: scope.companyId },
        select: { id: true },
      });
      if (!organization) throw new DomainError('ORGANIZATION_NOT_DECLARED');

      const services = await tx.service.findMany({
        where: { id: { in: input.serviceIds }, organizationId: organization.id },
        select: { id: true, name: true, deploymentScenario: true },
      });
      if (services.length !== new Set(input.serviceIds).size) {
        throw new ValidationException([{ field: 'service_ids', code: 'invalid' }]);
      }
      for (const service of services) {
        if (!service.deploymentScenario) {
          throw new DomainError('DEPLOYMENT_SCENARIO_NOT_SET', { service: service.name });
        }
        const allowed = SCENARIO_CAPABILITIES[service.deploymentScenario as DeploymentScenarioValue];
        if (!allowed.includes(input.connectionCategory)) {
          throw new DomainError('CAPABILITY_NOT_APPLICABLE', { service: service.name });
        }
      }
      if (input.responsibleId) {
        const responsible = await tx.organizationResponsible.findFirst({
          where: { id: input.responsibleId, organizationId: organization.id },
          select: { id: true },
        });
        if (!responsible) throw new ValidationException([{ field: 'responsible_id', code: 'invalid' }]);
      }
      const capability = await tx.automatedCapability.findUnique({
        where: { catalogCode: input.connectionCategory },
        select: { id: true },
      });
      if (!capability) throw new Error(`Falta sembrar la capacidad ${input.connectionCategory}`);

      // Código AST-0001 consecutivo por empresa. El candado evita que dos altas simultáneas
      // calculen el mismo número; la unicidad (organización, código) es la red de seguridad.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${organization.id}))`;
      const codes = await tx.asset.findMany({ where: { organizationId: organization.id }, select: { code: true } });
      const next = codes.reduce((max, { code }) => Math.max(max, Number(code.slice(ASSET_PREFIX.length)) || 0), 0) + 1;

      const asset = await tx.asset.create({
        data: {
          tenantId: scope.companyId,
          organizationId: organization.id,
          responsibleId: input.responsibleId,
          code: `${ASSET_PREFIX}${String(next).padStart(4, '0')}`,
          connectionCategory: input.connectionCategory,
          type: ASSET_TYPE_BY_CATEGORY[input.connectionCategory],
          name: input.name,
          platform: input.platform,
          ipAddress: input.ipAddress,
          location: input.location,
          criticality: input.criticality as 'low',
          tags: input.tags,
          origin: 'declared',
          technicalCoverage: NO_COVERAGE,
        },
        select: { id: true },
      });
      await tx.serviceAsset.createMany({
        data: input.serviceIds.map((serviceId) => ({ tenantId: scope.companyId, assetId: asset.id, serviceId })),
      });
      await tx.assetProvisioning.create({
        data: {
          tenantId: scope.companyId,
          assetId: asset.id,
          automatedCapabilityId: capability.id,
          technicalCoverage: NO_COVERAGE,
          encryptedCredentials: input.encryptedCredentials,
        },
      });
      const created = await this.readAsset(tx, asset.id);
      await insertAuditLog(tx, audit(created));
      return created;
    }, ASSET_CREATION_TRANSACTION);
  }

  listAssets(scope: TenantScope, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = {
        organization: { companyId: scope.companyId },
        ...(filters.serviceId ? { serviceAssets: { some: { serviceId: filters.serviceId } } } : {}),
        ...(filters.connectionCategory ? { connectionCategory: filters.connectionCategory } : {}),
        ...(filters.operationalStatus ? { operationalStatus: filters.operationalStatus as 'operational' } : {}),
      };
      const total = await tx.asset.count({ where });
      const rows = await tx.asset.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
        include: ASSET_INCLUDE,
      });
      return { items: rows.map((r) => this.toAsset(r)), total, page: page.page, pageSize: page.pageSize };
    });
  }

  findAsset(scope: TenantScope, id: string): Promise<Asset | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.asset.findUnique({ where: { id }, include: ASSET_INCLUDE });
      return row ? this.toAsset(row) : null;
    });
  }

  findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.asset.findUnique({
        where: { id },
        select: {
          id: true,
          connectionCategory: true,
          platform: true,
          ipAddress: true,
          provisionings: { select: { connectionStatus: true, encryptedCredentials: true }, take: 1 },
        },
      });
      const provisioning = row?.provisionings[0];
      if (!row || !provisioning) return null;
      return {
        assetId: row.id,
        category: row.connectionCategory,
        platform: row.platform,
        ipAddress: row.ipAddress,
        connectionStatus: provisioning.connectionStatus,
        encryptedCredentials: provisioning.encryptedCredentials,
      };
    });
  }

  recordValidation(
    scope: TenantScope,
    id: string,
    result: { ok: boolean; technicalCoverage?: string },
    audit: AuditIntent<AssetChange>,
  ) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      // Una conexión ya activa no se vuelve a validar (su estado manda).
      if (before.provisioning.isActive) throw new DomainError('ASSET_ALREADY_ACTIVE');
      const provisioning = await tx.assetProvisioning.findFirstOrThrow({ where: { assetId: id }, select: { id: true } });
      await tx.assetProvisioning.update({
        where: { id: provisioning.id },
        data: result.ok
          ? { connectionStatus: 'validated', lastValidatedAt: new Date(), technicalCoverage: result.technicalCoverage }
          : { connectionStatus: 'failed' },
      });
      if (result.ok && result.technicalCoverage) {
        await tx.asset.update({ where: { id }, data: { technicalCoverage: result.technicalCoverage } });
      }
      const change = { before, after: await this.readAsset(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  activateAsset(
    scope: TenantScope,
    id: string,
    operationalStatus: 'operational' | 'warning',
    audit: AuditIntent<AssetChange>,
  ) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (before.provisioning.isActive) throw new DomainError('ASSET_ALREADY_ACTIVE');
      // Condicional: dos activaciones simultáneas no pueden ganar las dos.
      const changed = await tx.assetProvisioning.updateMany({
        where: { id: before.provisioning.id, connectionStatus: 'validated', isActive: false },
        data: { connectionStatus: 'active', isActive: true },
      });
      if (changed.count === 0) throw new DomainError('ASSET_NOT_VALIDATED');
      await tx.asset.update({ where: { id }, data: { operationalStatus } });
      const change = { before, after: await this.readAsset(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  scheduleAsset(scope: TenantScope, id: string, frequency: ScheduleFrequencyValue, audit: AuditIntent<AssetChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (!before.provisioning.isActive) throw new DomainError('ASSET_NOT_ACTIVE');
      if (!FREQUENCIES_BY_CATEGORY[before.connectionCategory].includes(frequency)) {
        throw new DomainError('FREQUENCY_NOT_SUPPORTED', {
          supported: FREQUENCIES_BY_CATEGORY[before.connectionCategory],
        });
      }
      await tx.assetProvisioning.update({
        where: { id: before.provisioning.id },
        data: { connectionStatus: 'scheduled', scheduleFrequency: frequency },
      });
      const change = { before, after: await this.readAsset(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  // ---- lectura --------------------------------------------------------------------------------

  private async readAsset(tx: TransactionClient, id: string): Promise<Asset> {
    const row = await tx.asset.findUnique({ where: { id }, include: ASSET_INCLUDE });
    if (!row) throw new DomainError('NOT_FOUND');
    return this.toAsset(row);
  }

  private toAsset(row: {
    id: string;
    code: string;
    name: string;
    connectionCategory: ConnectionCategory;
    type: string;
    platform: string;
    ipAddress: string | null;
    location: string | null;
    criticality: string;
    tags: unknown;
    origin: string;
    status: string;
    operationalStatus: string;
    technicalCoverage: string;
    serviceAssets: { service: { id: string; name: string } }[];
    provisionings: {
      id: string;
      connectionStatus: string;
      lastValidatedAt: Date | null;
      isActive: boolean;
      scheduleFrequency: string | null;
      automatedCapability: { catalogCode: string };
    }[];
  }): Asset {
    const p = row.provisionings[0];
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      connectionCategory: row.connectionCategory,
      type: row.type,
      platform: row.platform,
      ipAddress: row.ipAddress,
      location: row.location,
      criticality: row.criticality,
      tags: asStrings(row.tags),
      origin: row.origin,
      status: row.status,
      operationalStatus: row.operationalStatus,
      technicalCoverage: row.technicalCoverage,
      services: row.serviceAssets.map((s) => s.service).sort((a, b) => a.name.localeCompare(b.name)),
      provisioning: {
        id: p.id,
        automatedCapabilityCode: p.automatedCapability.catalogCode as ConnectionCategory,
        connectionStatus: p.connectionStatus,
        lastValidatedAt: p.lastValidatedAt,
        isActive: p.isActive,
        scheduleFrequency: p.scheduleFrequency as ScheduleFrequencyValue | null,
      },
    };
  }

  private async state(tx: TransactionClient, serviceId: string): Promise<TechnicalControlState> {
    const service = await tx.service.findUniqueOrThrow({
      where: { id: serviceId },
      select: { deploymentScenario: true, scope: true },
    });
    const scenario = service.deploymentScenario as DeploymentScenarioValue | null;

    const capabilities: Capability[] = scenario
      ? (
          await tx.automatedCapability.findMany({
            where: { catalogCode: { in: [...SCENARIO_CAPABILITIES[scenario]] } },
            select: CAPABILITY_SELECT,
            orderBy: { catalogCode: 'asc' },
          })
        ).map((c) => ({
          catalogCode: c.catalogCode as ConnectionCategory,
          category: c.category,
          supportedPlatforms: asStrings(c.supportedPlatforms),
          method: c.method,
          requiredPermissions: asStrings(c.requiredPermissions),
          baseFrequency: c.baseFrequency,
          generatedEvidence: c.generatedEvidence,
        }))
      : [];

    let declared: Scope | null = null;
    if (service.scope) {
      const counts: ScopeCounts = {
        server_count: service.scope.serverCount,
        cloud_count: service.scope.cloudCount,
        app_count: service.scope.appCount,
        database_count: service.scope.databaseCount,
        endpoint_count: service.scope.endpointCount,
      };
      const connected = await this.connectedCounts(tx, serviceId);
      declared = {
        id: service.scope.id,
        counts,
        declaredTotal: SCOPE_KEYS.reduce((sum, k) => sum + counts[k], 0),
        connectedTotal: SCOPE_KEYS.reduce((sum, k) => sum + connected[k], 0),
        connected,
      };
    }
    return { deploymentScenario: scenario, applicableCapabilities: capabilities, scope: declared };
  }

  // Lo declarado frente a lo conectado: un activo cuenta cuando su conexión ya se comprobó.
  private async connectedCounts(tx: TransactionClient, serviceId: string): Promise<ScopeCounts> {
    const assets = await tx.asset.findMany({
      where: {
        serviceAssets: { some: { serviceId } },
        provisionings: { some: { connectionStatus: { in: [...CONNECTED_STATUSES] } } },
      },
      select: { type: true },
    });
    const counts: ScopeCounts = {
      server_count: 0,
      cloud_count: 0,
      app_count: 0,
      database_count: 0,
      endpoint_count: 0,
    };
    for (const { type } of assets) {
      const key = SCOPE_KEY_BY_ASSET_TYPE[type];
      if (key) counts[key] += 1;
    }
    return counts;
  }
}
