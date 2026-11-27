import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Inventory } from '../entities/technical-control.entities';
import { FailedRow } from '../scan/findings';
import { TestCheckLink } from '../scan/readiness';
import { InterpretedResult } from '../scan/scan.types';
import { AgentReadingFacts } from '../agent-reading/reading-plan';
import { CatalogPolicy } from '../sonda/catalog-lookup';
import { InterpretedScaRow } from '../sonda/sonda.types';

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

// Lo que una lectura de la sonda de un servidor entrega al terminar, ya interpretado (D113).
export type ScaOutcome = {
  agentId: string;
  finishedAt: Date;
  sondaVersion: string;
  // Cuántos checks del catálogo tienen las políticas entregadas: el conjunto «ejecutado». Lo que no devolvió filas no se guarda: se deriva (D56).
  checksExecuted: number;
  rows: InterpretedScaRow[];
  logs: { level: 'info' | 'warn' | 'error'; message: string }[];
};

// Lo que el trabajador reclama: solo lo mínimo para abrir la transacción con SU empresa (viene de una función SECURITY DEFINER).
export type ExecutionKindValue = 'assessment' | 'validation' | 'enrollment';
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
  connectionMethod: 'agent' | 'readonly_role' | 'access_keys' | 'identity_federation' | 'app_certificate' | 'admin_consent' | null;
  // Lo que el cliente configuró para el rol (no son secretos). Las llaves, si las hay, siguen cifradas en `encryptedCredentials`.
  roleArn: string | null;
  externalId: string | null;
  // GCP (D112): el número del proyecto que el cliente entregó.
  projectNumber: string | null;
  // Microsoft 365 (D154): el ID de la aplicación del cliente y la huella de su certificado. La clave privada y el PFX siguen cifrados en `encryptedCredentials`.
  appClientId: string | null;
  certificateThumbprint: string | null;
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
  // 0 a 100. 0 = esa evaluación (todavía) no informa avance.
  progressPercentage: number;
  // D157 · Solo en una evaluación completada de Microsoft 365: si de verdad se leyó el correo. `null` = no aplica.
  mailReviewed: boolean | null;
};

// Ejecuciones de la sonda de nube de UN activo. Todo pasa por withScope (RLS impone el aislamiento entre empresas), salvo `claimNext`,
// que busca entre empresas a propósito y lo hace con una función SQL angosta (SEG-47). Lo que cambia datos recibe su `audit`, que se
// escribe en la MISMA transacción (SEG-36).
//
// Ciclo de vida (D57): queued → running → completed | failed. Un activo no puede tener dos ejecuciones abiertas (queued/running).
export abstract class ScanRepository {
  // El catálogo de checks de nube vigente: código del motor → id. Es lo que define el conjunto «ejecutado».
  abstract catalogChecks(platform: string): Promise<Map<string, string>>;
  // La plataforma del activo de una ejecución o de un activo (decide qué catálogo de checks vale). null si no existe para esta empresa.
  abstract executionPlatform(scope: TenantScope, executionId: string): Promise<string | null>;
  abstract assetPlatform(scope: TenantScope, assetId: string): Promise<string | null>;

  // «Evaluar ahora»: crea una ejecución en cola. NOT_FOUND si el activo no existe para esta empresa; ASSET_NOT_VALIDATED si su
  // conexión aún no se comprobó; EXECUTION_IN_PROGRESS si ya hay una abierta.
  abstract queueExecution(
    scope: TenantScope,
    input: { assetId: string; origin: 'scheduled' | 'manual' },
    audit: AuditIntent<{ executionId: string }>,
  ): Promise<{ executionId: string }>;

  abstract listExecutions(scope: TenantScope, assetId: string, page: PageRequest): Promise<Page<ExecutionSummary>>;

  // D158 · Las conexiones de nube cuya frecuencia venció, de todas las empresas (función SQL angosta, solo identificadores), sin pasar del cupo de programadas que pueden esperar.
  abstract listDueCloudAssessments(input: { maxWaiting: number; retrySeconds: number }): Promise<{ tenantId: string; assetId: string }[]>;
  // Deja en cola la evaluación programada. `null` si entretanto la conexión dejó de estar programada o ya tiene una ejecución abierta.
  abstract queueScheduledAssessment(scope: TenantScope, assetId: string): Promise<{ executionId: string } | null>;

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
  // Guarda el avance de una ejecución EN CURSO; solo si sube.
  abstract setProgress(scope: TenantScope, executionId: string, percent: number): Promise<void>;

  abstract failExecution(scope: TenantScope, executionId: string, reason: string, audit: AuditIntent<{ executionId: string }>): Promise<{ executionId: string }>;

  // Importar un escaneo ya hecho: crea la ejecución directamente completada. Lanza NOT_FOUND si el activo no existe para esta empresa.
  abstract recordCompletedScan(scope: TenantScope, run: ScanRun, audit: AuditIntent<RecordedScan>): Promise<RecordedScan>;

  // La última corrida COMPLETADA del activo, o null si no hay ninguna.
  // Con `serviceId`, deja fuera los resultados de los activos de la conexión que NO son de ese servicio. Lo que no tiene activo propio (usuarios, políticas, la
  // cuenta entera) es de toda la cuenta y cuenta para todos los servicios que la usan (D61).
  abstract loadLatestScan(scope: TenantScope, assetId: string, serviceId?: string): Promise<LoadedScan | null>;

  // D90 · ¿Es `testId` una prueba automática (de nube, servidor, base de datos o aplicación) de ese control del cliente? Devuelve el servicio del control, o null si el control o la
  // prueba no existen para esta empresa (o la prueba no es automática: una documental no tiene nada técnico que explicar).
  // `responsibleUserIds` son el dueño y el ejecutor activos del control (D102).
  abstract findAutomatedTestOfControl(scope: TenantScope, controlId: string, testId: string): Promise<{ serviceId: string; responsibleUserIds: string[] } | null>;
  // D90 · Lo que falló en la última evaluación completada de cada conexión del servicio (una cuenta de nube o un servidor con agente), solo en los checks de esa prueba. En un servidor, el
  // recurso afectado es el propio servidor (su nombre). Con `includeProposed`, también cuentan
  // los vínculos que el comité aún no ratificó (igual que `writeEvaluations`). `measuredAt` es la fecha de la evaluación más reciente; null si ninguna conexión se evaluó.
  abstract loadFailedRows(scope: TenantScope, input: { serviceId: string; testId: string; includeProposed: boolean }): Promise<{ measuredAt: Date | null; rows: FailedRow[] }>;

  // ---- servidores con agente de la sonda (D113) ----

  // El agente enlazado al activo de esta ejecución, tal como Monkey lo pre-registró: el hecho contra el que se comprueba lo que entrega el trabajador (SEG-45).
  // null si la ejecución no existe para esta empresa o su activo no tiene agente; `agentId` es null mientras no se haya creado en la sonda.
  abstract loadAgentLink(scope: TenantScope, executionId: string): Promise<{ tenantId: string; assetId: string; agentId: string | null } | null>;

  // Las políticas del catálogo del comité que la sonda entregó, con sus checks (se reconocen por id o por nombre). Se lee libre (RLS de `catalog`).
  abstract scaCatalog(policies: readonly { scaId: string; name: string }[]): Promise<CatalogPolicy[]>;

  // Cierra una lectura de la sonda: guarda los resultados, marca el agente como conectado, mueve las evaluaciones de los controles y deja la bitácora, todo en UNA
  // transacción. EXECUTION_NOT_RUNNING si la ejecución no está en curso.
  abstract completeSca(scope: TenantScope, executionId: string, outcome: ScaOutcome, audit: AuditIntent<{ executionId: string; resultCount: number }>): Promise<{ executionId: string; resultCount: number }>;

  // ---- la lectura automática de la sonda (D113) ----

  // Los servidores de TODAS las empresas a los que podría tocarles una lectura (función SQL angosta que solo lee, SEG-47). Ya viene sin lo que no puede tocar (con una lectura abierta,
  // empresa archivada, conectado hace poco); la decisión final es de `isReadingDue`.
  abstract listAgentReadingCandidates(input: { windowSeconds: number; refreshSeconds: number }): Promise<AgentReadingFacts[]>;
  // Deja en cola una lectura automática de ese servidor. null si ya hay una abierta o el servidor dejó de tener agente. No se audita: es mantenimiento, y cada 3 minutos serían cientos de filas.
  abstract queueAgentReading(scope: TenantScope, assetId: string): Promise<{ executionId: string } | null>;
  // Cierra una lectura AUTOMÁTICA que no estaba lista (el servidor aún no entrega su primera revisión, o no está conectado) sin que cuente como un error del cliente: queda cancelada, fuera de su historial y
  // sin auditoría. Si el servidor estaba conectado y ahora no, pasa a `disconnected` (eso sí se audita). Devuelve false si no aplica (otra razón, lectura pedida por una persona, no está en curso): quien llama
  // la cierra como fallo normal.
  abstract settleAgentReading(scope: TenantScope, executionId: string, reason: string, audit: AuditIntent<{ executionId: string; assetId: string }>): Promise<boolean>;
}
