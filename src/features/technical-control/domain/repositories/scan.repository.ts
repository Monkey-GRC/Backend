import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Inventory } from '../entities/technical-control.entities';
import { TestCheckLink } from '../scan/readiness';
import { InterpretedResult } from '../scan/scan.types';

// Lo que una corrida entrega al terminar (D56, D57).
export type ScanOutcome = {
  finishedAt: Date;
  engineVersion: string;
  regions: string[];
  // Cuántos checks corrió la corrida (el catálogo de esa versión). Los que no devolvieron filas NO se guardan: son `not_applicable`
  // por derivación (D56, DT-48) y guardarlos multiplicaría el volumen de la tabla más grande del sistema.
  checksExecuted: number;
  results: InterpretedResult[];
  logs: { level: 'info' | 'warn' | 'error'; message: string }[];
};

// Una corrida que se guarda de una vez (importar un escaneo ya hecho): se crea ya completada.
export type ScanRun = ScanOutcome & {
  assetId: string;
  origin: 'scheduled' | 'manual';
  startedAt: Date;
};

export type RecordedScan = { executionId: string; resultCount: number; resourceCount: number };

// Lo que el trabajador reclama: solo lo mínimo para abrir la transacción con SU empresa (viene de una función SECURITY DEFINER).
export type ExecutionKindValue = 'assessment' | 'validation';
export type ClaimedExecution = { executionId: string; tenantId: string; assetId: string; origin: 'scheduled' | 'manual'; kind: ExecutionKindValue };

// El activo y su conexión tal como los necesita el trabajador. `encryptedCredentials` sigue cifrado: lo abre el caso de uso.
export type RunContext = {
  executionId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  kind: ExecutionKindValue;
  platform: string;
  externalAccountId: string | null;
  regions: string[];
  connectionMethod: 'agent' | 'readonly_role' | 'access_keys' | null;
  // Lo que el cliente configuró para el rol (no son secretos). Las llaves, si las hay, siguen cifradas en `encryptedCredentials`.
  roleArn: string | null;
  externalId: string | null;
  encryptedCredentials: string | null;
};

export type LoadedScan = {
  executionId: string;
  finishedAt: Date | null;
  engineVersion: string | null;
  regions: string[];
  checksExecuted: number | null;
  results: InterpretedResult[];
  links: TestCheckLink[];
};

export type ExecutionSummary = {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  origin: 'scheduled' | 'manual';
  queuedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  failureReason: string | null;
};

// Ejecuciones de la sonda de nube de UN activo. Todo pasa por withScope (RLS impone el aislamiento entre empresas), salvo `claimNext`,
// que busca entre empresas a propósito y lo hace con una función SQL angosta (SEG-47). Lo que cambia datos recibe su `audit`, que se
// escribe en la MISMA transacción (SEG-36).
//
// Ciclo de vida (D57): queued → running → completed | failed. Un activo no puede tener dos ejecuciones abiertas (queued/running).
export abstract class ScanRepository {
  // El catálogo de checks de nube vigente: código del motor → id. Es lo que define el conjunto «ejecutado».
  abstract catalogChecks(platform: string): Promise<Map<string, string>>;

  // «Evaluar ahora»: crea una ejecución en cola. NOT_FOUND si el activo no existe para esta empresa; ASSET_NOT_VALIDATED si su
  // conexión aún no se comprobó; EXECUTION_IN_PROGRESS si ya hay una abierta.
  abstract queueExecution(
    scope: TenantScope,
    input: { assetId: string; origin: 'scheduled' | 'manual' },
    audit: AuditIntent<{ executionId: string }>,
  ): Promise<{ executionId: string }>;

  abstract listExecutions(scope: TenantScope, assetId: string, page: PageRequest): Promise<Page<ExecutionSummary>>;

  // «Comprobar conexión» (D58): una validación en cola. Comprueba que se puede acceder a la cuenta del cliente; dura segundos y el cliente espera.
  // NOT_FOUND si el activo no existe para esta empresa; EXECUTION_IN_PROGRESS si ya hay una ejecución abierta (el índice único lo impone).
  abstract queueValidation(scope: TenantScope, assetId: string, actorUserId: string | null, audit: AuditIntent<{ executionId: string }>): Promise<{ executionId: string }>;
  // Estado de una ejecución (null si no existe para esta empresa). Es lo que mira quien espera una validación.
  abstract executionStatus(scope: TenantScope, executionId: string): Promise<{ status: ExecutionSummary['status']; failureReason: string | null } | null>;
  // Cierra como cancelada una validación que NADIE reclamó (si ya la tomó el trabajador, no la toca: el barrido la cierra). Devuelve si la canceló.
  abstract cancelQueued(scope: TenantScope, executionId: string): Promise<boolean>;
  // El trabajador cierra una validación en curso: la cuenta es accesible y es la declarada.
  // Cierra una validación y, si el trabajador descubrió los recursos de la cuenta, los guarda en la misma transacción.
  abstract completeValidation(scope: TenantScope, executionId: string, inventory: Inventory | null, audit: AuditIntent<{ executionId: string; resources: number | null }>): Promise<{ executionId: string; resources: number | null }>;

  // El trabajador reclama la próxima en cola de CUALQUIER empresa y la pasa a `running`. Cada carril pide solo su tipo (una validación no espera a
  // una evaluación de minutos). Barre antes lo vencido: evaluaciones de más de 30 min y validaciones de más de 2.
  abstract claimNext(kind?: ExecutionKindValue): Promise<ClaimedExecution | null>;
  abstract loadRunContext(scope: TenantScope, executionId: string): Promise<RunContext>;

  // Cierra una ejecución `running`. EXECUTION_NOT_RUNNING si no lo está (otra empresa, ya cerrada o inexistente: no se distingue).
  abstract completeExecution(scope: TenantScope, executionId: string, outcome: ScanOutcome, audit: AuditIntent<RecordedScan>): Promise<RecordedScan>;
  // Un fallo de ejecución es un problema de CONEXIÓN, no un incumplimiento (§8): no guarda resultados ni mueve la preparación.
  abstract failExecution(scope: TenantScope, executionId: string, reason: string, audit: AuditIntent<{ executionId: string }>): Promise<{ executionId: string }>;

  // Importar un escaneo ya hecho: crea la ejecución directamente completada. Lanza NOT_FOUND si el activo no existe para esta empresa.
  abstract recordCompletedScan(scope: TenantScope, run: ScanRun, audit: AuditIntent<RecordedScan>): Promise<RecordedScan>;

  // La última corrida COMPLETADA del activo, o null si no hay ninguna.
  // Con `serviceId`, deja fuera los resultados de los activos de la conexión que NO son de ese servicio. Lo que no tiene activo propio (usuarios, políticas, la
  // cuenta entera) es de toda la cuenta y cuenta para todos los servicios que la usan (D61).
  abstract loadLatestScan(scope: TenantScope, assetId: string, serviceId?: string): Promise<LoadedScan | null>;
}
