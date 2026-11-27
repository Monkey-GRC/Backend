import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ExclusionExpiry } from '../../domain/exclusions/exclusion.repository';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { expiredWhere, utcToday } from './exclusion-window';

const day = (d: Date) => d.toISOString().slice(0, 10);

// D135 · La tarea diaria del vencimiento de las excepciones. Cada excepción en su transacción: marcar `expired_at` es el candado (la segunda pasada, o una réplica a la vez, no la ve).
@Injectable()
export class ExclusionExpiryPrismaRepository extends ExclusionExpiry {
  constructor(private readonly prisma: PrismaService, private readonly parameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  listTenantIds(only?: readonly string[]): Promise<string[]> {
    return this.prisma.withScope({ companyId: '', role: 'admin_monkey' }, async (tx) => (await tx.company.findMany({ where: { status: { not: 'deactivated' }, ...(only ? { id: { in: [...only] } } : {}) }, select: { id: true }, orderBy: { id: 'asc' } })).map((c) => c.id));
  }

  async expireTenant(tenantId: string, now: Date): Promise<number> {
    const today = utcToday(now);
    const serviceIds = await this.prisma.withScope({ companyId: tenantId }, async (tx) => {
      const { checkExceptionMaxDays } = await this.parameters.load(tx);
      const rows = await tx.exclusion.findMany({ where: { ...expiredWhere(today, checkExceptionMaxDays), expiredAt: null }, select: { serviceId: true }, distinct: ['serviceId'], orderBy: { serviceId: 'asc' } });
      return rows.map((r) => r.serviceId);
    });
    let expired = 0;
    for (const serviceId of serviceIds) expired += await this.expireService(tenantId, serviceId, now, today);
    return expired;
  }

  // Una transacción por servicio: el «antes» es la lectura de HOY con las excepciones vencidas todavía vivas y el «después», la de hoy sin ellas; solo cambia el conjunto de excepciones.
  // Así el barrido de excepciones viejas no inventa cambios de estado ni avisos que no vienen de ellas.
  private expireService(tenantId: string, serviceId: string, now: Date, today: Date): Promise<number> {
    return this.prisma.withScope({ companyId: tenantId }, async (tx) => {
      const parameters = await this.parameters.load(tx);
      const rows = await tx.exclusion.findMany({
        where: { serviceId, ...expiredWhere(today, parameters.checkExceptionMaxDays), expiredAt: null },
        select: { id: true, testId: true, assetId: true, validFrom: true, validUntil: true }, orderBy: { id: 'asc' },
      });
      // Una sola vez: marcar `expired_at` es el candado. Lo que otra pasada ganó no se marca aquí y no deja nada.
      const marked: typeof rows = [];
      for (const row of rows) if ((await tx.exclusion.updateMany({ where: { id: row.id, expiredAt: null }, data: { expiredAt: now } })).count === 1) marked.push(row);
      if (marked.length === 0) return 0;
      const before = await captureControlStates(tx, serviceId, parameters, { keepExceptionIds: marked.map((r) => r.id) });
      await tx.complianceEvent.createMany({
        data: marked.map((row) => ({
          tenantId, userId: null, changedField: 'exclusion.expire', previousValue: Prisma.DbNull,
          newValue: { exclusion_id: row.id, service_id: serviceId, test_id: row.testId, asset_id: row.assetId, valid_until: day(row.validUntil), effective_until: day(exceptionEndsOn(row.validFrom, row.validUntil, parameters)) },
          ipAddress: null, userAgent: 'system',
        })),
      });
      await recordControlStateChanges(tx, { tenantId, serviceId, parameters, before, cause: 'exclusion_expired', actor: { userId: null, ipAddress: null, userAgent: 'system' }, notifications: this.notifications });
      return marked.length;
    }, { timeoutMs: 60_000 });
  }
}
