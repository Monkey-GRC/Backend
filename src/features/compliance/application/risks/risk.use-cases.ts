import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { CauseInput, CauseNode, CausePatch, RiskGraph, RiskInput, RiskNode, RiskPatch, RiskRepository } from '../../domain/risks/risk.repository';
import { classificationErrorsOf } from '../../domain/risks/cause-classification';
import { storedLossTypes, LossType } from '../../domain/risks/risk-types';
import { ViewMode, viewModeOf } from '../shared/view-access';
import { canSeeControl } from '../../domain/controls/control-access';
import { isScoped } from '../../../../common/authorization/permission-matrix';

// MD-122 · Riesgos y causas de un servicio. Los ven `admin_empresa`, `auditor` y, acotados a lo suyo, `responsable` y `delegado`; los gestiona `admin_empresa` (lo impone @Can en la ruta). D150: el
// `responsable` también EDITA un riesgo (`PATCH /risks/{id}`) si alguna de sus causas llega a un control del que es dueño.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const audit = (p: Principal, meta: RequestMeta, action: string, resource: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource, result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});

export const activeCauses = (graph: RiskGraph, risk: RiskNode): CauseNode[] => graph.causes.filter((c) => c.isActive && risk.causeIds.includes(c.id));
export const activeRisks = (graph: RiskGraph, cause: CauseNode): RiskNode[] => graph.risks.filter((r) => r.isActive && cause.riskIds.includes(r.id));

// Una causa es del `responsable` si alguna de las acciones que la mitigan se le asignó; un riesgo, si alguna de sus causas lo es.
const causeIsMine = (p: Principal, c: CauseNode) => c.controls.some((k) => canSeeControl(p, k.access));
const riskIsMine = (p: Principal, g: RiskGraph, r: RiskNode) => activeCauses(g, r).some((c) => causeIsMine(p, c));
const mayRead = (p: Principal, ok: () => boolean) => !isScoped('risks.view', p.role) || ok();

export type RiskView = { view: ViewMode; graph: RiskGraph };
export type RiskFilters = { page: number; pageSize: number; includeInactive?: boolean; origin?: string; trustCriterion?: string; level?: string; evaluated?: boolean; view?: 'technical' };
export type CauseFilters = { page: number; pageSize: number; includeInactive?: boolean; origin?: string; failureCategory?: string; riskId?: string; view?: 'technical' };

async function load(repo: RiskRepository, p: Principal, ref: Parameters<RiskRepository['loadGraph']>[1]): Promise<RiskGraph> {
  const graph = await repo.loadGraph(scopeOf(p), ref);
  if (!graph) throw new DomainError('NOT_FOUND');
  return graph;
}
const paginate = <T>(items: T[], page: number, pageSize: number): Page<T> => ({ items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize });

// ─── riesgos ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
@Injectable()
export class ListRisksUseCase {
  constructor(private readonly repo: RiskRepository) {}
  async execute(p: Principal, serviceId: string, f: RiskFilters): Promise<{ view: ViewMode; graph: RiskGraph; page: Page<RiskNode> }> {
    const view = viewModeOf(p, f.view);
    const graph = await load(this.repo, p, { serviceId });
    const items = graph.risks.filter(
      (r) =>
        (f.includeInactive || r.isActive) &&
        mayRead(p, () => riskIsMine(p, graph, r)) &&
        (!f.origin || r.origin === f.origin) &&
        (!f.trustCriterion || r.trustCriterion === f.trustCriterion) &&
        (!f.level || r.inherentRiskLevel === f.level) &&
        (f.evaluated === undefined || (r.inherentRiskLevel !== null) === f.evaluated),
    );
    return { view, graph, page: paginate(items, f.page, f.pageSize) };
  }
}

@Injectable()
export class GetRiskUseCase {
  constructor(private readonly repo: RiskRepository) {}
  async execute(p: Principal, riskId: string, v: 'technical' | undefined): Promise<{ view: ViewMode; graph: RiskGraph; risk: RiskNode }> {
    const view = viewModeOf(p, v);
    const graph = await load(this.repo, p, { riskId });
    const risk = graph.risks.find((r) => r.id === riskId) as RiskNode;
    if (!mayRead(p, () => riskIsMine(p, graph, risk))) throw new DomainError('FORBIDDEN');
    return { view, graph, risk };
  }
}

@Injectable()
export class CreateRiskUseCase {
  constructor(private readonly repo: RiskRepository, private readonly get: GetRiskUseCase) {}
  async execute(p: Principal, serviceId: string, dto: { code?: string; name: string; description: string; trust_criterion: string; potential_impact: string[] }, meta: RequestMeta) {
    const input: RiskInput = { code: dto.code, name: dto.name.trim(), description: dto.description.trim(), trustCriterion: dto.trust_criterion, potentialImpact: storedLossTypes(dto.potential_impact as LossType[]) };
    const created = await this.repo.createRisk(scopeOf(p), serviceId, input, (done) => audit(p, meta, 'client_risk.create', 'client_risk', null, done));
    if (!created) throw new DomainError('NOT_FOUND');
    return this.get.execute(p, created.id, undefined);
  }
}

@Injectable()
export class UpdateRiskUseCase {
  constructor(private readonly repo: RiskRepository, private readonly get: GetRiskUseCase) {}
  async execute(p: Principal, id: string, dto: { name?: string; description?: string; trust_criterion?: string; potential_impact?: string[] }, meta: RequestMeta) {
    // D150 · Existe y es de su empresa, pero un `responsable` solo edita un riesgo ligado a sus controles: leerlo ya lo comprueba (404 o 403).
    if (isScoped('risks.edit', p.role)) await this.get.execute(p, id, undefined);
    const patch: RiskPatch = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
      ...(dto.trust_criterion !== undefined ? { trustCriterion: dto.trust_criterion } : {}),
      ...(dto.potential_impact !== undefined ? { potentialImpact: storedLossTypes(dto.potential_impact as LossType[]) } : {}),
    };
    const changed = await this.repo.updateRisk(scopeOf(p), id, patch, (done) => audit(p, meta, 'client_risk.update', 'client_risk', done.before, done.after));
    if (!changed) throw new DomainError('NOT_FOUND');
    return this.get.execute(p, id, undefined);
  }
}

@Injectable()
export class DeactivateRiskUseCase {
  constructor(private readonly repo: RiskRepository) {}
  // `reason` (D93): por qué el riesgo no aplica al servicio. No tiene columna propia: va en el rastro de auditoría de la baja, junto al estado de antes y de después.
  async execute(p: Principal, id: string, meta: RequestMeta, reason?: string): Promise<void> {
    const why = reason?.trim();
    const changed = await this.repo.deactivateRisk(scopeOf(p), id, (done) =>
      audit(p, meta, 'client_risk.deactivate', 'client_risk', done.before, why ? { ...done.after, retirement_reason: why } : done.after),
    );
    if (!changed) throw new DomainError('NOT_FOUND');
  }
}

@Injectable()
export class ReactivateRiskUseCase {
  constructor(private readonly repo: RiskRepository, private readonly get: GetRiskUseCase) {}
  // D93 · Devuelve al servicio un riesgo retirado. Conserva su evaluación anterior, si la tenía.
  async execute(p: Principal, id: string, meta: RequestMeta) {
    const changed = await this.repo.reactivateRisk(scopeOf(p), id, (done) => audit(p, meta, 'client_risk.reactivate', 'client_risk', done.before, done.after));
    if (!changed) throw new DomainError('NOT_FOUND');
    return this.get.execute(p, id, undefined);
  }
}

// ─── causas ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
@Injectable()
export class ListCausesUseCase {
  constructor(private readonly repo: RiskRepository) {}
  async execute(p: Principal, serviceId: string, f: CauseFilters): Promise<{ view: ViewMode; graph: RiskGraph; page: Page<CauseNode> }> {
    const view = viewModeOf(p, f.view);
    const graph = await load(this.repo, p, { serviceId });
    const items = graph.causes.filter(
      (c) =>
        (f.includeInactive || c.isActive) &&
        mayRead(p, () => causeIsMine(p, c)) &&
        (!f.origin || c.origin === f.origin) &&
        (!f.failureCategory || c.failureCategory === f.failureCategory) &&
        (!f.riskId || c.riskIds.includes(f.riskId)),
    );
    return { view, graph, page: paginate(items, f.page, f.pageSize) };
  }
}

@Injectable()
export class GetCauseUseCase {
  constructor(private readonly repo: RiskRepository) {}
  async execute(p: Principal, causeId: string, v: 'technical' | undefined): Promise<{ view: ViewMode; graph: RiskGraph; cause: CauseNode }> {
    const view = viewModeOf(p, v);
    const graph = await load(this.repo, p, { causeId });
    const cause = graph.causes.find((c) => c.id === causeId) as CauseNode;
    if (!mayRead(p, () => causeIsMine(p, cause))) throw new DomainError('FORBIDDEN');
    return { view, graph, cause };
  }
}

@Injectable()
export class CreateCauseUseCase {
  constructor(private readonly repo: RiskRepository, private readonly get: GetCauseUseCase) {}
  async execute(p: Principal, serviceId: string, dto: { code?: string; name: string; description: string; failure_category: string; cause_origin?: string | null; cause_type?: string | null }, meta: RequestMeta) {
    const input: CauseInput = { code: dto.code, name: dto.name.trim(), description: dto.description.trim(), failureCategory: dto.failure_category, causeOrigin: dto.cause_origin ?? null, causeType: dto.cause_type ?? null };
    const created = await this.repo.createCause(scopeOf(p), serviceId, input, (done) => audit(p, meta, 'client_cause.create', 'client_cause', null, done));
    if (!created) throw new DomainError('NOT_FOUND');
    return this.get.execute(p, created.id, undefined);
  }
}

@Injectable()
export class UpdateCauseUseCase {
  constructor(private readonly repo: RiskRepository, private readonly get: GetCauseUseCase) {}
  async execute(p: Principal, id: string, dto: { name?: string; description?: string; failure_category?: string; cause_origin?: string | null; cause_type?: string | null }, meta: RequestMeta) {
    const patch: CausePatch = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
      ...(dto.failure_category !== undefined ? { failureCategory: dto.failure_category } : {}),
      ...(dto.cause_origin !== undefined ? { causeOrigin: dto.cause_origin } : {}),
      ...(dto.cause_type !== undefined ? { causeType: dto.cause_type } : {}),
    };
    const changed = await this.repo.updateCause(scopeOf(p), id, patch, (done) => audit(p, meta, 'client_cause.update', 'client_cause', done.before, done.after), (cause) => {
      // Dentro de la transacción del repositorio: el 422 la deshace.
      const errors = classificationErrorsOf(cause, patch);
      if (errors.length > 0) throw new ValidationException(errors);
    });
    if (!changed) throw new DomainError('NOT_FOUND');
    return this.get.execute(p, id, undefined);
  }
}

@Injectable()
export class DeactivateCauseUseCase {
  constructor(private readonly repo: RiskRepository) {}
  async execute(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    const changed = await this.repo.deactivateCause(scopeOf(p), id, (done) => audit(p, meta, 'client_cause.deactivate', 'client_cause', done.before, done.after));
    if (!changed) throw new DomainError('NOT_FOUND');
  }
}

// ─── vínculos ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
@Injectable()
export class LinkUseCases {
  constructor(private readonly repo: RiskRepository) {}

  linkRiskCause(p: Principal, riskId: string, causeId: string, meta: RequestMeta) {
    return this.repo.linkRiskCause(scopeOf(p), riskId, causeId, (done) => audit(p, meta, 'client_risk_cause.link', 'client_risk_cause', null, { risk_id: done.riskId, cause_id: done.causeId }));
  }
  async unlinkRiskCause(p: Principal, riskId: string, causeId: string, meta: RequestMeta) {
    const removed = await this.repo.unlinkRiskCause(scopeOf(p), riskId, causeId, (done) => audit(p, meta, 'client_risk_cause.unlink', 'client_risk_cause', { risk_id: done.riskId, cause_id: done.causeId }, null));
    if (!removed) throw new DomainError('NOT_FOUND');
  }
  linkCauseControl(p: Principal, causeId: string, controlId: string, options: { isMandatory: boolean; effect: 'probability' | 'impact' | null }, meta: RequestMeta) {
    return this.repo.linkCauseControl(scopeOf(p), causeId, controlId, options, (done) =>
      audit(p, meta, 'client_cause_control.link', 'client_cause_control', null, { cause_id: done.causeId, control_id: done.controlId, is_mandatory: done.isMandatory, effect: done.effect }),
    );
  }
  async unlinkCauseControl(p: Principal, causeId: string, controlId: string, meta: RequestMeta) {
    const removed = await this.repo.unlinkCauseControl(scopeOf(p), causeId, controlId, (done) =>
      audit(p, meta, 'client_cause_control.unlink', 'client_cause_control', { cause_id: done.causeId, control_id: done.controlId }, null),
    );
    if (!removed) throw new DomainError('NOT_FOUND');
  }
}
