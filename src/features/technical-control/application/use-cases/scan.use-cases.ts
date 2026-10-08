import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { interpretScan } from '../../domain/scan/interpret-scan';
import { AssetReadiness, computeReadiness } from '../../domain/scan/readiness';
import { EngineFinding } from '../../domain/scan/scan.types';

const PLATFORM = 'aws';

export type RecordScanInput = {
  assetId: string;
  origin: 'scheduled' | 'manual';
  // Quién lo disparó; null si lo hizo el sistema (corrida programada).
  actorUserId: string | null;
  startedAt: Date;
  finishedAt: Date;
  engineVersion: string;
  regions: string[];
  findings: readonly EngineFinding[];
};

const entry = (scope: TenantScope, actorUserId: string | null, action: string, after: Record<string, unknown>): AuditEntry => ({
  tenantId: scope.companyId,
  userId: actorUserId,
  action,
  resource: 'execution',
  result: 'success',
  // Una corrida programada no viene de una petición: no hay IP ni agente de usuario.
  ipAddress: 'system',
  userAgent: 'system',
  beforeState: null,
  afterState: after,
});

// Guarda una corrida de la sonda de nube de un activo: la interpreta (checks sin filas ⇒ not_applicable, no cumplidos) y persiste
// ejecución, recursos y resultados en UNA transacción con su rastro (SEG-36). Nunca guarda secretos ni el texto crudo del motor al cliente.
@Injectable()
export class RecordScanUseCase {
  constructor(private readonly repo: ScanRepository) {}

  async execute(scope: TenantScope, input: RecordScanInput) {
    const catalog = await this.repo.catalogChecks(PLATFORM);
    const { results, unexpectedChecks } = interpretScan({ executedCheckIds: [...catalog.keys()], findings: input.findings });
    const logs: { level: 'info' | 'warn' | 'error'; message: string }[] = [
      { level: 'info', message: `Corrida completada: ${input.findings.length} filas del motor sobre ${catalog.size} comprobaciones.` },
    ];
    // No se descartan en silencio: un check que el motor devolvió y el catálogo no conoce queda registrado.
    if (unexpectedChecks.length > 0) logs.push({ level: 'warn', message: `Comprobaciones fuera del catálogo (ignoradas): ${unexpectedChecks.join(', ')}` });

    return this.repo.recordCompletedScan(
      scope,
      {
        assetId: input.assetId,
        origin: input.origin,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        engineVersion: input.engineVersion,
        regions: input.regions,
        checksExecuted: catalog.size,
        results,
        logs,
      },
      (recorded) =>
        entry(scope, input.actorUserId, 'execution.complete', {
          execution_id: recorded.executionId,
          asset_id: input.assetId,
          origin: input.origin,
          engine_version: input.engineVersion,
          regions: input.regions,
          results: recorded.resultCount,
          resources: recorded.resourceCount,
        }),
    );
  }
}

// El estado de preparación de un activo, calculado de su última corrida completada (nunca almacenado: §9).
@Injectable()
export class GetAssetReadinessUseCase {
  constructor(private readonly repo: ScanRepository) {}

  // `includeProposed`: la demo cuenta los mapeos propuestos; producción, solo lo ratificado por el comité (D56).
  async execute(scope: TenantScope, assetId: string, opts: { includeProposed: boolean }): Promise<(AssetReadiness & { executionId: string; measuredAt: Date | null; includesProposedMappings: boolean }) | null> {
    const scan = await this.repo.loadLatestScan(scope, assetId);
    if (!scan) return null;
    const readiness = computeReadiness(scan.results, scan.links, { includeProposed: opts.includeProposed });
    return { ...readiness, executionId: scan.executionId, measuredAt: scan.finishedAt, includesProposedMappings: opts.includeProposed };
  }
}
