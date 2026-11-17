import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { buildInstallOptions, InstallOption, SUPPORTED_INSTALL_OS } from '../../domain/agent-install/install-command';
import { InstallState, installState } from '../../domain/agent-install/install-state';
import { DEFAULT_READING_CONFIG, isWatching, ReadingConfig } from '../../domain/agent-reading/reading-plan';
import { AgentInstallFacts, AgentInstallRepository } from '../../domain/repositories/agent-install.repository';
import { AGENT_INSTALL_PS1, AGENT_INSTALL_PS1_PARAMS } from '../../infrastructure/templates/agent-install.ps1.template';
import { AGENT_INSTALL_SH } from '../../infrastructure/templates/agent-install.sh.template';
import { AgentInstallConfig, InstallConfig } from '../agent-install-config';
import { AgentReadingConfig } from '../agent-reading-config';

const TEMPLATES = { linuxScript: AGENT_INSTALL_SH, windowsScript: AGENT_INSTALL_PS1, windowsParamsBlock: AGENT_INSTALL_PS1_PARAMS };
const MS_PER_MINUTE = 60_000;

const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

// Lo que se registra en la bitácora: quién, qué y sobre qué servidor. NUNCA el comando ni la clave.
const entry = (scope: TenantScope, userId: string | null, action: string, after: Record<string, unknown>, meta?: RequestMeta): AuditEntry => ({
  tenantId: scope.companyId,
  userId,
  action,
  resource: 'asset',
  result: 'success',
  ipAddress: meta?.ipAddress ?? 'system',
  userAgent: meta?.userAgent ?? 'system',
  beforeState: null,
  afterState: after,
});

export type InstallView = {
  status: InstallState['status'];
  failureReason: string | null;
  os: string;
  osVersion: NonNullable<AgentInstallFacts['agent']>['osVersion'];
  // Hasta cuándo se puede pedir el comando (solo en `ready`).
  expiresAt: Date | null;
  // Lo que el firewall del cliente debe permitir de SALIDA.
  requiresOutbound: { host: string; port: number };
  // Cómo va el servidor con la sonda (D113): `watching` es verdad mientras Monkey lo busca solo; cuando deja de serlo sin haberse conectado, la pantalla ofrece «Comprobar ahora».
  connection: { status: NonNullable<AgentInstallFacts['agent']>['status']; watching: boolean; lastSyncAt: Date | null };
};

// Las condiciones comunes: el activo existe para esta empresa, usa agente, y esta instalación puede armar el comando.
async function load(repo: AgentInstallRepository, config: AgentInstallConfig, scope: TenantScope, assetId: string): Promise<{ facts: AgentInstallFacts & { agent: NonNullable<AgentInstallFacts['agent']> }; cfg: InstallConfig }> {
  const cfg = config.get();
  if (!cfg) throw new DomainError('AGENT_INSTALL_UNAVAILABLE');
  const facts = await repo.getFacts(scope, assetId);
  if (!facts) throw new DomainError('NOT_FOUND');
  if (!facts.agent) throw new DomainError('ASSET_NOT_AGENT');
  return { facts: facts as AgentInstallFacts & { agent: NonNullable<AgentInstallFacts['agent']> }, cfg };
}

function view(facts: AgentInstallFacts & { agent: NonNullable<AgentInstallFacts['agent']> }, cfg: InstallConfig, now: Date, reading: ReadingConfig): InstallView {
  const state = installState({ agentId: facts.agent.agentId, hasKey: facts.agent.hasKey, keyExpiresAt: facts.agent.keyExpiresAt, latestEnrollment: facts.latestEnrollment }, now);
  return {
    status: state.status,
    failureReason: state.failureReason,
    os: facts.agent.os,
    osVersion: facts.agent.osVersion,
    expiresAt: state.status === 'ready' ? facts.agent.keyExpiresAt : null,
    requiresOutbound: { host: cfg.managerHost, port: cfg.managerPort },
    connection: {
      status: facts.agent.status,
      // Sin agente creado (p. ej. al «generar de nuevo») todavía no hay nada que buscar.
      watching: facts.agent.agentId !== null && isWatching({ status: facts.agent.status, enrolledAt: facts.agent.enrolledAt }, reading, now),
      lastSyncAt: facts.agent.lastSyncAt,
    },
  };
}

// El estado de la instalación: lo consulta la pantalla una y otra vez. No lleva ningún secreto.
@Injectable()
export class GetAgentInstallStateUseCase {
  constructor(
    private readonly repo: AgentInstallRepository,
    private readonly config: AgentInstallConfig,
    private readonly reading: AgentReadingConfig,
  ) {}

  async execute(principal: Principal, assetId: string, now: Date = new Date()): Promise<InstallView> {
    const { facts, cfg } = await load(this.repo, this.config, scopeOf(principal), assetId);
    return view(facts, cfg, now, this.reading.get());
  }
}

// Empieza la instalación: deja en cola la creación del agente y responde ya. Repetirla es inofensivo: si ya está en curso, lista o entregada, no hace nada.
@Injectable()
export class StartAgentInstallUseCase {
  constructor(
    private readonly repo: AgentInstallRepository,
    private readonly config: AgentInstallConfig,
    private readonly reading: AgentReadingConfig,
  ) {}

  async execute(principal: Principal, assetId: string, meta: RequestMeta, now: Date = new Date()): Promise<InstallView> {
    const scope = scopeOf(principal);
    const { facts, cfg } = await load(this.repo, this.config, scope, assetId);
    const current = view(facts, cfg, now, this.reading.get());
    if (current.status !== 'not_started' && current.status !== 'failed') return current;
    await this.repo.queueEnrollment(scope, assetId, { reset: false }, (q) => entry(scope, principal.userId, 'agent.install.prepare', { asset_id: assetId, execution_id: q.executionId }, meta));
    return view((await this.repo.getFacts(scope, assetId)) as typeof facts, cfg, now, this.reading.get());
  }
}

// «Generar de nuevo»: si el administrador no alcanzó a copiar el comando (o lo perdió). Borra el vínculo con el agente anterior y crea otro.
@Injectable()
export class RegenerateAgentInstallUseCase {
  constructor(
    private readonly repo: AgentInstallRepository,
    private readonly config: AgentInstallConfig,
    private readonly reading: AgentReadingConfig,
  ) {}

  async execute(principal: Principal, assetId: string, meta: RequestMeta, now: Date = new Date()): Promise<InstallView> {
    const scope = scopeOf(principal);
    const { cfg } = await load(this.repo, this.config, scope, assetId);
    await this.repo.queueEnrollment(scope, assetId, { reset: true }, (q) => entry(scope, principal.userId, 'agent.install.regenerate', { asset_id: assetId, execution_id: q.executionId }, meta));
    const facts = (await this.repo.getFacts(scope, assetId)) as AgentInstallFacts & { agent: NonNullable<AgentInstallFacts['agent']> };
    return view(facts, cfg, now, this.reading.get());
  }
}

// Muestra el comando, UNA sola vez. Es un POST (no un GET) a propósito: leerlo lo gasta, y un reintento del navegador o de un proxy no debe poder llevárselo.
@Injectable()
export class RevealAgentInstallUseCase {
  constructor(
    private readonly repo: AgentInstallRepository,
    private readonly config: AgentInstallConfig,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(principal: Principal, assetId: string, meta: RequestMeta, now: Date = new Date()): Promise<{ options: InstallOption[]; os: string; osVersion: InstallView['osVersion']; requiresOutbound: InstallView['requiresOutbound'] }> {
    const scope = scopeOf(principal);
    const { facts, cfg } = await load(this.repo, this.config, scope, assetId);
    // Antes de gastar nada: el comando tiene que estar listo y este sistema tiene que tener instalador. Una clave quemada por un error nuestro obligaría a generar otra.
    if (view(facts, cfg, now, DEFAULT_READING_CONFIG).status !== 'ready') throw new DomainError('AGENT_INSTALL_NOT_READY');
    if (!(SUPPORTED_INSTALL_OS as readonly string[]).includes(facts.agent.os)) throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');

    const cipher = await this.repo.takeInstallKey(scope, assetId, (a) => entry(scope, principal.userId, 'agent.install.reveal', { asset_id: a.assetId }, meta));
    if (!cipher) throw new DomainError('AGENT_INSTALL_NOT_READY');
    let key: string;
    try {
      key = String(this.cipher.decrypt(cipher)['key']);
    } catch {
      throw new DomainError('AGENT_INSTALL_NOT_READY');
    }
    const options = buildInstallOptions(
      { os: facts.agent.os, assetId, key, managerHost: cfg.managerHost, managerPort: cfg.managerPort, agentVersion: cfg.agentVersion, installerBaseUrl: cfg.installerBaseUrl },
      TEMPLATES,
    );
    return { options, os: facts.agent.os, osVersion: facts.agent.osVersion, requiresOutbound: { host: cfg.managerHost, port: cfg.managerPort } };
  }
}

const AGENT_ID = /^[0-9]{3,8}$/;
const KEY = /^[A-Za-z0-9+/]{40,600}={0,2}$/;

// El trabajador creó el agente en la sonda y entrega su id y su clave (API interna, SEG-47). La clave se cifra y se guarda solo unos minutos; no se registra.
@Injectable()
export class CompleteEnrollmentUseCase {
  constructor(
    private readonly repo: AgentInstallRepository,
    private readonly config: AgentInstallConfig,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(tenantId: string, executionId: string, input: { agentId: string; key: string }, now: Date = new Date()): Promise<{ executionId: string; assetId: string }> {
    // El trabajador es un proceso aparte: lo que entrega se valida otra vez aquí, con la misma forma estricta con la que luego se arma el comando.
    if (!AGENT_ID.test(input.agentId) || !KEY.test(input.key)) throw new DomainError('ENGINE_OUTPUT_INVALID');
    const scope: TenantScope = { companyId: tenantId };
    const ttl = this.config.get()?.keyTtlMinutes ?? 15;
    const { assetId } = await this.repo.completeEnrollment(
      scope,
      executionId,
      { agentId: input.agentId, keyCipher: this.cipher.encrypt({ key: input.key }), keyExpiresAt: new Date(now.getTime() + ttl * MS_PER_MINUTE) },
      (done) => entry(scope, null, 'agent.enroll', { execution_id: done.executionId, asset_id: done.assetId, agent_id: done.agentId, ...(done.released > 0 ? { released_links: done.released } : {}) }),
    );
    return { executionId, assetId };
  }
}

// El trabajador retiró de la sonda el agente de un servidor dado de baja (D113 punto 8). El vínculo ya se soltó al darlo de baja: aquí solo se cierra la ejecución.
@Injectable()
export class CompleteAgentRemovalUseCase {
  constructor(private readonly repo: AgentInstallRepository) {}

  async execute(tenantId: string, executionId: string): Promise<{ executionId: string; assetId: string }> {
    const scope: TenantScope = { companyId: tenantId };
    const { assetId } = await this.repo.completeRemoval(scope, executionId, (done) => entry(scope, null, 'agent.remove', { execution_id: done.executionId, asset_id: done.assetId }));
    return { executionId, assetId };
  }
}
