import { isDeepStrictEqual } from 'node:util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { PARAMETER_KEYS, ParameterUnit, ParameterValue } from '../../../../common/evaluation-parameters/parameter-definitions';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersAdminRepository, ParameterChange, ParameterDecision, ParameterRecord } from '../../domain/repositories/evaluation-parameters.repository';

const SELECT = {
  key: true, code: true, unit: true, value: true, defaultValue: true, sortOrder: true, updatedAt: true,
  updatedBy: { select: { id: true, name: true, lastName: true, email: true } },
} as const;
type Row = Prisma.EvaluationParameterGetPayload<{ select: typeof SELECT }>;

const toRecord = (r: Row): ParameterRecord => ({
  key: r.key, code: r.code, unit: r.unit as ParameterUnit, value: r.value as ParameterValue, defaultValue: r.defaultValue as ParameterValue, updatedAt: r.updatedAt,
  updatedBy: r.updatedBy ? { id: r.updatedBy.id, name: [r.updatedBy.name, r.updatedBy.lastName].filter(Boolean).join(' ') || r.updatedBy.email } : null,
});

@Injectable()
export class EvaluationParametersAdminPrismaRepository extends EvaluationParametersAdminRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  list(scope: TenantScope): Promise<ParameterRecord[]> {
    return this.prisma.withScope(scope, (tx) => this.all(tx));
  }

  change(scope: TenantScope, key: string, userId: string, decide: ParameterDecision, audit: AuditIntent<ParameterChange>): Promise<ParameterRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Dos PATCH a la vez (p. ej. los dos de un par PR-01/PR-02) se serializan: cada uno ve el valor que dejó el anterior.
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended('catalog.evaluation_parameters', 0))`;
      const all = await this.all(tx);
      const current = all.find((p) => p.key === key);
      if (!current) return null;
      const value = decide(current, all);
      if (isDeepStrictEqual(value, current.value)) return current;
      await tx.evaluationParameter.update({ where: { key }, data: { value: value as Prisma.InputJsonValue, updatedAt: new Date(), updatedById: userId } });
      const after = toRecord(await tx.evaluationParameter.findUniqueOrThrow({ where: { key }, select: SELECT }));
      // MD-508, D153 · El historial que leen las pasadas por empresa para avisar el cambio (el rastro de auditoría no tiene empresa y una sesión de empresa no lo lee). En la MISMA transacción.
      await tx.evaluationParameterChange.create({ data: { parameterKey: key, code: current.code, previousValue: current.value as Prisma.InputJsonValue, newValue: after.value as Prisma.InputJsonValue, changedById: userId }, select: { id: true } });
      await insertAuditLog(tx, audit({ before: current, after }));
      return after;
    });
  }

  private async all(tx: TransactionClient): Promise<ParameterRecord[]> {
    const order = new Map<string, number>(PARAMETER_KEYS.map((k, i) => [k, i]));
    const rows = await tx.evaluationParameter.findMany({ select: SELECT, orderBy: { sortOrder: 'asc' } });
    return rows.map(toRecord).sort((a, b) => (order.get(a.key) ?? 99) - (order.get(b.key) ?? 99));
  }
}
