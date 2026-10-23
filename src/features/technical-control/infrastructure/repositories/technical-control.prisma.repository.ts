import { Injectable } from '@nestjs/common';
import {
  ConnectionCategory,
  ConnectionMethodValue,
  DeploymentScenarioValue,
  NO_COVERAGE,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import { ResourceKindValue } from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page, PageRequest } from '../../../../common/pagination/page';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  Asset,
  AssetEdit,
  AssetFilters,
  ResourceListing,
  ResourceAttributes,
  Capability,
  NewAsset,
  ProbeTarget,
  TechnicalControlState,
} from '../../domain/entities/technical-control.entities';
import {
  AssetChange,
  ScenarioChange,
  TechnicalControlRepository,
} from '../../domain/repositories/technical-control.repository';

const ASSET_PREFIX = 'AST-';

// Las altas de una misma empresa se ponen en fila por el candado del código AST-####: con varias a
// la vez, la última espera a las demás y puede pasar de los 5 s que Prisma da por defecto a una
// transacción. Margen explícito para que ninguna alta legítima se pierda.
const ASSET_CREATION_TRANSACTION = { timeoutMs: 30_000 };

const ASSET_INCLUDE = {
  serviceAssets: { include: { service: { select: { id: true, name: true } } } },
  provisionings: { include: { automatedCapability: { select: { catalogCode: true } } } },
} as const;

// Selección explícita de la capacidad: `provider` NO está y no debe estar nunca (confidencialidad).
const CAPABILITY_SELECT = {
  catalogCode: true,
  category: true,
  // Las plataformas que el cliente elige (D67), en el orden del catálogo.
  platforms: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      code: true,
      name: true,
      logoKey: true,
      availability: true,
      connectionMethods: { orderBy: { sortOrder: 'asc' as const }, select: { connectionMethod: true } },
    },
  },
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

  // Qué conexiones ofrece cada escenario es un dato del catálogo (`deployment_scenario_capabilities`, D67), no una regla del código.
  private async categoriesFor(tx: TransactionClient, scenario: DeploymentScenarioValue): Promise<ConnectionCategory[]> {
    const rows = await tx.deploymentScenarioCapability.findMany({
      where: { deploymentScenario: scenario },
      select: { automatedCapability: { select: { catalogCode: true } } },
    });
    return rows.map((r) => r.automatedCapability.catalogCode as ConnectionCategory);
  }

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
      const allowed = await this.categoriesFor(tx, scenario);
      const orphaned = await tx.asset.findMany({
        where: { status: 'active', parentAssetId: null, serviceAssets: { some: { serviceId } }, connectionCategory: { notIn: [...allowed] } },
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
        const allowed = await this.categoriesFor(tx, service.deploymentScenario as DeploymentScenarioValue);
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
        select: { id: true, assetType: true },
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
          // El tipo del activo lo dice la conexión (D46, D67): el cliente no lo clasifica dos veces.
          type: capability.assetType,
          name: input.name,
          platform: input.platform,
          platformId: input.platformId,
          ipAddress: input.ipAddress,
          location: input.location,
          criticality: input.criticality as 'low',
          tags: input.tags,
          origin: 'declared',
          technicalCoverage: NO_COVERAGE,
          externalAccountId: input.externalAccountId,
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
          connectionMethod: input.connectionMethod,
          regions: input.regions,
          externalId: input.externalId,
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
        status: 'active' as const,
        // Las conexiones (y lo que el cliente registró a mano). Los activos descubiertos viven dentro de su conexión y se ven ahí (D61).
        parentAssetId: null,
        // Un activo sin aprovisionamiento no se puede mostrar como conexión (no tiene método, estado ni regiones): se omite en vez de tumbar toda la lista.
        provisionings: { some: {} },
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
      return row && row.status === 'active' && !row.parentAssetId && row.provisionings.length > 0 ? this.toAsset(row) : null;
    });
  }

  listResources(scope: TenantScope, assetId: string, filter: { kind?: ResourceKindValue; serviceId?: string }, page: PageRequest): Promise<ResourceListing | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId }, select: { status: true, parentAssetId: true, provisionings: { take: 1, select: { regions: true, inventoryAt: true, inventoryWarnings: true } } } });
      if (!asset || asset.status !== 'active' || asset.parentAssetId) return null;
      const { regions, inventoryAt, inventoryWarnings } = asset.provisionings[0] ?? { regions: [], inventoryAt: null, inventoryWarnings: [] };
      if (!inventoryAt) return { discoveredAt: null, regions, incompleteServices: [], summary: [], items: [], total: 0, includedCount: filter.serviceId ? 0 : null };
      // Los activos que el descubrimiento reconoció dentro de esta conexión (D61), solo de las regiones declaradas. Los recursos que únicamente conoce la evaluación
      // (usuarios, políticas…) no son activos que el cliente reconozca y no tienen activo propio.
      const base = { parentAssetId: assetId, status: 'active' as const, resource: { is: { kind: { not: 'other' }, OR: [{ region: null }, { region: { in: regions } }] } } };
      const where = { ...base, ...(filter.kind ? { resource: { is: { ...base.resource.is, kind: filter.kind } } } : {}) };
      const [groups, total, rows, included] = await Promise.all([
        tx.assetResource.groupBy({ by: ['kind'], where: { childAsset: { is: base }, kind: { not: 'other' } }, _count: { _all: true } }),
        tx.asset.count({ where }),
        tx.asset.findMany({
          where,
          orderBy: [{ resource: { kind: 'asc' } }, { name: 'asc' }, { code: 'asc' }],
          skip: (page.page - 1) * page.pageSize,
          take: page.pageSize,
          include: { resource: true, ...(filter.serviceId ? { serviceAssets: { where: { serviceId: filter.serviceId }, select: { id: true } } } : {}) },
        }),
        filter.serviceId ? tx.asset.count({ where: { ...base, serviceAssets: { some: { serviceId: filter.serviceId } } } }) : Promise.resolve(null),
      ]);
      return {
        discoveredAt: inventoryAt,
        regions,
        incompleteServices: inventoryWarnings,
        summary: groups.map((g) => ({ kind: g.kind as ResourceKindValue, count: g._count._all })),
        items: rows.map((r) => ({
          id: r.id,
          code: r.code,
          kind: (r.resource?.kind ?? 'other') as ResourceKindValue,
          type: r.resource?.resourceType ?? 'Other',
          name: r.name,
          region: r.resource?.region ?? null,
          platform: r.platform,
          ipAddress: r.ipAddress,
          location: r.location,
          criticality: r.criticality,
          tags: asStrings(r.tags),
          attributes: (r.resource?.attributes ?? {}) as ResourceAttributes,
          inService: filter.serviceId ? ((r as { serviceAssets?: unknown[] }).serviceAssets?.length ?? 0) > 0 : null,
        })),
        total,
        includedCount: included,
      };
    });
  }

  setServiceAssets(scope: TenantScope, serviceId: string, connectionId: string, assetIds: string[], audit: AuditIntent<{ added: number; removed: number; total: number }>) {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } });
      const connection = await tx.asset.findUnique({
        where: { id: connectionId },
        select: { status: true, parentAssetId: true, serviceAssets: { where: { serviceId }, select: { id: true } } },
      });
      // La conexión tiene que ser una conexión activa que sirva a ese servicio; si no, para esta empresa no existe.
      if (!service || !connection || connection.status !== 'active' || connection.parentAssetId || connection.serviceAssets.length === 0) throw new DomainError('NOT_FOUND');

      const wanted = [...new Set(assetIds)];
      const children = await tx.asset.findMany({ where: { parentAssetId: connectionId, status: 'active' }, select: { id: true, serviceAssets: { where: { serviceId }, select: { id: true } } } });
      const byId = new Map(children.map((c) => [c.id, c]));
      if (wanted.some((id) => !byId.has(id))) throw new ValidationException([{ field: 'asset_ids', code: 'invalid' }]);

      const toAdd = wanted.filter((id) => byId.get(id)!.serviceAssets.length === 0);
      const toRemove = children.filter((c) => c.serviceAssets.length > 0 && !wanted.includes(c.id)).map((c) => c.id);
      if (toAdd.length > 0) await tx.serviceAsset.createMany({ data: toAdd.map((assetId) => ({ tenantId: scope.companyId, assetId, serviceId })), skipDuplicates: true });
      if (toRemove.length > 0) await tx.serviceAsset.deleteMany({ where: { serviceId, assetId: { in: toRemove } } });
      const result = { added: toAdd.length, removed: toRemove.length, total: wanted.length };
      await insertAuditLog(tx, audit(result));
      return result;
    });
  }

  findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.asset.findUnique({
        where: { id, status: 'active', parentAssetId: null },
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
      const provisioning = await tx.assetProvisioning.findFirstOrThrow({ where: { assetId: id }, select: { id: true } });
      // Una conexión ya activa se puede volver a comprobar (refresca los activos encontrados), pero su estado manda: ni un éxito ni un fallo la mueven.
      const active = before.provisioning.isActive;
      await tx.assetProvisioning.update({
        where: { id: provisioning.id },
        data: active
          ? result.ok ? { lastValidatedAt: new Date() } : {}
          : result.ok
            ? { connectionStatus: 'validated', lastValidatedAt: new Date(), technicalCoverage: result.technicalCoverage }
            : { connectionStatus: 'failed' },
      });
      if (result.ok && result.technicalCoverage && !active) {
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

  // El cliente entrega el ARN del rol que creó en su cuenta. Un cambio de rol invalida la validación anterior (hay que comprobar de nuevo).
  setConnection(scope: TenantScope, id: string, roleArn: string, audit: AuditIntent<AssetChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (before.provisioning.connectionMethod !== 'readonly_role') throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');
      // Una conexión activa no se reconfigura en caliente: sería cambiar lo que se evalúa sin dejar constancia de una nueva comprobación.
      if (before.provisioning.isActive) throw new DomainError('ASSET_ALREADY_ACTIVE');
      await tx.assetProvisioning.update({ where: { id: before.provisioning.id }, data: { roleArn, connectionStatus: 'pending', lastValidatedAt: null } });
      const change = { before, after: await this.readAsset(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  updateAsset(scope: TenantScope, id: string, edit: AssetEdit, audit: AuditIntent<AssetChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (before.status !== 'active') throw new DomainError('NOT_FOUND');
      await this.assertNoOpenExecution(tx, id);
      await tx.asset.update({
        where: { id },
        data: {
          ...(edit.name !== undefined ? { name: edit.name } : {}),
          ...(edit.criticality !== undefined ? { criticality: edit.criticality as 'medium' } : {}),
          ...(edit.tags !== undefined ? { tags: edit.tags } : {}),
          ...(edit.externalAccountId !== undefined ? { externalAccountId: edit.externalAccountId } : {}),
          ...(edit.resetsConnection ? { operationalStatus: 'not_monitored' as const, technicalCoverage: NO_COVERAGE } : {}),
        },
      });
      await tx.assetProvisioning.update({
        where: { id: before.provisioning.id },
        data: {
          ...(edit.regions !== undefined ? { regions: edit.regions } : {}),
          ...(edit.roleArn !== undefined ? { roleArn: edit.roleArn } : {}),
          ...(edit.encryptedCredentials !== undefined ? { encryptedCredentials: edit.encryptedCredentials } : {}),
          ...(edit.externalId !== undefined ? { externalId: edit.externalId } : {}),
          ...(edit.resetsConnection ? { connectionStatus: 'pending' as const, isActive: false, scheduleFrequency: null, lastValidatedAt: null, technicalCoverage: NO_COVERAGE } : {}),
        },
      });
      const change = { before, after: await this.readAsset(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  retireAsset(scope: TenantScope, id: string, audit: AuditIntent<AssetChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (before.status !== 'active') throw new DomainError('NOT_FOUND');
      await this.assertNoOpenExecution(tx, id);
      await tx.asset.update({ where: { id }, data: { status: 'inactive', operationalStatus: 'not_monitored' } });
      // Los activos que descubrió esta conexión se van con ella: se dan de baja y se desenlazan de los servicios (D61). Su historial se conserva.
      const children = await tx.asset.findMany({ where: { parentAssetId: id, status: 'active' }, select: { id: true } });
      if (children.length > 0) {
        const ids = children.map((c) => c.id);
        await tx.serviceAsset.deleteMany({ where: { assetId: { in: ids } } });
        await tx.asset.updateMany({ where: { id: { in: ids } }, data: { status: 'inactive', operationalStatus: 'not_monitored' } });
      }
      // Al darlo de baja se borran las llaves guardadas (si las había): no hay razón para conservar un secreto de algo que ya no se evalúa.
      await tx.assetProvisioning.update({
        where: { id: before.provisioning.id },
        data: { connectionStatus: 'pending', isActive: false, scheduleFrequency: null, lastValidatedAt: null, encryptedCredentials: null },
      });
      const change = { before, after: await this.readAsset(tx, id, { allowInactive: true }) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  private async assertNoOpenExecution(tx: TransactionClient, assetId: string): Promise<void> {
    const open = await tx.execution.count({ where: { assetId, status: { in: ['queued', 'running'] } } });
    if (open > 0) throw new DomainError('EXECUTION_IN_PROGRESS');
  }

  scheduleAsset(scope: TenantScope, id: string, frequency: ScheduleFrequencyValue, audit: AuditIntent<AssetChange>) {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readAsset(tx, id);
      if (!before.provisioning.isActive) throw new DomainError('ASSET_NOT_ACTIVE');
      // Con qué frecuencia puede correr cada conexión es un dato del catálogo (`capability_frequencies`, D67).
      const supported = (
        await tx.capabilityFrequency.findMany({
          where: { automatedCapability: { catalogCode: before.connectionCategory } },
          select: { scheduleFrequency: true },
        })
      ).map((f) => f.scheduleFrequency as ScheduleFrequencyValue);
      if (!supported.includes(frequency)) throw new DomainError('FREQUENCY_NOT_SUPPORTED', { supported });
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

  // Un activo dado de baja no existe para nadie: no se valida, ni se activa, ni se programa, ni se edita (404). Solo la propia baja lo relee ya inactivo.
  private async readAsset(tx: TransactionClient, id: string, opts: { allowInactive?: boolean } = {}): Promise<Asset> {
    const row = await tx.asset.findUnique({ where: { id }, include: ASSET_INCLUDE });
    // Un activo descubierto no es una conexión: no se valida, activa ni programa por su cuenta (D61).
    if (!row || row.parentAssetId || (row.status !== 'active' && !opts.allowInactive)) throw new DomainError('NOT_FOUND');
    return this.toAsset(row);
  }

  private toAsset(row: {
    id: string;
    code: string;
    name: string;
    connectionCategory: ConnectionCategory;
    type: string;
    platform: string;
    platformId: string | null;
    ipAddress: string | null;
    location: string | null;
    criticality: string;
    tags: unknown;
    origin: string;
    status: string;
    operationalStatus: string;
    technicalCoverage: string;
    externalAccountId: string | null;
    serviceAssets: { service: { id: string; name: string } }[];
    provisionings: {
      id: string;
      connectionMethod: ConnectionMethodValue | null;
      regions: string[];
      externalId: string | null;
      roleArn: string | null;
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
      platformId: row.platformId,
      ipAddress: row.ipAddress,
      location: row.location,
      criticality: row.criticality,
      tags: asStrings(row.tags),
      origin: row.origin,
      status: row.status,
      operationalStatus: row.operationalStatus,
      technicalCoverage: row.technicalCoverage,
      externalAccountId: row.externalAccountId,
      services: row.serviceAssets.map((s) => s.service).sort((a, b) => a.name.localeCompare(b.name)),
      provisioning: {
        id: p.id,
        connectionMethod: p.connectionMethod,
        regions: p.regions,
        externalId: p.externalId,
        roleArn: p.roleArn,
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
      select: { deploymentScenario: true },
    });
    const scenario = service.deploymentScenario as DeploymentScenarioValue | null;

    const capabilities: Capability[] = scenario
      ? (
          await tx.automatedCapability.findMany({
            where: { catalogCode: { in: await this.categoriesFor(tx, scenario) } },
            select: CAPABILITY_SELECT,
            orderBy: { catalogCode: 'asc' },
          })
        ).map((c) => ({
          catalogCode: c.catalogCode as ConnectionCategory,
          category: c.category,
          platforms: c.platforms.map((p) => ({
            code: p.code,
            name: p.name,
            logoKey: p.logoKey,
            availability: p.availability,
            connectionMethods: p.connectionMethods.map((m) => m.connectionMethod as ConnectionMethodValue),
          })),
          method: c.method,
          requiredPermissions: asStrings(c.requiredPermissions),
          baseFrequency: c.baseFrequency,
          generatedEvidence: c.generatedEvidence,
        }))
      : [];

    return { deploymentScenario: scenario, applicableCapabilities: capabilities };
  }
}
