import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { resolveAttributions } from '../../../../infrastructure/database/attribution';
import { Page } from '../../../../common/pagination/page';
import { nextCode } from '../../domain/risks/risk-types';
import { loadControlAccess } from '../shared/control-access.loader';
import { NO_ACCESS } from '../../domain/controls/control-access';
import {
  CauseInput, CauseNode, CausePatch, CauseRecord, Changed, ControlLink, EvaluationEntry, GraphRef, RiskEvaluation, RiskGraph, RiskInput, RiskNode, RiskPatch, RiskRecord, RiskRepository,
  RiskTreatmentRecord,
} from '../../domain/risks/risk.repository';

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const asJson = (v: string[]) => v as unknown as Prisma.InputJsonValue;

const riskRecord = (r: { id: string; code: string; name: string; description: string; trustCriterion: string; potentialImpact: unknown; isActive: boolean }): RiskRecord => ({
  id: r.id, code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact, isActive: r.isActive,
});
const causeRecord = (c: { id: string; code: string; name: string | null; description: string; failureCategory: string | null; origin: string | null; causeType: string | null; isActive: boolean }): CauseRecord => ({
  id: c.id, code: c.code, name: c.name ?? c.description, description: c.description, failureCategory: c.failureCategory, causeOrigin: c.origin, causeType: c.causeType, isActive: c.isActive,
});

type TreatmentRow = {
  id: string; clientRiskId: string; decision: string; dueDate: Date; createdAt: Date;
  responsible: { id: string; type: string; personName: string };
};
const TREATMENT_SELECT = { id: true, clientRiskId: true, decision: true, dueDate: true, createdAt: true, responsible: { select: { id: true, type: true, personName: true } } } as const;
const toTreatment = (t: TreatmentRow): RiskTreatmentRecord => ({
  id: t.id, riskId: t.clientRiskId, decision: t.decision, responsible: { id: t.responsible.id, type: t.responsible.type, personName: t.responsible.personName }, dueDate: t.dueDate, createdAt: t.createdAt,
});
const evaluationOf = (r: { likelihood: number | null; impact: number | null; inherentRiskValue: number | null; inherentRiskLevel: string | null }): RiskEvaluation => ({
  likelihood: r.likelihood, impact: r.impact, inherentRiskValue: r.inherentRiskValue, inherentRiskLevel: r.inherentRiskLevel,
});
@Injectable()
export class RiskPrismaRepository extends RiskRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // ─── lectura ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  loadGraph(scope: TenantScope, ref: GraphRef): Promise<RiskGraph | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const serviceId = await this.serviceOf(tx, scope, ref);
      if (!serviceId) return null;

      const risks = await tx.clientRisk.findMany({ where: { serviceId }, orderBy: { code: 'asc' }, include: { riskCauses: { select: { clientCauseId: true } }, riskTreatments: { orderBy: { createdAt: 'desc' }, take: 1, select: TREATMENT_SELECT } } });
      const causes = await tx.clientCause.findMany({
        where: { serviceId },
        orderBy: { code: 'asc' },
        include: {
          riskCauses: { select: { clientRiskId: true } },
          causeControls: {
            select: {
              isMandatory: true, effect: true,
              clientControl: {
                select: {
                  id: true, ownCode: true, name: true, isActive: true,
                  control: { select: { name: true, code: true } },
                },
              },
            },
          },
        },
      });

      // D102 · Qué controles son de qué persona sale de su dueño y ejecutor.
      const accessOf = await loadControlAccess(tx, [...new Set(causes.flatMap((c) => c.causeControls.map((l) => l.clientControl.id)))]);

      return {
        serviceId,
        risks: risks.map<RiskNode>((r) => ({
          id: r.id, serviceId, code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact,
          origin: r.riskId ? 'catalog' : 'own', isActive: r.isActive, likelihood: r.likelihood, impact: r.impact, inherentRiskValue: r.inherentRiskValue,
          inherentRiskLevel: r.inherentRiskLevel, treatment: r.riskTreatments[0] ? toTreatment(r.riskTreatments[0]) : null, causeIds: r.riskCauses.map((x) => x.clientCauseId),
        })),
        causes: causes.map<CauseNode>((c) => ({
          id: c.id, serviceId, code: c.code, name: c.name ?? c.description, description: c.description, failureCategory: c.failureCategory, origin: c.causeId ? 'catalog' : 'own', causeOrigin: c.origin, causeType: c.causeType,
          isActive: c.isActive, riskIds: c.riskCauses.map((x) => x.clientRiskId),
          controls: c.causeControls
            .filter((l) => l.clientControl.isActive)
            .map<ControlLink>((l) => ({
              controlId: l.clientControl.id, ownCode: l.clientControl.ownCode, name: l.clientControl.control?.name ?? l.clientControl.name ?? l.clientControl.ownCode,
              origin: l.clientControl.control ? 'catalog' : 'own', catalogCode: l.clientControl.control?.code ?? null, isMandatory: l.isMandatory, effect: l.effect,
              access: accessOf.get(l.clientControl.id) ?? NO_ACCESS,
            })),
        })),
      };
    });
  }

  private async serviceOf(tx: TransactionClient, scope: TenantScope, ref: GraphRef): Promise<string | null> {
    if ('serviceId' in ref) {
      const s = await tx.service.findFirst({ where: { id: ref.serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      return s?.id ?? null;
    }
    if ('riskId' in ref) return (await tx.clientRisk.findFirst({ where: { id: ref.riskId }, select: { serviceId: true } }))?.serviceId ?? null;
    return (await tx.clientCause.findFirst({ where: { id: ref.causeId }, select: { serviceId: true } }))?.serviceId ?? null;
  }

  // ─── riesgos ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  async createRisk(scope: TenantScope, serviceId: string, input: RiskInput, audit: Parameters<RiskRepository['createRisk']>[3]): Promise<RiskRecord | null> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.withScope(scope, async (tx) => {
          const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
          if (!service) return null;
          const code = input.code ?? nextCode('R', (await tx.clientRisk.findMany({ where: { serviceId }, select: { code: true } })).map((r) => r.code));
          const row = await tx.clientRisk.create({
            data: { tenantId: scope.companyId, serviceId, riskId: null, code, name: input.name, description: input.description, trustCriterion: input.trustCriterion as never, potentialImpact: asJson(input.potentialImpact), isActive: true },
          });
          const record = riskRecord(row);
          await insertAuditLog(tx, audit(record));
          return record;
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          // Un código que la empresa eligió y ya existe es un conflicto; uno asignado por el servidor se reintenta (otra alta se llevó el mismo).
          if (input.code || attempt >= 3) throw new DomainError('CODE_ALREADY_EXISTS');
          continue;
        }
        throw e;
      }
    }
  }

  updateRisk(scope: TenantScope, id: string, patch: RiskPatch, audit: Parameters<RiskRepository['updateRisk']>[3]): Promise<Changed<RiskRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.clientRisk.findFirst({ where: { id } });
      if (!before) return null;
      if (!before.isActive) throw new DomainError('RISK_INACTIVE');
      const after = await tx.clientRisk.update({
        where: { id },
        data: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.trustCriterion !== undefined ? { trustCriterion: patch.trustCriterion as never } : {}),
          ...(patch.potentialImpact !== undefined ? { potentialImpact: asJson(patch.potentialImpact) } : {}),
        },
      });
      const change = { before: riskRecord(before), after: riskRecord(after) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  deactivateRisk(scope: TenantScope, id: string, audit: Parameters<RiskRepository['deactivateRisk']>[2]): Promise<Changed<RiskRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.clientRisk.findFirst({ where: { id } });
      if (!before) return null;
      if (!before.isActive) return { before: riskRecord(before), after: riskRecord(before) }; // ya estaba de baja: no hay cambio ni rastro
      const after = await tx.clientRisk.update({ where: { id }, data: { isActive: false } });
      const change = { before: riskRecord(before), after: riskRecord(after) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  reactivateRisk(scope: TenantScope, id: string, audit: Parameters<RiskRepository['reactivateRisk']>[2]): Promise<Changed<RiskRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.clientRisk.findFirst({ where: { id } });
      if (!before) return null;
      if (before.isActive) return { before: riskRecord(before), after: riskRecord(before) }; // ya estaba vigente: no hay cambio ni rastro
      const after = await tx.clientRisk.update({ where: { id }, data: { isActive: true } });
      const change = { before: riskRecord(before), after: riskRecord(after) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  // ─── causas ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  async createCause(scope: TenantScope, serviceId: string, input: CauseInput, audit: Parameters<RiskRepository['createCause']>[3]): Promise<CauseRecord | null> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.withScope(scope, async (tx) => {
          const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
          if (!service) return null;
          const code = input.code ?? nextCode('F', (await tx.clientCause.findMany({ where: { serviceId }, select: { code: true } })).map((c) => c.code));
          const row = await tx.clientCause.create({
            data: { tenantId: scope.companyId, serviceId, causeId: null, code, name: input.name, description: input.description, failureCategory: input.failureCategory as never, origin: (input.causeOrigin ?? null) as never, causeType: (input.causeType ?? null) as never, isActive: true },
          });
          const record = causeRecord(row);
          await insertAuditLog(tx, audit(record));
          return record;
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          if (input.code || attempt >= 3) throw new DomainError('CODE_ALREADY_EXISTS');
          continue;
        }
        throw e;
      }
    }
  }

  updateCause(scope: TenantScope, id: string, patch: CausePatch, audit: Parameters<RiskRepository['updateCause']>[3], guard?: Parameters<RiskRepository['updateCause']>[4]): Promise<Changed<CauseRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.clientCause.findFirst({ where: { id } });
      if (!before) return null;
      if (!before.isActive) throw new DomainError('CAUSE_INACTIVE');
      guard?.({ fromCatalog: before.causeId !== null });
      const after = await tx.clientCause.update({
        where: { id },
        data: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.failureCategory !== undefined ? { failureCategory: patch.failureCategory as never } : {}),
          ...(patch.causeOrigin !== undefined ? { origin: patch.causeOrigin as never } : {}),
          ...(patch.causeType !== undefined ? { causeType: patch.causeType as never } : {}),
        },
      });
      const change = { before: causeRecord(before), after: causeRecord(after) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  deactivateCause(scope: TenantScope, id: string, audit: Parameters<RiskRepository['deactivateCause']>[2]): Promise<Changed<CauseRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.clientCause.findFirst({ where: { id } });
      if (!before) return null;
      if (!before.isActive) return { before: causeRecord(before), after: causeRecord(before) };
      const after = await tx.clientCause.update({ where: { id }, data: { isActive: false } });
      const change = { before: causeRecord(before), after: causeRecord(after) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  // ─── vínculos ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  linkRiskCause(scope: TenantScope, riskId: string, causeId: string, audit: Parameters<RiskRepository['linkRiskCause']>[3]): Promise<void> {
    return this.prisma.withScope(scope, async (tx) => {
      const risk = await tx.clientRisk.findFirst({ where: { id: riskId }, select: { serviceId: true, isActive: true } });
      const cause = await tx.clientCause.findFirst({ where: { id: causeId }, select: { serviceId: true, isActive: true } });
      // Ambos lados deben ser de la misma empresa (RLS) y del mismo servicio: si no, para quien pregunta no existen.
      if (!risk || !cause || risk.serviceId !== cause.serviceId) throw new DomainError('NOT_FOUND');
      if (!risk.isActive) throw new DomainError('RISK_INACTIVE');
      if (!cause.isActive) throw new DomainError('CAUSE_INACTIVE');
      try {
        await tx.clientRiskCause.create({ data: { tenantId: scope.companyId, clientRiskId: riskId, clientCauseId: causeId } });
      } catch (e) {
        if (isUniqueViolation(e)) throw new DomainError('LINK_ALREADY_EXISTS');
        throw e;
      }
      await insertAuditLog(tx, audit({ riskId, causeId }));
    });
  }

  unlinkRiskCause(scope: TenantScope, riskId: string, causeId: string, audit: Parameters<RiskRepository['unlinkRiskCause']>[3]): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const { count } = await tx.clientRiskCause.deleteMany({ where: { clientRiskId: riskId, clientCauseId: causeId } });
      if (count > 0) await insertAuditLog(tx, audit({ riskId, causeId }));
      return count > 0;
    });
  }

  linkCauseControl(scope: TenantScope, causeId: string, controlId: string, options: { isMandatory: boolean; effect: 'probability' | 'impact' | null }, audit: Parameters<RiskRepository['linkCauseControl']>[4]): Promise<void> {
    return this.prisma.withScope(scope, async (tx) => {
      const cause = await tx.clientCause.findFirst({ where: { id: causeId }, select: { serviceId: true, isActive: true } });
      const control = await tx.clientControl.findFirst({ where: { id: controlId, isActive: true }, select: { serviceId: true } });
      if (!cause || !control || cause.serviceId !== control.serviceId) throw new DomainError('NOT_FOUND');
      if (!cause.isActive) throw new DomainError('CAUSE_INACTIVE');
      try {
        await tx.clientCauseControl.create({ data: { tenantId: scope.companyId, clientCauseId: causeId, clientControlId: controlId, isMandatory: options.isMandatory, effect: options.effect } });
      } catch (e) {
        if (isUniqueViolation(e)) throw new DomainError('LINK_ALREADY_EXISTS');
        throw e;
      }
      await insertAuditLog(tx, audit({ causeId, controlId, isMandatory: options.isMandatory, effect: options.effect }));
    });
  }

  unlinkCauseControl(scope: TenantScope, causeId: string, controlId: string, audit: Parameters<RiskRepository['unlinkCauseControl']>[3]): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const { count } = await tx.clientCauseControl.deleteMany({ where: { clientCauseId: causeId, clientControlId: controlId } });
      if (count > 0) await insertAuditLog(tx, audit({ causeId, controlId }));
      return count > 0;
    });
  }

  // ─── evaluación 5×5 y tratamiento (MD-123) ───────────────────────────────────────
  evaluateRisk(
    scope: TenantScope,
    riskId: string,
    next: { likelihood: number; impact: number; inherentRiskValue: number; inherentRiskLevel: string; evaluatedBy: string },
    audit: Parameters<RiskRepository['evaluateRisk']>[3],
  ): ReturnType<RiskRepository['evaluateRisk']> {
    return this.prisma.withScope(scope, async (tx) => {
      const current = await tx.clientRisk.findFirst({ where: { id: riskId } });
      if (!current) return null;
      if (!current.isActive) throw new DomainError('RISK_INACTIVE');
      const updated = await tx.clientRisk.update({
        where: { id: riskId },
        data: { likelihood: next.likelihood, impact: next.impact, inherentRiskValue: next.inherentRiskValue, inherentRiskLevel: next.inherentRiskLevel as never },
      });
      const change = { riskId, before: evaluationOf(current), after: evaluationOf(updated) };
      await insertAuditLog(tx, audit(change));
      const by = await tx.user.findFirst({ where: { id: next.evaluatedBy }, select: { id: true, name: true, lastName: true } });
      return { before: change.before, after: change.after, evaluatedBy: by ? { id: by.id, name: by.name, lastName: by.lastName } : null, evaluatedAt: updated.updatedAt };
    });
  }

  evaluationHistory(scope: TenantScope, riskId: string, page: { page: number; pageSize: number }): Promise<Page<EvaluationEntry> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await tx.clientRisk.findFirst({ where: { id: riskId }, select: { id: true } }))) return null;
      // Cada evaluación es una fila de la auditoría con lo anterior (`before_state`) y lo nuevo (`after_state`); la auditoría no se edita ni se borra.
      const where = { action: 'client_risk.evaluate', afterState: { path: ['risk_id'], equals: riskId } };
      const total = await tx.auditLog.count({ where });
      const rows = await tx.auditLog.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (page.page - 1) * page.pageSize, take: page.pageSize,
        select: { beforeState: true, afterState: true, createdAt: true, userId: true },
      });
      // `audit_logs.user_id` no tiene clave foránea (D117): se resuelve la persona, o su sello si ya no existe.
      const people = await resolveAttributions(tx, rows.map((r) => r.userId));
      const read = (state: unknown): RiskEvaluation | null => {
        const v = state as { likelihood?: number | null; impact?: number | null; inherent_risk_value?: number | null; inherent_risk_level?: string | null } | null;
        return v ? { likelihood: v.likelihood ?? null, impact: v.impact ?? null, inherentRiskValue: v.inherent_risk_value ?? null, inherentRiskLevel: v.inherent_risk_level ?? null } : null;
      };
      const items = rows.map<EvaluationEntry>((r) => {
        const before = read(r.beforeState);
        return {
          riskId,
          current: read(r.afterState) as EvaluationEntry['current'],
          // La primera evaluación no tiene valor previo: todos sus campos eran nulos.
          previous: before && before.likelihood !== null ? before : null,
          evaluatedBy: r.userId && people.has(r.userId) ? { id: r.userId, name: people.get(r.userId)!.name, lastName: people.get(r.userId)!.lastName } : null,
          evaluatedAt: r.createdAt,
        };
      });
      return { items, total, page: page.page, pageSize: page.pageSize };
    });
  }

  createTreatment(
    scope: TenantScope,
    riskId: string,
    input: { decision: string; responsibleId: string; dueDate: Date; createdBy: string },
    audit: Parameters<RiskRepository['createTreatment']>[3],
  ): Promise<RiskTreatmentRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const risk = await tx.clientRisk.findFirst({ where: { id: riskId }, select: { id: true, isActive: true } });
      if (!risk) return null;
      // El cargo debe ser de esta empresa (la RLS lo garantiza): uno ajeno es 404, nunca se revela.
      if (!(await tx.organizationResponsible.findFirst({ where: { id: input.responsibleId }, select: { id: true } }))) throw new DomainError('NOT_FOUND');
      if (!risk.isActive) throw new DomainError('RISK_INACTIVE');
      const row = await tx.riskTreatment.create({
        data: { tenantId: scope.companyId, clientRiskId: riskId, responsibleId: input.responsibleId, decision: input.decision as never, dueDate: input.dueDate, createdBy: input.createdBy },
        select: TREATMENT_SELECT,
      });
      const created = toTreatment(row);
      await insertAuditLog(tx, audit(created));
      return created;
    });
  }

  listTreatments(scope: TenantScope, riskId: string, page: { page: number; pageSize: number }): Promise<Page<RiskTreatmentRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await tx.clientRisk.findFirst({ where: { id: riskId }, select: { id: true } }))) return null;
      const total = await tx.riskTreatment.count({ where: { clientRiskId: riskId } });
      const rows = await tx.riskTreatment.findMany({
        where: { clientRiskId: riskId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page.page - 1) * page.pageSize, take: page.pageSize, select: TREATMENT_SELECT,
      });
      return { items: rows.map(toTreatment), total, page: page.page, pageSize: page.pageSize };
    });
  }
}
