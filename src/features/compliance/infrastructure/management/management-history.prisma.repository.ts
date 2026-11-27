import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { OccurrenceRecord } from '../../domain/controls/management-extras';
import type { PersonRef } from '../../domain/controls/management-state';
import { HistoryQuery, HistoryRow, HistoryType, ManagementHistoryRepository } from '../../domain/management/management-history.repository';
import { submissionCounts, SUBMISSION_STATE_SELECT } from '../evidence/evidence-state.mapper';
import { loadControlAccess } from '../shared/control-access.loader';

type Raw = { id: string; type: HistoryType; at: Date; actorId: string | null; testId: string | null; requirementId: string | null; detail: Record<string, unknown> };

// Una consulta UNION ALL por las tablas de la gestión del control: la página se arma en la base (no se trae todo para paginar en memoria). Las decisiones salen de las columnas `decided_*` y las solicitudes
// aprobadas directo (`decided_directly`) no generan la fila de decisión.
const unionSql = (controlId: string): Prisma.Sql => Prisma.sql`
  SELECT a.id, CASE WHEN a.decision = 'approved' THEN 'approval' ELSE 'return' END AS type, a.at, a.actor_id AS "actorId", NULL::uuid AS "testId", NULL::uuid AS "requirementId",
         jsonb_build_object('step', a.step, 'reason', a.reason) AS detail
    FROM tenant.control_approvals a WHERE a.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT a.id, 'approval_invalidated', a.invalidated_at, NULL, NULL, NULL, jsonb_build_object('step', a.step, 'cause', 'control_stopped_complying')
    FROM tenant.control_approvals a WHERE a.client_control_id = ${controlId}::uuid AND a.decision = 'approved' AND a.invalidated_at IS NOT NULL
  UNION ALL
  SELECT m.id, 'manual_result', m.registered_at, m.registered_by, m.test_id, NULL, jsonb_build_object('result', m.result, 'note', m.note)
    FROM tenant.manual_test_results m WHERE m.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT o.id, 'level_proposed', o.proposed_at, o.proposed_by, NULL, NULL,
         jsonb_build_object('suggested_level', o.suggested_level, 'proposed_level', o.proposed_level, 'justification', o.justification, 'status', o.status, 'decided_directly', o.decided_directly)
    FROM tenant.control_level_overrides o WHERE o.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT o.id, 'level_decided', o.decided_at, o.decided_by, NULL, NULL,
         jsonb_build_object('suggested_level', o.suggested_level, 'proposed_level', o.proposed_level, 'decision', o.status, 'reason', o.decision_reason)
    FROM tenant.control_level_overrides o WHERE o.client_control_id = ${controlId}::uuid AND o.decided_at IS NOT NULL AND NOT o.decided_directly
  UNION ALL
  SELECT p.id, 'plan_registered', p.proposed_at, p.proposed_by, p.test_id, p.client_control_requirement_id,
         jsonb_build_object('what', p.what, 'assignee_id', p.assignee_id, 'due_date', to_char(p.due_date, 'YYYY-MM-DD'), 'status', p.status, 'decided_directly', p.decided_directly)
    FROM tenant.remediation_plans p WHERE p.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT p.id, 'plan_decided', p.decided_at, p.decided_by, p.test_id, p.client_control_requirement_id, jsonb_build_object('decision', p.status, 'reason', p.decision_reason)
    FROM tenant.remediation_plans p WHERE p.client_control_id = ${controlId}::uuid AND p.decided_at IS NOT NULL AND NOT p.decided_directly
  UNION ALL
  SELECT n.id, 'not_applicable_requested', n.requested_at, n.requested_by, NULL, n.client_control_requirement_id,
         jsonb_build_object('reason', n.reason, 'status', n.status, 'decided_directly', n.decided_directly)
    FROM tenant.requirement_applicability_requests n JOIN tenant.client_control_requirements r ON r.id = n.client_control_requirement_id WHERE r.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT n.id, 'not_applicable_decided', n.decided_at, n.decided_by, NULL, n.client_control_requirement_id, jsonb_build_object('decision', n.status, 'reason', n.decision_reason)
    FROM tenant.requirement_applicability_requests n JOIN tenant.client_control_requirements r ON r.id = n.client_control_requirement_id
   WHERE r.client_control_id = ${controlId}::uuid AND n.decided_at IS NOT NULL AND NOT n.decided_directly
  UNION ALL
  SELECT n.id, 'not_applicable_reverted', n.reverted_at, n.reverted_by, NULL, n.client_control_requirement_id, jsonb_build_object('reason', n.revert_reason)
    FROM tenant.requirement_applicability_requests n JOIN tenant.client_control_requirements r ON r.id = n.client_control_requirement_id WHERE r.client_control_id = ${controlId}::uuid AND n.reverted_at IS NOT NULL
  UNION ALL
  SELECT o.id, 'occurrence_registered', o.registered_at, o.registered_by, NULL, o.client_control_requirement_id, jsonb_build_object('occurred_on', to_char(o.occurred_on, 'YYYY-MM-DD'), 'description', o.description)
    FROM tenant.requirement_occurrences o JOIN tenant.client_control_requirements r ON r.id = o.client_control_requirement_id WHERE r.client_control_id = ${controlId}::uuid
  UNION ALL
  SELECT d.id, 'no_occurrences_declared', d.declared_at, d.declared_by, NULL, d.client_control_requirement_id,
         jsonb_build_object('window_start', to_char(d.window_start, 'YYYY-MM-DD'), 'window_end', to_char(d.window_end, 'YYYY-MM-DD'), 'note', d.note)
    FROM tenant.no_occurrence_declarations d JOIN tenant.client_control_requirements r ON r.id = d.client_control_requirement_id WHERE r.client_control_id = ${controlId}::uuid`;

const LEVEL_KEYS = ['suggested_level', 'proposed_level'] as const;
const LEVELS = ['not_evaluated', 'ineffective', 'weak', 'partial', 'adequate', 'solid'];

@Injectable()
export class ManagementHistoryPrismaRepository extends ManagementHistoryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  controlAccess(scope: TenantScope, controlId: string) {
    return this.prisma.withScope(scope, async (tx) => {
      const exists = await tx.clientControl.findFirst({ where: { id: controlId }, select: { id: true } }); // también dado de baja (D119)
      if (!exists) return null;
      const access = (await loadControlAccess(tx, [controlId])).get(controlId);
      return { owner: access?.owner ?? null, executor: access?.executor ?? null };
    });
  }

  history(scope: TenantScope, controlId: string, q: HistoryQuery): Promise<{ items: HistoryRow[]; total: number }> {
    return this.prisma.withScope(scope, async (tx) => {
      const filters: Prisma.Sql[] = [Prisma.sql`h.at IS NOT NULL`];
      if (q.types.length > 0) filters.push(Prisma.sql`h.type = ANY(${[...q.types]}::text[])`);
      if (q.from) filters.push(Prisma.sql`h.at >= ${q.from}`);
      if (q.to) filters.push(Prisma.sql`h.at < ${new Date(q.to.getTime() + 86_400_000)}`);
      const where = Prisma.join(filters, ' AND ');
      const order = q.sort === 'at' ? Prisma.sql`h.at ASC, h.id ASC` : Prisma.sql`h.at DESC, h.id DESC`;
      const base = unionSql(controlId);
      const [{ n }] = await tx.$queryRaw<{ n: number }[]>(Prisma.sql`SELECT count(*)::int AS n FROM (${base}) h WHERE ${where}`);
      const raws = await tx.$queryRaw<Raw[]>(Prisma.sql`SELECT h.* FROM (${base}) h WHERE ${where} ORDER BY ${order} LIMIT ${q.pageSize} OFFSET ${(q.page - 1) * q.pageSize}`);
      return { items: await this.hydrate(tx, raws, q.includeLevels), total: n };
    });
  }

  private async hydrate(tx: TransactionClient, raws: Raw[], includeLevels: boolean): Promise<HistoryRow[]> {
    const personIds = new Set<string>();
    for (const r of raws) {
      if (r.actorId) personIds.add(r.actorId);
      const assignee = r.detail.assignee_id;
      if (typeof assignee === 'string') personIds.add(assignee);
    }
    const testIds = [...new Set(raws.flatMap((r) => (r.testId ? [r.testId] : [])))];
    const requirementIds = [...new Set(raws.flatMap((r) => (r.requirementId ? [r.requirementId] : [])))];
    const approvalIds = raws.filter((r) => r.type === 'return').map((r) => r.id);
    const [people, tests, requirements, returned] = await Promise.all([
      personIds.size ? tx.user.findMany({ where: { id: { in: [...personIds] } }, select: { id: true, name: true, lastName: true } }) : [],
      testIds.length ? tx.test.findMany({ where: { id: { in: testIds } }, select: { id: true, code: true, displayName: true, displayNameEn: true, dimension: true } }) : [],
      requirementIds.length ? tx.clientControlRequirement.findMany({ where: { id: { in: requirementIds } }, select: { id: true, controlRequirement: { select: { code: true } } } }) : [],
      approvalIds.length
        ? tx.evidenceSubmission.findMany({ where: { returnedApprovalId: { in: approvalIds } }, select: { id: true, version: true, returnedApprovalId: true, evidenceRequirement: { select: { description: true } } } })
        : [],
    ]);
    const personOf = new Map<string, PersonRef>((people as Array<{ id: string; name: string | null; lastName: string | null }>).map((p) => [p.id, { id: p.id, name: p.name, lastName: p.lastName }]));
    const testOf = new Map((tests as Array<{ id: string; code: string; displayName: string | null; displayNameEn: string | null; dimension: string }>).map((t) => [t.id, { id: t.id, code: t.code, testName: t.displayName, testNameEn: t.displayNameEn, dimension: t.dimension }] as const));
    const reqOf = new Map((requirements as Array<{ id: string; controlRequirement: { code: string } }>).map((r) => [r.id, { id: r.id, code: r.controlRequirement.code }]));
    return raws.map((r) => {
      const detail: Record<string, unknown> = { ...r.detail };
      if (r.type === 'return') detail.returned_submissions = (returned as Array<{ id: string; version: string; returnedApprovalId: string | null; evidenceRequirement: { description: string } }>).filter((s) => s.returnedApprovalId === r.id).map((s) => ({ id: s.id, version: Number(s.version) || 0, description: s.evidenceRequirement.description }));
      if (typeof detail.assignee_id === 'string') {
        detail.owner = personOf.get(detail.assignee_id) ? { id: detail.assignee_id, name: personOf.get(detail.assignee_id)?.name ?? null, last_name: personOf.get(detail.assignee_id)?.lastName ?? null } : null;
        delete detail.assignee_id;
      }
      for (const key of LEVEL_KEYS) if (key in detail) detail[key] = includeLevels ? (LEVELS[detail[key] as number] ?? null) : null;
      return { id: r.id, type: r.type, at: r.at, actor: r.actorId ? (personOf.get(r.actorId) ?? { id: r.actorId, name: null, lastName: null }) : null, test: r.testId ? (testOf.get(r.testId) ?? null) : null, requirement: r.requirementId ? (reqOf.get(r.requirementId) ?? null) : null, detail };
    });
  }

  occurrences(scope: TenantScope, controlId: string, requirementId: string, q: { quarterStart?: Date; page: number; pageSize: number }) {
    return this.prisma.withScope(scope, async (tx) => {
      const requirement = await tx.clientControlRequirement.findFirst({ where: { id: requirementId, clientControlId: controlId }, select: { id: true, controlRequirement: { select: { code: true } } } });
      if (!requirement) return null;
      const end = q.quarterStart ? new Date(Date.UTC(q.quarterStart.getUTCFullYear(), q.quarterStart.getUTCMonth() + 3, 1)) : undefined;
      const where: Prisma.RequirementOccurrenceWhereInput = { clientControlRequirementId: requirementId, ...(q.quarterStart && end ? { occurredOn: { gte: q.quarterStart, lt: end } } : {}) };
      const [total, rows] = await Promise.all([
        tx.requirementOccurrence.count({ where }),
        tx.requirementOccurrence.findMany({ where, orderBy: [{ occurredOn: 'desc' }, { id: 'desc' }], skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
      ]);
      const evidence = rows.length
        ? await tx.evidenceSubmission.findMany({ where: { requirementOccurrenceId: { in: rows.map((r) => r.id) } }, select: { requirementOccurrenceId: true, ...SUBMISSION_STATE_SELECT } })
        : [];
      const people: Array<{ id: string; name: string | null; lastName: string | null }> = rows.length ? await tx.user.findMany({ where: { id: { in: [...new Set(rows.map((r) => r.registeredBy))] } }, select: { id: true, name: true, lastName: true } }) : [];
      const personOf = new Map(people.map((p) => [p.id, p]));
      const items: OccurrenceRecord[] = rows.map((o) => {
        const count = evidence.filter((e) => e.requirementOccurrenceId === o.id && submissionCounts(e)).length;
        return { id: o.id, occurredOn: o.occurredOn, description: o.description, registeredBy: personOf.get(o.registeredBy) ?? { id: o.registeredBy, name: null, lastName: null }, registeredAt: o.registeredAt, hasEvidence: count > 0, evidenceCount: count };
      });
      return { items, total, requirement: { id: requirement.id, code: requirement.controlRequirement.code } };
    });
  }
}
