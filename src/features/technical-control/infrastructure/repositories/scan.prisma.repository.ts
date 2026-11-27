import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CLOUD_MEASURED_DIMENSIONS, ConnectionCategory, DEFAULT_CRITICALITY, NO_COVERAGE, PROBE_MEASURED_DIMENSIONS, ResourceKindValue } from '../../../../common/catalogs/technical-catalogs';
import { DiscoveredResource, Inventory } from '../../domain/entities/technical-control.entities';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { captureControlStates, recordControlStateChanges } from '../../../compliance/infrastructure/shared/control-state-events';
import { collectDirectCheckFailures } from '../notifications/direct-check-failures.loader';
import { RUNNER_POOL } from '../../application/runner-pool';
import { FailedRow } from '../../domain/scan/findings';
import { interpretTestResult } from '../../domain/scan/interpret-evaluations';
import { ORGANIZATION_WIDE_PLATFORMS, withUnmeasured } from '../../domain/scan/unmeasured';
import { TestCheckLink } from '../../domain/scan/readiness';
import { InterpretedResult } from '../../domain/scan/scan.types';
import { MAIL_ONLY_CHECKS, mailReviewed } from '../../domain/scan/mail-review';
import {
  ClaimedExecution,
  ExecutionKindValue,
  ExecutionSummary,
  LoadedScan,
  RecordedScan,
  RunContext,
  ScanOutcome,
  ScanRepository,
  ScanRun,
  ScaOutcome,
} from '../../domain/repositories/scan.repository';
import { AgentReadingFacts, attemptOutcome, isNotReadyReason, NOT_READY_REASONS } from '../../domain/agent-reading/reading-plan';
import { CatalogPolicy } from '../../domain/sonda/catalog-lookup';

// El motor de nube no tiene «política» como la sonda: una constante conserva la clave de tres partes (D56).
const POLICY_ID = 'cloud_configuration';
const CHUNK = 1000;
const ASSET_PREFIX = 'AST-';

// Qué activo del catálogo del comité es cada clase de recurso descubierto: un servidor en la nube es `ac_02`, una base de datos en la nube `ac_03`; el almacenamiento
// y las funciones son servicios gestionados de la nube (`ac_01`).
const ASSET_SHAPE_BY_KIND: Record<string, { type: 'server' | 'database' | 'cloud_service' | 'application'; category: ConnectionCategory }> = {
  server: { type: 'server', category: 'ac_02' },
  database: { type: 'database', category: 'ac_03' },
  storage: { type: 'cloud_service', category: 'ac_01' },
  function: { type: 'application', category: 'ac_01' },
};
// Qué servicio de AWS lee cada clase: si uno no se pudo leer, no se da por desaparecido lo que ese servicio mostraba.
const KIND_BY_AWS_SERVICE: Record<string, string> = { ec2: 'server', rds: 'database', s3: 'storage', lambda: 'function' };

// La «plataforma» de un activo descubierto, dicha como la dice el cliente: el sistema operativo de un servidor, el motor de una base de datos.
function platformOf(r: DiscoveredResource): string {
  const at = r.attributes;
  const text = (k: string) => (typeof at[k] === 'string' && at[k] ? (at[k] as string) : null);
  switch (r.kind) {
    case 'server':
      return text('os') ?? text('platform') ?? 'Servidor en AWS';
    case 'database':
      return [text('engine'), text('engine_version')].filter(Boolean).join(' ') || 'Base de datos en AWS';
    case 'function':
      return text('runtime') ? `Lambda ${text('runtime')}` : 'Función en AWS';
    default:
      return 'Amazon S3';
  }
}
// Una corrida completa son cientos o miles de filas: margen explícito sobre los 5 s por defecto de Prisma.
const SCAN_TRANSACTION = { timeoutMs: 60_000 };

const chunks = <T>(items: T[], size = CHUNK): T[][] => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

@Injectable()
export class ScanPrismaRepository extends ScanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluationParameters: EvaluationParametersPort,
    private readonly config: ConfigService,
    private readonly notifications: NotificationEmitter,
    @Inject(RUNNER_POOL) private readonly runnerPool: string,
  ) {
    super();
  }

  executionPlatform(scope: TenantScope, executionId: string): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({ where: { id: executionId }, select: { asset: { select: { platform: true } } } });
      return execution?.asset.platform ?? null;
    });
  }

  assetPlatform(scope: TenantScope, assetId: string): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: assetId }, select: { platform: true } });
      return asset?.platform ?? null;
    });
  }

  async catalogChecks(platform: string): Promise<Map<string, string>> {
    // El catálogo se lee libre (RLS de `catalog`): no necesita empresa.
    const rows = await this.prisma.check.findMany({ where: { platform, policyId: POLICY_ID }, select: { id: true, checkId: true } });
    return new Map(rows.map((r) => [r.checkId, r.id]));
  }

  // ---- ciclo de vida (D57) ----------------------------------------------------------------

  queueExecution(scope: TenantScope, input: { assetId: string; origin: 'scheduled' | 'manual' }, audit: AuditIntent<{ executionId: string }>) {
    return this.prisma.withScope(scope, async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: input.assetId, status: 'active', parentAssetId: null }, select: { id: true } });
      if (!asset) throw new DomainError('NOT_FOUND');
      const provisioning = await tx.assetProvisioning.findFirst({ where: { assetId: input.assetId }, select: { connectionStatus: true, connectionMethod: true } });
      if (!provisioning) throw new DomainError('ASSET_NOT_VALIDATED');
      if (provisioning.connectionMethod === 'agent') {
        // Un servidor con agente se puede evaluar en cuanto su agente existe en la sonda (D113): no hay una «validación» previa que hacer, la lectura misma es la prueba.
        const agent = await tx.assetAgent.findFirst({ where: { assetId: input.assetId }, select: { agentId: true } });
        if (!agent?.agentId) throw new DomainError('ASSET_NOT_VALIDATED');
      } else if (!['validated', 'active', 'scheduled'].includes(provisioning.connectionStatus)) throw new DomainError('ASSET_NOT_VALIDATED');
      let executionId: string;
      try {
        const created = await tx.execution.create({ data: { tenantId: scope.companyId, assetId: input.assetId, status: 'queued', origin: input.origin, runnerPool: this.runnerPool }, select: { id: true } });
        executionId = created.id;
      } catch (e) {
        // El índice único parcial `executions_one_open_per_asset` decide: dos peticiones a la vez no pueden abrir dos.
        if ((e as { code?: string }).code === 'P2002') throw new DomainError('EXECUTION_IN_PROGRESS');
        throw e;
      }
      const queued = { executionId };
      await insertAuditLog(tx, audit(queued));
      return queued;
    });
  }

  listExecutions(scope: TenantScope, assetId: string, page: PageRequest): Promise<Page<ExecutionSummary>> {
    return this.prisma.withScope(scope, async (tx) => {
      // El historial es de evaluaciones: las validaciones (comprobar la conexión) no son «una evaluación» para el cliente.
      // Tampoco lo son las lecturas automáticas de un servidor que «todavía no estaba listo» (D113): son esperas, no evaluaciones, y cada 3 minutos serían cientos de filas.
      const visible = { assetId, kind: 'assessment' as const, NOT: { status: 'cancelled' as const, failureReason: { in: [...NOT_READY_REASONS] } } };
      const total = await tx.execution.count({ where: visible });
      const rows = await tx.execution.findMany({
        where: visible,
        orderBy: { queuedAt: 'desc' },
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
        select: { id: true, status: true, origin: true, queuedAt: true, startedAt: true, finishedAt: true, failureReason: true, progressPercentage: true },
      });
      // D157 · Se deriva de los resultados guardados, no se almacena.
      const completed = rows.filter((r) => r.status === 'completed').map((r) => r.id);
      const executionsWith = async (rawCheckIds?: string[]) => {
        if (completed.length === 0) return new Set<string>();
        const found = await tx.checkResult.findMany({
          where: { executionId: { in: completed }, platform: 'microsoft_365', ...(rawCheckIds ? { rawCheckId: { in: rawCheckIds }, result: { in: ['passed', 'failed'] } } : {}) },
          distinct: ['executionId'],
          select: { executionId: true },
        });
        return new Set(found.map((f) => f.executionId));
      };
      const microsoft365 = await executionsWith();
      const withMail = microsoft365.size > 0 ? await executionsWith(MAIL_ONLY_CHECKS) : new Set<string>();
      return { items: rows.map((r) => ({ ...r, mailReviewed: mailReviewed(r, microsoft365, withMail) })), total, page: page.page, pageSize: page.pageSize };
    });
  }

  // ---- la evaluación programada de nube (D158) ----

  async listDueCloudAssessments(input: { maxWaiting: number; retrySeconds: number }): Promise<{ tenantId: string; assetId: string }[]> {
    // Sin empresa: la función SECURITY DEFINER mira todas, solo lee y devuelve identificadores (SEG-47).
    type Row = { out_tenant_id: string; out_asset_id: string };
    const rows = await this.prisma.$queryRaw<Row[]>`SELECT * FROM tenant.list_due_cloud_assessments(${this.runnerPool}, ${input.maxWaiting}::int, ${input.retrySeconds}::int)`;
    return rows.map((r) => ({ tenantId: r.out_tenant_id, assetId: r.out_asset_id }));
  }

  async queueScheduledAssessment(scope: TenantScope, assetId: string): Promise<{ executionId: string } | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        // Se vuelve a mirar dentro de la empresa: el cliente pudo quitar o cambiar la conexión después de la lista.
        const asset = await tx.asset.findFirst({ where: { id: assetId, status: 'active', parentAssetId: null }, select: { id: true } });
        const provisioning = asset ? await tx.assetProvisioning.findFirst({ where: { assetId, isActive: true, connectionStatus: 'scheduled' }, select: { id: true } }) : null;
        if (!provisioning) return null;
        const created = await tx.execution.create({ data: { tenantId: scope.companyId, assetId, status: 'queued', origin: 'scheduled', kind: 'assessment', runnerPool: this.runnerPool }, select: { id: true } });
        return { executionId: created.id };
      });
    } catch (e) {
      // El índice único parcial `executions_one_open_per_asset` decide: otra pasada o el cliente ya abrió una.
      if ((e as { code?: string }).code === 'P2002') return null;
      throw e;
    }
  }

  async claimNext(kind?: ExecutionKindValue): Promise<ClaimedExecution | null> {
    // Solo del grupo de este backend (D112). Sin empresa: la función SECURITY DEFINER busca entre todas y solo toca el estado de UNA ejecución (SEG-47).
    type Row = { out_execution_id: string; out_tenant_id: string; out_asset_id: string; out_origin: string; out_kind: string };
    const rows = kind
      ? await this.prisma.$queryRaw<Row[]>`SELECT * FROM tenant.claim_next_execution(${kind}::tenant.execution_kind, ${this.runnerPool})`
      : await this.prisma.$queryRaw<Row[]>`SELECT * FROM tenant.claim_next_execution(NULL::tenant.execution_kind, ${this.runnerPool})`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return { executionId: r.out_execution_id, tenantId: r.out_tenant_id, assetId: r.out_asset_id, origin: r.out_origin as 'scheduled' | 'manual', kind: r.out_kind as ExecutionKindValue };
  }

  queueValidation(scope: TenantScope, assetId: string, _actorUserId: string | null, audit: AuditIntent<{ executionId: string }>) {
    return this.prisma.withScope(scope, async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: assetId, status: 'active', parentAssetId: null }, select: { id: true } });
      if (!asset) throw new DomainError('NOT_FOUND');
      let executionId: string;
      try {
        const created = await tx.execution.create({ data: { tenantId: scope.companyId, assetId, status: 'queued', origin: 'manual', kind: 'validation', runnerPool: this.runnerPool }, select: { id: true } });
        executionId = created.id;
      } catch (e) {
        // El índice único parcial `executions_one_open_per_asset` decide: un activo no tiene dos ejecuciones abiertas.
        if ((e as { code?: string }).code === 'P2002') throw new DomainError('EXECUTION_IN_PROGRESS');
        throw e;
      }
      const queued = { executionId };
      await insertAuditLog(tx, audit(queued));
      return queued;
    });
  }

  executionStatus(scope: TenantScope, executionId: string) {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.execution.findFirst({ where: { id: executionId }, select: { status: true, failureReason: true } });
      return row ? { status: row.status, failureReason: row.failureReason } : null;
    });
  }

  cancelQueued(scope: TenantScope, executionId: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const r = await tx.execution.updateMany({
        where: { id: executionId, kind: 'validation', status: 'queued' },
        data: { status: 'cancelled', finishedAt: new Date(), failureReason: 'execution.timed_out' },
      });
      return r.count > 0;
    });
  }

  completeValidation(scope: TenantScope, executionId: string, inventory: Inventory | null, audit: AuditIntent<{ executionId: string; resources: number | null }>) {
    return this.prisma.withScope(scope, async (tx) => {
      // Condicional: solo una validación en curso se cierra, y solo una vez.
      const closed = await tx.execution.updateMany({
        where: { id: executionId, kind: 'validation', status: 'running' },
        data: { status: 'completed', finishedAt: new Date(), progressPercentage: 100 },
      });
      if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
      if (inventory) {
        const execution = await tx.execution.findFirstOrThrow({ where: { id: executionId }, select: { assetId: true } });
        await this.writeInventory(tx, scope, execution.assetId, inventory);
      }
      const done = { executionId, resources: inventory ? inventory.resources.length : null };
      await insertAuditLog(tx, audit(done));
      return done;
    });
  }

  loadRunContext(scope: TenantScope, executionId: string): Promise<RunContext> {
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({ where: { id: executionId }, select: { id: true, assetId: true, origin: true, kind: true } });
      if (!execution) throw new DomainError('NOT_FOUND');
      const asset = await tx.asset.findFirst({
        where: { id: execution.assetId },
        select: { platform: true, externalAccountId: true, provisionings: { take: 1, select: { regions: true, connectionMethod: true, roleArn: true, externalId: true, projectNumber: true, appClientId: true, certificateThumbprint: true, encryptedCredentials: true } } },
      });
      if (!asset) throw new DomainError('NOT_FOUND');
      const prov = asset.provisionings[0];
      return {
        executionId: execution.id,
        assetId: execution.assetId,
        origin: execution.origin,
        kind: execution.kind,
        platform: asset.platform,
        externalAccountId: asset.externalAccountId,
        regions: prov?.regions ?? [],
        connectionMethod: prov?.connectionMethod ?? null,
        roleArn: prov?.roleArn ?? null,
        externalId: prov?.externalId ?? null,
        projectNumber: prov?.projectNumber ?? null,
        appClientId: prov?.appClientId ?? null,
        certificateThumbprint: prov?.certificateThumbprint ?? null,
        encryptedCredentials: prov?.encryptedCredentials ?? null,
      };
    });
  }

  completeExecution(scope: TenantScope, executionId: string, outcome: ScanOutcome, audit: AuditIntent<RecordedScan>): Promise<RecordedScan> {
    return this.prisma.withScope(
      scope,
      async (tx) => {
        // Condicional: solo una ejecución en curso se cierra, y solo una vez.
        const closed = await tx.execution.updateMany({
          where: { id: executionId, status: 'running' },
          data: { status: 'completed', finishedAt: outcome.finishedAt, progressPercentage: 100, engineVersion: outcome.engineVersion, regions: outcome.regions, checksExecuted: outcome.checksExecuted },
        });
        if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
        const execution = await tx.execution.findFirstOrThrow({ where: { id: executionId }, select: { assetId: true } });
        const recorded = await this.writeResults(tx, scope, executionId, execution.assetId, outcome);
        await insertAuditLog(tx, audit(recorded));
        return recorded;
      },
      SCAN_TRANSACTION,
    );
  }

  async setProgress(scope: TenantScope, executionId: string, percent: number): Promise<void> {
    await this.prisma.withScope(scope, (tx) => tx.execution.updateMany({ where: { id: executionId, status: 'running', progressPercentage: { lt: percent } }, data: { progressPercentage: percent } }));
  }

  failExecution(scope: TenantScope, executionId: string, reason: string, audit: AuditIntent<{ executionId: string }>) {
    return this.prisma.withScope(scope, async (tx) => {
      const closed = await tx.execution.updateMany({
        where: { id: executionId, status: 'running' },
        data: { status: 'failed', finishedAt: new Date(), failureReason: reason },
      });
      if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
      await tx.executionLog.create({ data: { tenantId: scope.companyId, executionId, loggedAt: new Date(), level: 'error', message: reason } });
      const failed = { executionId };
      await insertAuditLog(tx, audit(failed));
      return failed;
    });
  }

  recordCompletedScan(scope: TenantScope, run: ScanRun, audit: AuditIntent<RecordedScan>): Promise<RecordedScan> {
    return this.prisma.withScope(
      scope,
      async (tx) => {
        const asset = await tx.asset.findFirst({ where: { id: run.assetId }, select: { id: true } });
        if (!asset) throw new DomainError('NOT_FOUND');
        const execution = await tx.execution.create({
          data: {
            tenantId: scope.companyId,
            assetId: run.assetId,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            status: 'completed',
            progressPercentage: 100,
            origin: run.origin,
            runnerPool: this.runnerPool,
            engineVersion: run.engineVersion,
            regions: run.regions,
            checksExecuted: run.checksExecuted,
          },
          select: { id: true },
        });
        const recorded = await this.writeResults(tx, scope, execution.id, run.assetId, run);
        await insertAuditLog(tx, audit(recorded));
        return recorded;
      },
      SCAN_TRANSACTION,
    );
  }

  // Lo que el descubrimiento encontró en la cuenta (D59). Se crea lo nuevo y se actualiza lo conocido; lo que ya no aparece deja de mostrarse
  // porque su `last_seen_at` queda por debajo de `inventory_at` (no se borra: sus resultados siguen siendo evidencia).
  private async writeInventory(tx: TransactionClient, scope: TenantScope, assetId: string, inventory: Inventory): Promise<void> {
    const seenAt = new Date();
    for (const part of chunks(inventory.resources.map((r) => r.uid))) {
      const known = new Set((await tx.assetResource.findMany({ where: { assetId, resourceUid: { in: part } }, select: { resourceUid: true } })).map((r) => r.resourceUid));
      const byUid = new Map(inventory.resources.filter((r) => part.includes(r.uid)).map((r) => [r.uid, r]));
      await tx.assetResource.createMany({
        data: [...byUid.values()].filter((r) => !known.has(r.uid)).map((r) => ({
          tenantId: scope.companyId,
          assetId,
          resourceUid: r.uid,
          resourceType: r.type,
          kind: r.kind,
          name: r.name,
          region: r.region,
          attributes: r.attributes,
          firstSeenAt: seenAt,
          lastSeenAt: seenAt,
        })),
      });
      for (const uid of known) {
        const r = byUid.get(uid)!;
        await tx.assetResource.updateMany({ where: { assetId, resourceUid: uid }, data: { resourceType: r.type, kind: r.kind, name: r.name, region: r.region, attributes: r.attributes, lastSeenAt: seenAt } });
      }
    }
    await tx.assetProvisioning.updateMany({ where: { assetId }, data: { inventoryAt: seenAt, inventoryWarnings: inventory.warnings } });
    await this.syncDiscoveredAssets(tx, scope, assetId, inventory, seenAt);
  }

  // Cada recurso descubierto es un ACTIVO del cliente (D61): con su código, su IP, sus etiquetas y su criticidad, enlazable a los servicios. Se crea el que es nuevo, se
  // actualiza lo que se conoce (sin pisar la criticidad ni el responsable que fijó el cliente) y el que ya no aparece pasa a inactivo y se desenlaza de los servicios.
  private async syncDiscoveredAssets(tx: TransactionClient, scope: TenantScope, connectionId: string, inventory: Inventory, seenAt: Date): Promise<void> {
    const parent = await tx.asset.findUniqueOrThrow({ where: { id: connectionId }, select: { organizationId: true, externalAccountId: true } });
    const resources = await tx.assetResource.findMany({
      where: { assetId: connectionId, resourceUid: { in: inventory.resources.map((r) => r.uid) }, kind: { not: 'other' } },
      select: { id: true, resourceUid: true, kind: true, childAsset: { select: { id: true } } },
    });
    const byUid = new Map(inventory.resources.map((r) => [r.uid, r]));

    // Código AST-#### consecutivo por empresa; el candado evita que dos descubrimientos simultáneos calculen el mismo número.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${parent.organizationId}))`;
    const codes = await tx.asset.findMany({ where: { organizationId: parent.organizationId }, select: { code: true } });
    let next = codes.reduce((max, { code }) => Math.max(max, Number(code.slice(ASSET_PREFIX.length)) || 0), 0) + 1;

    for (const resource of resources) {
      const found = byUid.get(resource.resourceUid);
      if (!found) continue;
      const data = {
        name: found.name ?? found.uid.split(/[/:]/).pop() ?? found.uid,
        platform: platformOf(found),
        ipAddress: typeof found.attributes['private_ip'] === 'string' ? (found.attributes['private_ip'] as string) : null,
        location: (typeof found.attributes['availability_zone'] === 'string' ? (found.attributes['availability_zone'] as string) : found.region) ?? null,
        tags: found.tags,
        status: 'active' as const,
        externalAccountId: parent.externalAccountId,
      };
      if (resource.childAsset) {
        await tx.asset.update({ where: { id: resource.childAsset.id }, data });
        continue;
      }
      const { type, category } = ASSET_SHAPE_BY_KIND[resource.kind as ResourceKindValue] ?? ASSET_SHAPE_BY_KIND['storage'];
      await tx.asset.create({
        data: {
          ...data,
          tenantId: scope.companyId,
          organizationId: parent.organizationId,
          parentAssetId: connectionId,
          resourceId: resource.id,
          code: `${ASSET_PREFIX}${String(next++).padStart(4, '0')}`,
          connectionCategory: category,
          type,
          criticality: DEFAULT_CRITICALITY as 'medium',
          origin: 'discovered',
          operationalStatus: 'not_monitored',
          technicalCoverage: NO_COVERAGE,
        },
      });
    }

    // Lo que ya no aparece: se da de baja y se desenlaza de los servicios. Si un servicio de AWS no se pudo leer en este descubrimiento, sus activos NO se tocan
    // (no sabemos si siguen ahí).
    const unreadable = new Set(inventory.warnings.flatMap((w) => (w === 'timeout' ? Object.keys(ASSET_SHAPE_BY_KIND) : [KIND_BY_AWS_SERVICE[w]].filter((k): k is string => !!k))));
    const missing = await tx.asset.findMany({
      where: { parentAssetId: connectionId, status: 'active', resource: { is: { lastSeenAt: { lt: seenAt }, kind: { notIn: [...unreadable, 'other'] } } } },
      select: { id: true },
    });
    if (missing.length > 0) {
      const ids = missing.map((m) => m.id);
      await tx.serviceAsset.deleteMany({ where: { assetId: { in: ids } } });
      await tx.asset.updateMany({ where: { id: { in: ids } }, data: { status: 'inactive' } });
    }
  }

  // Recursos, resultados y bitácora de UNA corrida, dentro de la transacción que ya abrió quien llama.
  private async writeResults(tx: TransactionClient, scope: TenantScope, executionId: string, assetId: string, run: ScanOutcome): Promise<RecordedScan> {
    const { platform: assetPlatform } = await tx.asset.findFirstOrThrow({ where: { id: assetId }, select: { platform: true } });
    const PLATFORM = assetPlatform.trim().toLowerCase();
    const catalog = await tx.check.findMany({ where: { platform: PLATFORM, policyId: POLICY_ID }, select: { id: true, checkId: true } });
    const checkIds = new Map(catalog.map((c) => [c.checkId, c.id]));
    const missing = [...new Set(run.results.map((r) => r.checkId))].filter((c) => !checkIds.has(c));
    if (missing.length > 0) throw new Error(`Checks de la corrida que no están en el catálogo: ${missing.slice(0, 5).join(', ')}`);

    // Recursos: el activo (la cuenta) los contiene. Se crean los nuevos y se marca la vista de los que ya estaban.
    const resources = new Map<string, InterpretedResult>();
    for (const r of run.results) if (r.resourceUid) resources.set(r.resourceUid, r);
    const uids = [...resources.keys()];
    for (const part of chunks(uids)) {
      await tx.assetResource.createMany({
        data: part.map((uid) => {
          const r = resources.get(uid)!;
          return {
            tenantId: scope.companyId,
            assetId,
            resourceUid: uid,
            resourceType: r.resourceType ?? 'Other',
            name: r.resourceName,
            region: r.regions.length === 1 ? r.regions[0] : null,
            firstSeenAt: run.finishedAt,
            lastSeenAt: run.finishedAt,
          };
        }),
        skipDuplicates: true,
      });
      await tx.assetResource.updateMany({ where: { assetId, resourceUid: { in: part } }, data: { lastSeenAt: run.finishedAt } });
    }
    const resourceIds = new Map<string, string>();
    for (const part of chunks(uids)) {
      const found = await tx.assetResource.findMany({ where: { assetId, resourceUid: { in: part } }, select: { id: true, resourceUid: true } });
      found.forEach((f) => resourceIds.set(f.resourceUid, f.id));
    }

    // `not_applicable` no se guarda (D56): se deriva de «ejecutado menos lo que devolvió filas».
    const persisted = run.results.filter((r) => r.result !== 'not_applicable');
    for (const part of chunks(persisted)) {
      await tx.checkResult.createMany({
        data: part.map((r) => ({
          tenantId: scope.companyId,
          executionId,
          checkId: checkIds.get(r.checkId)!,
          platform: PLATFORM,
          policyId: POLICY_ID,
          rawCheckId: r.checkId,
          result: r.result,
          evaluatedAt: run.finishedAt,
          assetResourceId: r.resourceUid ? resourceIds.get(r.resourceUid)! : null,
          // Una evaluación fundida entre regiones es de cuenta: sin región.
          region: r.regions.length === 1 ? r.regions[0] : null,
          statusDetail: r.detail,
          engineSeverity: r.severity,
        })),
      });
    }
    if (run.logs.length > 0) {
      await tx.executionLog.createMany({
        data: run.logs.map((l) => ({ tenantId: scope.companyId, executionId, loggedAt: run.finishedAt, level: l.level, message: l.message })),
      });
    }
    await this.writeEvaluations(tx, scope, executionId, assetId, run.finishedAt);
    await this.notifyDirectFailures(tx, scope, executionId, assetId, 'cloud');
    return { executionId, resultCount: persisted.length, resourceCount: uids.length };
  }

  // D153 · Los checks Directos que pasaron a FAIL respecto de la recolección anterior del mismo activo avisan en la MISMA transacción que cierra la recolección (si se revierte, el aviso también).
  private async notifyDirectFailures(tx: TransactionClient, scope: TenantScope, executionId: string, assetId: string, source: 'cloud' | 'sca'): Promise<void> {
    const includeProposed = this.config.get<string>('READINESS_INCLUDE_PROPOSED')?.trim().toLowerCase() === 'true';
    const events = await collectDirectCheckFailures(tx, { executionId, assetId, source, includeProposed, parameters: await this.evaluationParameters.load(tx), now: new Date() });
    await this.notifications.emitForControls(tx, scope.companyId, events);
  }

  // Lo que una corrida devolvió, ya interpretado. Con un servicio, un recurso con activo propio que NO es de ese servicio no se mide para él.
  // `childAssetId`: el activo propio del recurso medido (D61), si lo tiene; lo que es de toda la cuenta va sin él.
  private async executionResults(tx: TransactionClient, executionId: string, serviceId?: string): Promise<(InterpretedResult & { checkUuid: string; childAssetId: string | null })[]> {
    const rows = await tx.checkResult.findMany({
      where: { executionId },
      select: {
        result: true,
        region: true,
        statusDetail: true,
        engineSeverity: true,
        check: { select: { id: true, checkId: true } },
        assetResource: {
          select: {
            resourceUid: true,
            resourceType: true,
            name: true,
            childAsset: { select: { id: true, serviceAssets: { where: serviceId ? { serviceId } : {}, select: { id: true } } } },
          },
        },
      },
    });
    const scoped = serviceId ? rows.filter((r) => !r.assetResource?.childAsset || r.assetResource.childAsset.serviceAssets.length > 0) : rows;
    return scoped.map((r) => ({
      checkUuid: r.check.id,
      childAssetId: r.assetResource?.childAsset?.id ?? null,
      checkId: r.check.checkId,
      resourceKey: r.assetResource?.resourceUid ?? null,
      resourceUid: r.assetResource?.resourceUid ?? null,
      resourceType: r.assetResource?.resourceType ?? null,
      resourceName: r.assetResource?.name ?? null,
      regions: r.region ? [r.region] : [],
      result: r.result,
      severity: r.engineSeverity,
      detail: r.statusDetail,
    }));
  }

  // DT-50: lo que la corrida dijo de cada test pasa a `evaluations`, que es lo que lee el cumplimiento (controles, categorías, marco). Una fila por control del
  // servicio, test y activo (la conexión y, D160, cada recurso elegido en el que algo se midió); el histórico no se pisa: la lectura toma la más reciente. Solo cuentan los checks que el comité ratificó (D56), salvo en
  // desarrollo y demostración (`READINESS_INCLUDE_PROPOSED`), igual que la preparación del activo. Corre en la misma transacción que los resultados.
  //
  // `source`: de dónde vienen los resultados. `cloud` (el motor de nube, tests de nube, aplicación, base de datos o servidores con Directos de su plataforma, D160; checks por su código del motor) o `sca` (la sonda de un servidor, tests de
  // servidor, base de datos o aplicación; los checks se identifican por su id del catálogo, porque el mismo número de check se repite entre políticas distintas).
  private async writeEvaluations(tx: TransactionClient, scope: TenantScope, executionId: string, assetId: string, evaluatedAt: Date, source: 'cloud' | 'sca' = 'cloud'): Promise<number> {
    const includeProposed = this.config.get<string>('READINESS_INCLUDE_PROPOSED')?.trim().toLowerCase() === 'true';
    const services = await tx.serviceAsset.findMany({ where: { assetId }, select: { serviceId: true } });
    if (services.length === 0) return 0;
    const parameters = await this.evaluationParameters.load(tx);
    // D160 · La plataforma de la conexión de nube: de una prueba solo cuentan sus Directos de ESA plataforma (el mismo código de check existe en más de una nube).
    const platform = source === 'cloud' ? ((await tx.asset.findFirst({ where: { id: assetId }, select: { platform: true } }))?.platform?.trim().toLowerCase() ?? null) : null;
    const organizationWide = platform && ORGANIZATION_WIDE_PLATFORMS.includes(platform) ? platform : null;
    let written = 0;
    for (const { serviceId } of services) {
      // La versión del catálogo con la que se evalúa: la del marco contratado más antiguo del servicio (D36; hoy un servicio clona de una sola versión).
      const framework = await tx.serviceFramework.findFirst({ where: { serviceId, status: 'active' }, orderBy: { contractedAt: 'asc' }, select: { catalogVersionId: true } });
      if (!framework) continue;
      const links = await tx.clientControlTest.findMany({
        where: { clientControl: { serviceId, isActive: true }, test: { dimension: { in: [...(source === 'cloud' ? CLOUD_MEASURED_DIMENSIONS : PROBE_MEASURED_DIMENSIONS)] } } },
        // v2 (RC-04): solo los vínculos `direct` deciden la prueba; los de módulo («N/A», `check_id` nulo) los ignora el motor.
        select: { clientControlId: true, testId: true, test: { select: { dimension: true, testChecks: { where: { role: 'direct' as const, checkId: { not: null } }, select: { provenance: true, check: { select: { id: true, checkId: true, platform: true } } } } } } },
      });
      if (links.length === 0) continue;
      // D91 · Si lo que la sonda midió mueve el estado de un control, queda su evento: sin persona detrás (usuario nulo).
      const before = await captureControlStates(tx, serviceId, parameters);
      const read = await this.executionResults(tx, executionId, serviceId);
      const results = source === 'cloud' ? read : read.map((r) => ({ ...r, checkId: r.checkUuid }));
      // D160 · Cada recurso que el servicio eligió es un activo (D61) y lleva su propio resultado; lo que es de toda la cuenta (usuarios, políticas, lo que no tiene activo
      // propio) se queda en la conexión.
      const ofConnection = results.filter((r) => !r.childAssetId);
      const ofResource = new Map<string, typeof results>();
      for (const r of results) if (r.childAssetId) ofResource.set(r.childAssetId, [...(ofResource.get(r.childAssetId) ?? []), r]);
      const rows = links.flatMap((l) => {
        const usable = l.test.testChecks.flatMap((t) => (t.check && (includeProposed || t.provenance === 'committee_ratified') ? [t.check] : []));
        if (usable.length === 0) return []; // sin checks ratificados, la sonda no mide este test: queda pendiente, no «no aplica»
        const mine = source === 'cloud' ? usable.filter((c) => c.platform === platform) : usable;
        const checkIds = new Set(mine.map((c) => (source === 'cloud' ? c.checkId : c.id)));
        // D159 · En Microsoft 365, un Directo de esa plataforma que no volvió es «Sin datos», no «No aplica».
        const expected = organizationWide ? mine.map((c) => c.checkId) : [];
        const row = (measuredAssetId: string, out: ReturnType<typeof interpretTestResult>) => ({
          tenantId: scope.companyId,
          serviceId,
          clientControlId: l.clientControlId,
          testId: l.testId,
          assetId: measuredAssetId,
          catalogVersionId: framework.catalogVersionId,
          evaluatedAt,
          dimension: l.test.dimension,
          result: out.result,
          rawProbeResult: out.rawProbeResult,
          diagnosticPercentage: out.diagnosticPercentage,
          origin: 'automated' as const,
        });
        // La conexión siempre deja su fila (también «no aplica»): es lo que la saca del alcance de una prueba que no la mide. Un recurso, solo si algo se midió en él.
        const perResource = [...ofResource].flatMap(([childAssetId, own]) => {
          const out = interpretTestResult(checkIds, own);
          return out.result === 'not_applicable' ? [] : [row(childAssetId, out)];
        });
        return [row(assetId, interpretTestResult(checkIds, withUnmeasured(expected, ofConnection))), ...perResource];
      });
      for (const part of chunks(rows)) await tx.evaluation.createMany({ data: part });
      written += rows.length;
      await recordControlStateChanges(tx, { parameters, tenantId: scope.companyId, serviceId, before, cause: 'probe_result', notifications: this.notifications, actor: { userId: null, ipAddress: null, userAgent: null } });
    }
    return written;
  }

  // D159 · La plataforma del activo, solo si es de las que revisan la organización entera. Sale de la CONEXIÓN y no de lo que volvió: una corrida sin ninguna fila también dejó todo sin medir.
  private async organizationWidePlatform(tx: TransactionClient, assetId: string): Promise<string | null> {
    const asset = await tx.asset.findFirst({ where: { id: assetId }, select: { platform: true } });
    return asset?.platform && ORGANIZATION_WIDE_PLATFORMS.includes(asset.platform) ? asset.platform : null;
  }

  loadLatestScan(scope: TenantScope, assetId: string, serviceId?: string): Promise<LoadedScan | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({
        where: { assetId, status: 'completed', kind: 'assessment' },
        orderBy: { finishedAt: 'desc' },
        select: { id: true, finishedAt: true, engineVersion: true, regions: true, checksExecuted: true },
      });
      if (!execution) return null;

      const results = await this.executionResults(tx, execution.id, serviceId);

      const checkUuids = [...new Set(results.map((r) => r.checkUuid))];
      // D159 · En Microsoft 365 se esperan todos sus Directos, hayan vuelto o no: lo que falta cuenta como sin medir y no puede dejar el activo «listo».
      const organizationWide = await this.organizationWidePlatform(tx, assetId);
      const linkRows = await tx.testCheck.findMany({
        where: { role: 'direct', test: { dimension: { in: [...CLOUD_MEASURED_DIMENSIONS] } }, OR: [{ checkId: { in: checkUuids } }, ...(organizationWide ? [{ check: { platform: organizationWide } }] : [])] },
        select: { provenance: true, check: { select: { checkId: true, platform: true } }, test: { select: { code: true } } },
      });
      const links: TestCheckLink[] = linkRows.flatMap((l) => (l.check ? [{ testCode: l.test.code, checkId: l.check.checkId, provenance: l.provenance }] : []));
      const expected = linkRows.flatMap((l) => (l.check && l.check.platform === organizationWide ? [l.check.checkId] : []));

      return { executionId: execution.id, finishedAt: execution.finishedAt, engineVersion: execution.engineVersion, regions: execution.regions, checksExecuted: execution.checksExecuted, results: withUnmeasured(expected, results.map(({ checkUuid: _checkUuid, childAssetId: _childAssetId, ...r }) => r)), links };
    });
  }

  // ---- la lectura automática de la sonda (D113) ----

  async listAgentReadingCandidates(input: { windowSeconds: number; refreshSeconds: number }): Promise<AgentReadingFacts[]> {
    // Sin empresa: la función SECURITY DEFINER mira todas, solo lee y devuelve lo mínimo para decidir (SEG-47).
    type Row = { out_tenant_id: string; out_asset_id: string; out_status: string; out_last_sync: Date | null; out_enrolled_at: Date | null; out_last_status: string | null; out_last_at: Date | null };
    const rows = await this.prisma.$queryRaw<Row[]>`SELECT * FROM tenant.list_agent_reading_candidates(${input.windowSeconds}::int, ${input.refreshSeconds}::int)`;
    return rows.map((r) => ({
      tenantId: r.out_tenant_id,
      assetId: r.out_asset_id,
      status: r.out_status as AgentReadingFacts['status'],
      enrolledAt: r.out_enrolled_at,
      lastSyncAt: r.out_last_sync,
      lastAttempt: r.out_last_status && r.out_last_at ? { outcome: attemptOutcome(r.out_last_status), at: r.out_last_at } : null,
    }));
  }

  async queueAgentReading(scope: TenantScope, assetId: string): Promise<{ executionId: string } | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        const agent = await tx.assetAgent.findFirst({ where: { assetId, agentId: { not: null }, status: { not: 'removed' }, asset: { status: 'active', parentAssetId: null } }, select: { id: true } });
        if (!agent) return null;
        try {
          const created = await tx.execution.create({ data: { tenantId: scope.companyId, assetId, status: 'queued', origin: 'scheduled', kind: 'assessment', runnerPool: this.runnerPool }, select: { id: true } });
          return { executionId: created.id };
        } catch (e) {
          // El índice único parcial `executions_one_open_per_asset` decide: otra pasada (u otra instancia del backend) ya la dejó en cola.
          if ((e as { code?: string }).code === 'P2002') throw new DomainError('EXECUTION_IN_PROGRESS');
          throw e;
        }
      });
    } catch (e) {
      if (e instanceof DomainError && e.code === 'EXECUTION_IN_PROGRESS') return null;
      throw e;
    }
  }

  async settleAgentReading(scope: TenantScope, executionId: string, reason: string, audit: AuditIntent<{ executionId: string; assetId: string }>): Promise<boolean> {
    if (!isNotReadyReason(reason)) return false;
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({ where: { id: executionId, status: 'running', kind: 'assessment', origin: 'scheduled' }, select: { assetId: true } });
      if (!execution) return false;
      const agent = await tx.assetAgent.findFirst({ where: { assetId: execution.assetId }, select: { id: true, status: true } });
      if (!agent) return false;
      const closed = await tx.execution.updateMany({ where: { id: executionId, status: 'running' }, data: { status: 'cancelled', finishedAt: new Date(), failureReason: reason } });
      if (closed.count === 0) return false;
      // Estaba conectado y la sonda dice que ya no: es un cambio de estado real y se audita. Un servidor que nunca se conectó sigue «esperando».
      if (reason === 'connection.agent_disconnected' && agent.status === 'connected') {
        await tx.assetAgent.update({ where: { id: agent.id }, data: { status: 'disconnected' } });
        await insertAuditLog(tx, audit({ executionId, assetId: execution.assetId }));
      }
      return true;
    });
  }

  // ---- servidores con agente de la sonda (D113) ----

  loadAgentLink(scope: TenantScope, executionId: string): Promise<{ tenantId: string; assetId: string; agentId: string | null } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Con la empresa que dijo el trabajador: si miente, RLS no encuentra la ejecución y no hay vínculo (la lectura se rechaza).
      const execution = await tx.execution.findFirst({ where: { id: executionId }, select: { tenantId: true, assetId: true } });
      if (!execution) return null;
      const agent = await tx.assetAgent.findFirst({ where: { assetId: execution.assetId }, select: { agentId: true } });
      return agent ? { tenantId: execution.tenantId, assetId: execution.assetId, agentId: agent.agentId } : null;
    });
  }

  async scaCatalog(policies: readonly { scaId: string; name: string }[]): Promise<CatalogPolicy[]> {
    // El catálogo se lee libre (RLS de `catalog`). Se busca por id (lo normal) y, si el id no está, por el nombre que el comité le dio (con o sin el punto final).
    const ids = [...new Set(policies.map((p) => p.scaId))];
    const names = [...new Set(policies.flatMap((p) => [p.name, p.name.trim().replace(/\.$/, ''), `${p.name.trim().replace(/\.$/, '')}.`]))];
    const rows = await this.prisma.scaPolicy.findMany({
      where: { OR: [{ scaId: { in: ids } }, { benchmark: { in: names } }] },
      select: { scaId: true, benchmark: true, checks: { select: { id: true, platform: true, checkId: true } } },
    });
    return rows.map((r) => ({ scaId: r.scaId, benchmark: r.benchmark, checks: r.checks }));
  }

  completeSca(scope: TenantScope, executionId: string, outcome: ScaOutcome, audit: AuditIntent<{ executionId: string; resultCount: number }>): Promise<{ executionId: string; resultCount: number }> {
    return this.prisma.withScope(
      scope,
      async (tx) => {
        // Condicional: solo una evaluación en curso se cierra, y solo una vez.
        const closed = await tx.execution.updateMany({
          where: { id: executionId, kind: 'assessment', status: 'running' },
          data: { status: 'completed', finishedAt: outcome.finishedAt, progressPercentage: 100, engineVersion: outcome.sondaVersion, regions: [], checksExecuted: outcome.checksExecuted },
        });
        if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
        const { assetId } = await tx.execution.findFirstOrThrow({ where: { id: executionId }, select: { assetId: true } });

        // `not_applicable` no se guarda (D56): se deriva de «ejecutado menos lo que devolvió filas».
        const persisted = outcome.rows.filter((r) => r.result !== 'not_applicable');
        for (const part of chunks(persisted)) {
          await tx.checkResult.createMany({
            data: part.map((r) => ({ tenantId: scope.companyId, executionId, checkId: r.checkId, platform: r.platform, policyId: r.policyId, rawCheckId: r.rawCheckId, result: r.result, evaluatedAt: r.evaluatedAt, statusDetail: r.statusDetail })),
          });
        }
        if (outcome.logs.length > 0) {
          await tx.executionLog.createMany({ data: outcome.logs.map((l) => ({ tenantId: scope.companyId, executionId, loggedAt: outcome.finishedAt, level: l.level, message: l.message })) });
        }

        // Las esperas anteriores («todavía no estaba listo») ya cumplieron su trabajo: ya hay una lectura de verdad. Se borran para no acumular cientos de filas sin valor por servidor.
        await tx.execution.deleteMany({ where: { assetId, kind: 'assessment', status: 'cancelled', failureReason: { in: [...NOT_READY_REASONS] } } });
        // El servidor entregó una lectura: la sonda está conectada. Es lo que enciende «Conectado» en la pantalla.
        await tx.assetAgent.updateMany({ where: { assetId, agentId: outcome.agentId }, data: { status: 'connected', lastSeenAt: outcome.finishedAt, lastSyncAt: outcome.finishedAt } });
        await tx.assetAgent.updateMany({ where: { assetId, agentId: outcome.agentId, firstSeenAt: null }, data: { firstSeenAt: outcome.finishedAt } });
        // Su conexión pasa a activa (igual que la de nube tras comprobarse): ya se puede evaluar cuando se pida.
        await tx.assetProvisioning.updateMany({ where: { assetId, connectionStatus: { in: ['pending', 'failed', 'validated'] } }, data: { connectionStatus: 'active', isActive: true, lastValidatedAt: outcome.finishedAt } });

        // La fecha de la medición es la que dijo la sonda (la más reciente de sus políticas), no la de leerla.
        const measuredAt = persisted.reduce<Date>((latest, r) => (r.evaluatedAt > latest ? r.evaluatedAt : latest), persisted[0]?.evaluatedAt ?? outcome.finishedAt);
        await this.writeEvaluations(tx, scope, executionId, assetId, measuredAt, 'sca');
        await this.notifyDirectFailures(tx, scope, executionId, assetId, 'sca');

        const recorded = { executionId, resultCount: persisted.length };
        await insertAuditLog(tx, audit(recorded));
        return recorded;
      },
      SCAN_TRANSACTION,
    );
  }

  findAutomatedTestOfControl(scope: TenantScope, controlId: string, testId: string): Promise<{ serviceId: string; responsibleUserIds: string[] } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.clientControlTest.findFirst({
        // Automáticas son las que miden la nube y la sonda de servidores (`server`, `database`, `app`); `policy` es documental.
        where: { clientControlId: controlId, testId, test: { dimension: { in: ['cloud', 'server', 'database', 'app'] } }, clientControl: { isActive: true } },
        select: { clientControl: { select: { serviceId: true } } },
      });
      if (!link) return null;
      const serviceId = link.clientControl.serviceId;
      // D102 · Lo automático que falla en la nube le llega al dueño y al ejecutor ACTIVOS del control. MISMA regla en `compliance/.../control-access.loader.ts` y `services/.../service.prisma.repository.ts` (`assignedTo`): un cambio toca los tres.
      const assignment = await tx.clientControlAssignment.findUnique({
        where: { clientControlId: controlId },
        select: { ownerId: true, executorId: true, owner: { select: { status: true } }, executor: { select: { status: true } } },
      });
      const responsibleUserIds = assignment
        ? [assignment.owner.status === 'active' ? assignment.ownerId : null, assignment.executorId && assignment.executor?.status === 'active' ? assignment.executorId : null].filter((u): u is string => !!u)
        : [];
      return { serviceId, responsibleUserIds };
    });
  }

  // D90 · Misma regla de alcance que las evaluaciones: un recurso con activo propio solo cuenta si es de este servicio; lo demás (la cuenta entera) es de todos.
  loadFailedRows(scope: TenantScope, input: { serviceId: string; testId: string; includeProposed: boolean }): Promise<{ measuredAt: Date | null; rows: FailedRow[] }> {
    return this.prisma.withScope(scope, async (tx) => {
      const connections = await tx.serviceAsset.findMany({
        where: { serviceId: input.serviceId, asset: { parentAssetId: null, status: 'active' } },
        select: { assetId: true, asset: { select: { name: true, agent: { select: { id: true } } } } },
      });
      const links = await tx.testCheck.findMany({
        where: { testId: input.testId, role: 'direct' as const, checkId: { not: null }, ...(input.includeProposed ? {} : { provenance: 'committee_ratified' as const }) },
        select: { checkId: true },
      });
      const checkIds = links.flatMap((l) => (l.checkId ? [l.checkId] : []));
      let measuredAt: Date | null = null;
      const rows: FailedRow[] = [];
      if (checkIds.length === 0) return { measuredAt, rows };
      for (const { assetId, asset } of connections) {
        // Un servidor con agente no tiene recursos hallados: el recurso afectado ES el servidor, y el cliente lo reconoce por el nombre que él le dio.
        const serverName = asset.agent ? asset.name : null;
        const execution = await tx.execution.findFirst({ where: { assetId, status: 'completed', kind: 'assessment' }, orderBy: { finishedAt: 'desc' }, select: { id: true, finishedAt: true } });
        if (!execution) continue;
        if (execution.finishedAt && (!measuredAt || execution.finishedAt > measuredAt)) measuredAt = execution.finishedAt;
        const failed = await tx.checkResult.findMany({
          where: { executionId: execution.id, result: 'failed', checkId: { in: checkIds } },
          select: {
            region: true,
            engineSeverity: true,
            check: { select: { id: true, titleEn: true, titleEs: true, remediation: true, remediationEs: true, translationOrigin: true } },
            assetResource: {
              select: {
                resourceUid: true,
                name: true,
                region: true,
                childAsset: { select: { serviceAssets: { where: { serviceId: input.serviceId }, select: { id: true } } } },
              },
            },
          },
        });
        for (const r of failed) {
          if (r.assetResource?.childAsset && r.assetResource.childAsset.serviceAssets.length === 0) continue;
          rows.push({
            checkUuid: r.check.id,
            severity: r.engineSeverity,
            titleEn: r.check.titleEn,
            titleEs: r.check.titleEs,
            remediation: r.check.remediation,
            remediationEs: r.check.remediationEs,
            translationOrigin: r.check.translationOrigin,
            resourceName: r.assetResource?.name ?? serverName,
            resourceUid: r.assetResource?.resourceUid ?? null,
            region: r.region ?? r.assetResource?.region ?? null,
          });
        }
      }
      return { measuredAt, rows };
    });
  }}
