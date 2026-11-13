import { Inventory } from '../../domain/entities/technical-control.entities';
import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { EngineOutputParser } from '../../domain/ports/engine-output-parser';
import { AgentInstallRepository } from '../../domain/repositories/agent-install.repository';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
import { ExecutionKindValue, ExecutionSummary, RecordedScan, RunContext, ScanOutcome, ScanRepository, ScaOutcome } from '../../domain/repositories/scan.repository';
import { interpretScan } from '../../domain/scan/interpret-scan';
import { AssetReadiness, computeReadiness } from '../../domain/scan/readiness';
import { EngineFinding } from '../../domain/scan/scan.types';
import { checkAgentIsolation, ReportedAgent } from '../../domain/sonda/agent-isolation';
import { buildCatalogLookup } from '../../domain/sonda/catalog-lookup';
import { interpretSca } from '../../domain/sonda/interpret-sca';
import { ScaPolicyInput } from '../../domain/sonda/sonda.types';

const PLATFORM = 'aws';
const MAX_CLAIM_ATTEMPTS = 10;

const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

const entry = (scope: TenantScope, actorUserId: string | null, action: string, after: Record<string, unknown>, meta?: RequestMeta): AuditEntry => ({
  tenantId: scope.companyId,
  userId: actorUserId,
  action,
  resource: 'execution',
  result: 'success',
  // Una corrida del trabajador no viene de una petición de usuario: no hay IP ni agente de usuario.
  ipAddress: meta?.ipAddress ?? 'system',
  userAgent: meta?.userAgent ?? 'system',
  beforeState: null,
  afterState: after,
});

// La corrida interpretada: los checks sin filas quedan `not_applicable` (el conjunto ejecutado es el catálogo), y los que el motor devolvió
// y el catálogo no conoce se registran en la bitácora, no se descartan en silencio.
async function buildOutcome(
  repo: ScanRepository,
  input: { findings: readonly EngineFinding[]; finishedAt: Date; engineVersion: string; regions: string[] },
): Promise<ScanOutcome> {
  const catalog = await repo.catalogChecks(PLATFORM);
  const { results, unexpectedChecks } = interpretScan({ executedCheckIds: [...catalog.keys()], findings: input.findings });
  const logs: ScanOutcome['logs'] = [{ level: 'info', message: `Corrida completada: ${input.findings.length} filas del motor sobre ${catalog.size} comprobaciones.` }];
  if (unexpectedChecks.length > 0) logs.push({ level: 'warn', message: `Comprobaciones fuera del catálogo (ignoradas): ${unexpectedChecks.join(', ')}` });
  return { finishedAt: input.finishedAt, engineVersion: input.engineVersion, regions: input.regions, checksExecuted: catalog.size, results, logs };
}

const recordedState = (executionId: string, assetId: string | null, extra: Record<string, unknown>) => ({ execution_id: executionId, ...(assetId ? { asset_id: assetId } : {}), ...extra });

// ---- el cliente ------------------------------------------------------------------------------------------------------------------

// «Evaluar ahora»: deja una ejecución en cola; el trabajador la reclama (D57). Nunca espera al motor.
@Injectable()
export class QueueExecutionUseCase {
  constructor(private readonly repo: ScanRepository) {}

  execute(principal: Principal, assetId: string, meta: RequestMeta) {
    const scope = scopeOf(principal);
    return this.repo.queueExecution(scope, { assetId, origin: 'manual' }, (q) => entry(scope, principal.userId, 'execution.queue', recordedState(q.executionId, assetId, { origin: 'manual' }), meta));
  }
}

@Injectable()
export class ListExecutionsUseCase {
  constructor(
    private readonly repo: ScanRepository,
    private readonly assets: TechnicalControlRepository,
  ) {}

  async execute(principal: Principal, assetId: string, page: PageRequest): Promise<Page<ExecutionSummary>> {
    const scope = scopeOf(principal);
    // Un activo de otra empresa no existe para quien pregunta: 404, no una lista vacía (conventions.md).
    if (!(await this.assets.findAsset(scope, assetId))) throw new DomainError('NOT_FOUND');
    return this.repo.listExecutions(scope, assetId, page);
  }
}

// El estado de preparación de un activo, calculado de su última corrida completada (nunca almacenado: §9).
@Injectable()
export class GetAssetReadinessUseCase {
  constructor(
    private readonly repo: ScanRepository,
    private readonly assets: TechnicalControlRepository,
  ) {}

  // `includeProposed`: la demo cuenta los mapeos propuestos; producción, solo lo ratificado por el comité (D56).
  // null si el activo aún no tiene ninguna corrida completada; NOT_FOUND si no existe para esta empresa.
  async execute(scope: TenantScope, assetId: string, opts: { includeProposed: boolean; serviceId?: string }): Promise<(AssetReadiness & { executionId: string; measuredAt: Date | null; includesProposedMappings: boolean }) | null> {
    if (!(await this.assets.findAsset(scope, assetId))) throw new DomainError('NOT_FOUND');
    // Con un servicio, solo se miden sus activos más lo que es de toda la cuenta (D61). Un servicio que no existe para esta empresa es 404.
    if (opts.serviceId && !(await this.assets.getState(scope, opts.serviceId))) throw new DomainError('NOT_FOUND');
    const scan = await this.repo.loadLatestScan(scope, assetId, opts.serviceId);
    if (!scan) return null;
    const readiness = computeReadiness(scan.results, scan.links, { includeProposed: opts.includeProposed });
    return { ...readiness, executionId: scan.executionId, measuredAt: scan.finishedAt, includesProposedMappings: opts.includeProposed };
  }
}

// Importar un escaneo ya hecho (sin motor): crea la ejecución directamente completada.
@Injectable()
export class ImportScanUseCase {
  constructor(
    private readonly repo: ScanRepository,
    private readonly parser: EngineOutputParser,
  ) {}

  async execute(
    scope: TenantScope,
    input: { assetId: string; origin: 'scheduled' | 'manual'; actorUserId: string | null; startedAt: Date; finishedAt: Date; engineVersion: string; regions: string[]; raw: unknown },
  ): Promise<RecordedScan> {
    const outcome = await buildOutcome(this.repo, { findings: this.parser.parse(input.raw), finishedAt: input.finishedAt, engineVersion: input.engineVersion, regions: input.regions });
    return this.repo.recordCompletedScan(scope, { ...outcome, assetId: input.assetId, origin: input.origin, startedAt: input.startedAt }, (r) =>
      entry(scope, input.actorUserId, 'execution.complete', recordedState(r.executionId, input.assetId, { origin: input.origin, engine_version: input.engineVersion, regions: input.regions, results: r.resultCount, resources: r.resourceCount, imported: true })),
    );
  }
}

// ---- el trabajador (API interna, SEG-47) -------------------------------------------------------------------------------------------

export type RunnerJob = {
  executionId: string;
  kind: ExecutionKindValue;
  tenantId: string;
  assetId: string;
  origin: 'scheduled' | 'manual';
  // `aws` para la nube; para crear el agente de un servidor (D112), la plataforma del activo.
  platform: string;
  externalAccountId: string | null;
  regions: string[];
  connection:
    | { method: 'readonly_role'; roleArn: string; externalId: string | null }
    // Las llaves descifradas viajan SOLO en esta respuesta, por la red interna, y no se registran nunca.
    | { method: 'access_keys'; accessKeyId: string; secretAccessKey: string }
    // Un servidor con agente (D112): no hay credenciales del cliente.
    | { method: 'agent' };
  // De un servidor con agente (D112). Al crearlo: cómo debe llamarse en la sonda y a qué grupo pertenece, los dos derivados del activo y de la empresa (nombre = `asset_id`,
  // grupo = `tenant_id`): el trabajador no los inventa. Al evaluarlo, además, `agentId`: el agente que Monkey enlazó a ESTE activo.
  agent?: { name: string; group: string; agentId?: string; remove?: boolean };
};

type Credentials = Record<string, unknown>;
const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

// Convierte lo guardado en una conexión en lo que el trabajador necesita, o dice por qué la corrida no puede hacerse (clave i18n).
// El rol y el ExternalId salen de lo que el cliente configuró (columnas, no secretos); las llaves, del cifrado. Si la conexión se creó con el
// formulario provisional del paso 3 (`account_id`, `read_only_role`, `external_id` dentro de las credenciales cifradas) también se entiende: se retira
// cuando la pantalla migre. Una VALIDACIÓN solo comprueba el acceso a la cuenta: no necesita regiones (una evaluación sí).
export function buildConnection(ctx: RunContext, creds: Credentials | null): { ok: true; job: Pick<RunnerJob, 'platform' | 'externalAccountId' | 'connection'> } | { ok: false; reason: string } {
  if (ctx.platform.trim().toLowerCase() !== PLATFORM) return { ok: false, reason: 'connection.provider_not_supported' };
  if (ctx.kind === 'assessment' && ctx.regions.length === 0) return { ok: false, reason: 'connection.regions_missing' };
  const externalAccountId = ctx.externalAccountId ?? text(creds?.['account_id']);
  const accessKeyId = text(creds?.['access_key_id']);
  const secretAccessKey = text(creds?.['secret_access_key']);
  const method = ctx.connectionMethod ?? (accessKeyId ? 'access_keys' : 'readonly_role');
  if (method === 'access_keys') {
    if (!accessKeyId || !secretAccessKey) return { ok: false, reason: 'connection.credentials_invalid' };
    return { ok: true, job: { platform: PLATFORM, externalAccountId, connection: { method: 'access_keys', accessKeyId, secretAccessKey } } };
  }
  if (method === 'readonly_role') {
    const roleArn = ctx.roleArn ?? text(creds?.['role_arn']) ?? text(creds?.['read_only_role']);
    // Sin rol guardado: si no hay nada más, todavía no se configuró; si el formulario provisional trajo otros datos pero no el rol, es el rol lo que falta.
    if (!roleArn) return { ok: false, reason: creds ? 'connection.role_not_found' : 'connection.not_configured' };
    return { ok: true, job: { platform: PLATFORM, externalAccountId, connection: { method: 'readonly_role', roleArn, externalId: ctx.externalId ?? text(creds?.['external_id']) } } };
  }
  // `agent`: no lo ejecuta el trabajador de la nube (lo lee la sonda de servidores).
  return { ok: false, reason: 'connection.method_not_supported_by_runner' };
}

@Injectable()
export class ClaimExecutionUseCase {
  constructor(
    private readonly repo: ScanRepository,
    private readonly cipher: CredentialCipher,
    private readonly agents: AgentInstallRepository,
  ) {}

  // Reclama la próxima ejecución utilizable. Una cuya conexión no sirve se cierra como `failed` (problema de conexión, no incumplimiento)
  // y se sigue con la siguiente: nunca queda una ejecución colgada en `running`.
  async execute(kind?: ExecutionKindValue): Promise<RunnerJob | null> {
    for (let i = 0; i < MAX_CLAIM_ATTEMPTS; i++) {
      const claimed = await this.repo.claimNext(kind);
      if (!claimed) return null;
      const scope: TenantScope = { companyId: claimed.tenantId };
      // Crear el agente de un servidor (D112) no tiene credenciales del cliente ni regiones: el trabajador necesita saber cómo se llama el agente y a qué grupo va.
      if (claimed.kind === 'enrollment') {
        const target = await this.agents.loadEnrollmentTarget(scope, claimed.executionId);
        return {
          executionId: claimed.executionId, kind: claimed.kind, tenantId: claimed.tenantId, assetId: claimed.assetId, origin: claimed.origin, platform: target.platform,
          externalAccountId: null, regions: [], connection: { method: 'agent' },
          // Un servidor ya dado de baja: la ejecución no crea el agente, lo retira de la sonda (D112 punto 8).
          agent: { name: claimed.assetId, group: claimed.tenantId, ...(target.retired ? { remove: true } : {}) },
        };
      }
      const ctx = await this.repo.loadRunContext(scope, claimed.executionId);
      // Evaluar un servidor con agente (D112): no hay credenciales del cliente ni regiones. El trabajador lee la sonda con la suya; aquí solo se le dice QUÉ agente leer.
      if (claimed.kind === 'assessment' && ctx.connectionMethod === 'agent') {
        const link = await this.repo.loadAgentLink(scope, claimed.executionId);
        if (!link?.agentId) {
          // El agente todavía no se creó en la sonda: problema de conexión, no incumplimiento.
          await this.repo.failExecution(scope, claimed.executionId, 'connection.agent_not_found', () => entry(scope, null, 'execution.fail', recordedState(claimed.executionId, claimed.assetId, { reason: 'connection.agent_not_found', kind: claimed.kind })));
          continue;
        }
        return {
          executionId: claimed.executionId, kind: claimed.kind, tenantId: claimed.tenantId, assetId: claimed.assetId, origin: claimed.origin, platform: ctx.platform,
          externalAccountId: null, regions: [], connection: { method: 'agent' }, agent: { name: claimed.assetId, group: claimed.tenantId, agentId: link.agentId },
        };
      }
      let creds: Credentials | null = null;
      try {
        creds = ctx.encryptedCredentials ? this.cipher.decrypt(ctx.encryptedCredentials) : null;
      } catch {
        creds = null;
      }
      const built = buildConnection(ctx, creds);
      if (built.ok) return { executionId: claimed.executionId, kind: claimed.kind, tenantId: claimed.tenantId, assetId: claimed.assetId, origin: claimed.origin, regions: ctx.regions, ...built.job };
      await this.repo.failExecution(scope, claimed.executionId, built.reason, () => entry(scope, null, 'execution.fail', recordedState(claimed.executionId, claimed.assetId, { reason: built.reason, kind: claimed.kind })));
    }
    return null;
  }
}

@Injectable()
export class CompleteExecutionUseCase {
  constructor(
    private readonly repo: ScanRepository,
    private readonly parser: EngineOutputParser,
  ) {}

  // `tenantId` lo da el trabajador (lo recibió al reclamar). Si miente, RLS no encuentra la ejecución: EXECUTION_NOT_RUNNING.
  async execute(tenantId: string, executionId: string, input: { engineVersion: string; regions: string[]; finishedAt: Date; raw: unknown }): Promise<RecordedScan> {
    const scope: TenantScope = { companyId: tenantId };
    const outcome = await buildOutcome(this.repo, { findings: this.parser.parse(input.raw), finishedAt: input.finishedAt, engineVersion: input.engineVersion, regions: input.regions });
    return this.repo.completeExecution(scope, executionId, outcome, (r) =>
      entry(scope, null, 'execution.complete', recordedState(r.executionId, null, { engine_version: input.engineVersion, regions: input.regions, results: r.resultCount, resources: r.resourceCount })),
    );
  }
}

export type ScaReading = {
  sondaVersion: string;
  finishedAt: Date;
  agent: ReportedAgent;
  policies: ScaPolicyInput[];
};

// El trabajador leyó la sonda de un servidor con agente y entrega lo que vio (D112). Monkey NO le cree a ciegas: comprueba que el agente es el que enlazó a ESTE activo de ESTA
// empresa (SEG-45), reconoce cada check en el catálogo del comité y guarda solo lo que reconoce; el resto se informa como «no mapeado», nunca se inventa.
@Injectable()
export class CompleteScaExecutionUseCase {
  constructor(private readonly repo: ScanRepository) {}

  async execute(tenantId: string, executionId: string, input: ScaReading, now: Date = new Date()): Promise<{ executionId: string; resultCount: number }> {
    const scope: TenantScope = { companyId: tenantId };
    const link = await this.repo.loadAgentLink(scope, executionId);
    const verdict = checkAgentIsolation({
      link: link?.agentId ? { tenantId: link.tenantId, assetId: link.assetId, agentId: link.agentId } : null,
      reported: input.agent,
      tenantId,
      assetId: link?.assetId ?? '',
    });
    if (!verdict.ok) throw new DomainError(verdict.code);

    const catalog = await this.repo.scaCatalog(input.policies.map((p) => ({ scaId: p.policyId, name: p.name })));
    const { lookup, executed } = buildCatalogLookup(catalog, input.policies.map((p) => ({ policyId: p.policyId, name: p.name })));
    const sca = interpretSca({ policies: input.policies, lookup, readAt: now });

    const total = input.policies.reduce((n, p) => n + p.checks.length, 0);
    const logs: ScaOutcome['logs'] = [{ level: 'info', message: `Lectura completada: ${total} checks de ${input.policies.length} política(s) de la sonda ${input.sondaVersion}; ${sca.rows.length} reconocidos en el catálogo.` }];
    // Cobertura no alcanzada (D56, D112): lo que la sonda entregó y el comité aún no tiene catalogado se ve en la bitácora, no se descarta en silencio.
    for (const u of sca.unmapped) logs.push({ level: 'warn', message: `Política fuera del catálogo (${u.checks} checks sin guardar): ${u.policyName} [${u.policyId}]` });
    if (sca.duplicates > 0) logs.push({ level: 'warn', message: `Checks repetidos en la entrega: ${sca.duplicates} (se guardó el peor resultado de cada uno).` });

    return this.repo.completeSca(scope, executionId, { agentId: input.agent.agentId, finishedAt: input.finishedAt, sondaVersion: input.sondaVersion, checksExecuted: executed, rows: sca.rows, logs }, (r) =>
      entry(scope, null, 'execution.complete', recordedState(r.executionId, link?.assetId ?? null, { source: 'sca', sonda_version: input.sondaVersion, results: r.resultCount, unmapped_policies: sca.unmapped.length })),
    );
  }
}

@Injectable()
export class FailExecutionUseCase {
  constructor(private readonly repo: ScanRepository) {}

  async execute(tenantId: string, executionId: string, reason: string) {
    const scope: TenantScope = { companyId: tenantId };
    // Una lectura AUTOMÁTICA de un servidor que «todavía no estaba listo» (D112) no es un fallo del cliente: se cierra sin ruido (sin historial ni auditoría de cada espera) y, si el
    // servidor estaba conectado y ya no, pasa a «desconectado». Lo demás (otra razón, o una lectura que pidió una persona) se cierra como fallo, con su razón a la vista.
    const settled = await this.repo.settleAgentReading(scope, executionId, reason, (s) => ({
      tenantId: tenantId,
      userId: null,
      action: 'agent.disconnected',
      resource: 'asset',
      result: 'success',
      ipAddress: 'system',
      userAgent: 'system',
      beforeState: null,
      afterState: { asset_id: s.assetId, execution_id: s.executionId, reason },
    }));
    if (settled) return { executionId };
    return this.repo.failExecution(scope, executionId, reason, () => entry(scope, null, 'execution.fail', recordedState(executionId, null, { reason })));
  }
}

// El trabajador comprobó que se puede acceder a la cuenta del cliente (rol asumido, cuenta correcta): cierra la validación. Quien espera la
// respuesta (la sonda `runner` del backend) la ve cerrada y registra la conexión como validada.
@Injectable()
export class CompleteValidationUseCase {
  constructor(private readonly repo: ScanRepository) {}

  execute(tenantId: string, executionId: string, inventory: Inventory | null) {
    const scope: TenantScope = { companyId: tenantId };
    return this.repo.completeValidation(scope, executionId, inventory, (done) => entry(scope, null, 'execution.validate', recordedState(executionId, null, { kind: 'validation', resources_found: done.resources })));
  }
}
