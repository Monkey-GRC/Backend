import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { TestCheckLink } from '../../domain/scan/readiness';
import { InterpretedResult } from '../../domain/scan/scan.types';
import { LoadedScan, RecordedScan, ScanRepository, ScanRun } from '../../domain/repositories/scan.repository';

// El motor de nube no tiene «política» como la sonda: una constante conserva la clave de tres partes (D56).
const PLATFORM = 'aws';
const POLICY_ID = 'cloud_configuration';
const CHUNK = 1000;
// Una corrida completa son cientos o miles de filas: margen explícito sobre los 5 s por defecto de Prisma.
const SCAN_TRANSACTION = { timeoutMs: 60_000 };

const chunks = <T>(items: T[], size = CHUNK): T[][] => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

@Injectable()
export class ScanPrismaRepository extends ScanRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async catalogChecks(platform: string): Promise<Map<string, string>> {
    // El catálogo se lee libre (RLS de `catalog`): no necesita empresa.
    const rows = await this.prisma.check.findMany({ where: { platform, policyId: POLICY_ID }, select: { id: true, checkId: true } });
    return new Map(rows.map((r) => [r.checkId, r.id]));
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
            engineVersion: run.engineVersion,
            regions: run.regions,
            checksExecuted: run.checksExecuted,
          },
          select: { id: true },
        });

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
                assetId: run.assetId,
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
          await tx.assetResource.updateMany({ where: { assetId: run.assetId, resourceUid: { in: part } }, data: { lastSeenAt: run.finishedAt } });
        }
        const resourceIds = new Map<string, string>();
        for (const part of chunks(uids)) {
          const found = await tx.assetResource.findMany({ where: { assetId: run.assetId, resourceUid: { in: part } }, select: { id: true, resourceUid: true } });
          found.forEach((f) => resourceIds.set(f.resourceUid, f.id));
        }

        // `not_applicable` no se guarda (D56): se deriva de «ejecutado menos lo que devolvió filas».
        const persisted = run.results.filter((r) => r.result !== 'not_applicable');
        for (const part of chunks(persisted)) {
          await tx.checkResult.createMany({
            data: part.map((r) => ({
              tenantId: scope.companyId,
              executionId: execution.id,
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
            data: run.logs.map((l) => ({ tenantId: scope.companyId, executionId: execution.id, loggedAt: run.finishedAt, level: l.level, message: l.message })),
          });
        }

        const recorded = { executionId: execution.id, resultCount: persisted.length, resourceCount: uids.length };
        await insertAuditLog(tx, audit(recorded));
        return recorded;
      },
      SCAN_TRANSACTION,
    );
  }

  recordFailedScan(
    scope: TenantScope,
    run: Pick<ScanRun, 'assetId' | 'origin' | 'startedAt' | 'finishedAt' | 'engineVersion' | 'regions'> & { reason: string },
    audit: AuditIntent<{ executionId: string }>,
  ) {
    return this.prisma.withScope(scope, async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: run.assetId }, select: { id: true } });
      if (!asset) throw new DomainError('NOT_FOUND');
      const execution = await tx.execution.create({
        data: {
          tenantId: scope.companyId,
          assetId: run.assetId,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          status: 'failed',
          progressPercentage: 0,
          origin: run.origin,
          engineVersion: run.engineVersion,
          regions: run.regions,
        },
        select: { id: true },
      });
      await tx.executionLog.create({ data: { tenantId: scope.companyId, executionId: execution.id, loggedAt: run.finishedAt, level: 'error', message: run.reason } });
      const recorded = { executionId: execution.id };
      await insertAuditLog(tx, audit(recorded));
      return recorded;
    });
  }

  loadLatestScan(scope: TenantScope, assetId: string): Promise<LoadedScan | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({
        where: { assetId, status: 'completed' },
        orderBy: { finishedAt: 'desc' },
        select: { id: true, finishedAt: true, engineVersion: true, regions: true, checksExecuted: true },
      });
      if (!execution) return null;

      const rows = await tx.checkResult.findMany({
        where: { executionId: execution.id },
        select: {
          result: true,
          region: true,
          statusDetail: true,
          engineSeverity: true,
          check: { select: { id: true, checkId: true } },
          assetResource: { select: { resourceUid: true, resourceType: true, name: true } },
        },
      });
      const results: InterpretedResult[] = rows.map((r) => ({
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

      const checkUuids = [...new Set(rows.map((r) => r.check.id))];
      const linkRows = await tx.testCheck.findMany({
        where: { checkId: { in: checkUuids }, test: { code: { startsWith: 'T-CLD-' } } },
        select: { provenance: true, check: { select: { checkId: true } }, test: { select: { code: true } } },
      });
      const links: TestCheckLink[] = linkRows.map((l) => ({ testCode: l.test.code, checkId: l.check.checkId, provenance: l.provenance }));

      return { executionId: execution.id, finishedAt: execution.finishedAt, engineVersion: execution.engineVersion, regions: execution.regions, checksExecuted: execution.checksExecuted, results, links };
    });
  }
}
