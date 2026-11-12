import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { lockActorAndSubject, lockControlRows } from '../../../../infrastructure/database/row-locks';
import { ControlFact, planExecutorAssignment, planOwnerAssignment, PersonFact } from '../../domain/assignment-plan';
import { ReleasedControl } from '../../domain/team.types';
import { TeamAssignmentRepository } from '../../domain/repositories/team-assignment.repository';

type AssignmentRow = { id: string; client_control_id: string; owner_id: string; executor_id: string | null };

@Injectable()
export class TeamAssignmentPrismaRepository extends TeamAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  setOwner(scope: TenantScope, input: { controlIds: string[]; ownerId: string | null }, audit: AuditIntent<ReleasedControl[]>): Promise<ReleasedControl[]> {
    return this.prisma.withScope(scope, async (tx) => {
      // Un dueño que se está desactivando (MD-191) toma su fila FOR UPDATE: con KEY SHARE (el mismo modo que el insert de la FK) esta transacción espera a la baja, o la baja espera a esta.
      // Después de bloquearlo se relee su estado: nunca se asigna a quien ya no está vigente, y la baja que llega luego ve estas asignaciones y las libera.
      await lockActorAndSubject(tx, scope.userId, input.ownerId, 'KEY SHARE', 'KEY SHARE');
      const owner = input.ownerId ? await this.person(tx, input.ownerId) : null;
      const { controls, rows } = await this.lockControls(tx, input.controlIds);
      const changes = planOwnerAssignment({ actorId: scope.userId as string, ownerId: input.ownerId, owner, requested: input.controlIds, controls });
      await this.apply(tx, scope, changes, rows);
      return this.audited(tx, changes, audit);
    });
  }

  setExecutor(scope: TenantScope, input: { controlIds: string[]; executorId: string | null }, audit: AuditIntent<ReleasedControl[]>): Promise<ReleasedControl[]> {
    return this.prisma.withScope(scope, async (tx) => {
      // La fila del delegado se bloquea con KEY SHARE: choca con el FOR UPDATE de moverlo (MD-189) y de desactivarlo (MD-191). Se relee su estado y su grupo ya bloqueada.
      await lockActorAndSubject(tx, scope.userId, input.executorId, 'KEY SHARE', 'KEY SHARE');
      const executor = input.executorId ? await this.person(tx, input.executorId) : null;
      const { controls, rows } = await this.lockControls(tx, input.controlIds);
      const changes = planExecutorAssignment({ actorId: scope.userId as string, executorId: input.executorId, executor, requested: input.controlIds, controls });
      await this.apply(tx, scope, changes, rows);
      return this.audited(tx, changes, audit);
    });
  }

  private async person(tx: TransactionClient, id: string): Promise<PersonFact | null> {
    const found = await tx.user.findFirst({ where: { id }, select: { id: true, role: true, status: true, group: { select: { kind: true, leaderId: true } } } });
    return found ? { id: found.id, role: found.role, status: found.status, groupKind: found.group?.kind ?? null, leaderId: found.group?.leaderId ?? null } : null;
  }

  // Las filas de los controles (FOR NO KEY UPDATE, por id) y, ya con ellas, las asignaciones que tengan (FOR UPDATE, por id). Quien no tiene fila está «Sin asignar».
  private async lockControls(tx: TransactionClient, ids: string[]): Promise<{ controls: ControlFact[]; rows: Map<string, AssignmentRow> }> {
    const found = await lockControlRows(tx, ids);
    const assignments = found.length
      ? await tx.$queryRaw<AssignmentRow[]>(Prisma.sql`
          SELECT id, client_control_id, owner_id, executor_id FROM platform.client_control_assignments WHERE client_control_id = ANY(${found.map((c) => c.id)}::uuid[]) ORDER BY id FOR UPDATE`)
      : [];
    const rows = new Map(assignments.map((r) => [r.client_control_id, r]));
    const controls = found.map((c) => {
      const row = rows.get(c.id);
      return { id: c.id, isActive: c.isActive, assignment: row ? { ownerId: row.owner_id, executorId: row.executor_id } : null };
    });
    return { controls, rows };
  }

  // Escribe solo lo que cambia, con un número fijo de sentencias (en lote, por id): «Sin asignar» borra la fila; sin fila se inserta; con fila se actualiza (otro dueño: dueño nuevo, ejecutor limpio y
  // asignación nueva; mismo dueño: solo el ejecutor). Las filas ya están bloqueadas (y los controles también: nadie inserta en medio).
  private async apply(tx: TransactionClient, scope: TenantScope, changes: ReleasedControl[], rows: Map<string, AssignmentRow>): Promise<void> {
    const by = scope.userId as string;
    const byId = (a: ReleasedControl, b: ReleasedControl) => a.controlId.localeCompare(b.controlId);
    const ordered = [...changes].sort(byId);
    const removed = ordered.filter((c) => c.after.ownerId === null);
    const kept = ordered.filter((c) => c.after.ownerId !== null);
    const created = kept.filter((c) => !rows.has(c.controlId));
    const updated = kept.filter((c) => rows.has(c.controlId));
    const reassigned = updated.filter((c) => c.before.ownerId !== c.after.ownerId);
    const executorOnly = updated.filter((c) => c.before.ownerId === c.after.ownerId);

    if (removed.length) await tx.$executeRaw(Prisma.sql`DELETE FROM platform.client_control_assignments WHERE id = ANY(${removed.map((c) => (rows.get(c.controlId) as AssignmentRow).id)}::uuid[])`);
    if (created.length) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO platform.client_control_assignments (id, company_id, client_control_id, owner_id, executor_id, assigned_by, updated_at)
        SELECT gen_random_uuid(), ${scope.companyId}::uuid, v.control_id, v.owner_id, v.executor_id, ${by}::uuid, now()
          FROM unnest(${created.map((c) => c.controlId)}::uuid[], ${created.map((c) => c.after.ownerId)}::uuid[], ${created.map((c) => c.after.executorId)}::uuid[]) AS v(control_id, owner_id, executor_id)
         ORDER BY v.control_id`);
    }
    if (reassigned.length) {
      await tx.$executeRaw(Prisma.sql`
        UPDATE platform.client_control_assignments a SET owner_id = v.owner_id, executor_id = v.executor_id, assigned_by = ${by}::uuid, assigned_at = now(), updated_at = now()
          FROM unnest(${reassigned.map((c) => (rows.get(c.controlId) as AssignmentRow).id)}::uuid[], ${reassigned.map((c) => c.after.ownerId)}::uuid[], ${reassigned.map((c) => c.after.executorId)}::uuid[]) AS v(id, owner_id, executor_id)
         WHERE a.id = v.id`);
    }
    if (executorOnly.length) {
      await tx.$executeRaw(Prisma.sql`
        UPDATE platform.client_control_assignments a SET executor_id = v.executor_id, assigned_by = ${by}::uuid, updated_at = now()
          FROM unnest(${executorOnly.map((c) => (rows.get(c.controlId) as AssignmentRow).id)}::uuid[], ${executorOnly.map((c) => c.after.executorId)}::uuid[]) AS v(id, executor_id)
         WHERE a.id = v.id`);
    }
  }

  private async audited(tx: TransactionClient, changes: ReleasedControl[], audit: AuditIntent<ReleasedControl[]>): Promise<ReleasedControl[]> {
    if (changes.length) await insertAuditLog(tx, audit(changes));
    return changes;
  }
}
