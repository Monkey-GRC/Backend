import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { TestCheckLink } from '../scan/readiness';
import { InterpretedResult } from '../scan/scan.types';

export type ScanRun = {
  assetId: string;
  origin: 'scheduled' | 'manual';
  startedAt: Date;
  finishedAt: Date;
  engineVersion: string;
  regions: string[];
  // Cuántos checks corrió la corrida (el catálogo de esa versión). Los que no devolvieron filas NO se guardan: son `not_applicable`
  // por derivación (D56, DT-48) y guardarlos multiplicaría el volumen de la tabla más grande del sistema.
  checksExecuted: number;
  results: InterpretedResult[];
  logs: { level: 'info' | 'warn' | 'error'; message: string }[];
};

export type RecordedScan = { executionId: string; resultCount: number; resourceCount: number };

export type LoadedScan = {
  executionId: string;
  finishedAt: Date | null;
  engineVersion: string | null;
  regions: string[];
  checksExecuted: number | null;
  results: InterpretedResult[];
  links: TestCheckLink[];
};

// Corridas de la sonda de nube de UN activo. Todo pasa por withScope: RLS impone el aislamiento entre empresas.
// Lo que cambia datos recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).
export abstract class ScanRepository {
  // El catálogo de checks de nube vigente: código del motor → id. Es lo que define el conjunto «ejecutado».
  abstract catalogChecks(platform: string): Promise<Map<string, string>>;
  // Lanza NOT_FOUND si el activo no existe para esta empresa.
  abstract recordCompletedScan(scope: TenantScope, run: ScanRun, audit: AuditIntent<RecordedScan>): Promise<RecordedScan>;
  // Una corrida que no pudo conectar es un problema de CONEXIÓN, no un incumplimiento (§8): no guarda resultados.
  abstract recordFailedScan(
    scope: TenantScope,
    run: Pick<ScanRun, 'assetId' | 'origin' | 'startedAt' | 'finishedAt' | 'engineVersion' | 'regions'> & { reason: string },
    audit: AuditIntent<{ executionId: string }>,
  ): Promise<{ executionId: string }>;
  // La última corrida COMPLETADA del activo, o null si no hay ninguna.
  abstract loadLatestScan(scope: TenantScope, assetId: string): Promise<LoadedScan | null>;
}
