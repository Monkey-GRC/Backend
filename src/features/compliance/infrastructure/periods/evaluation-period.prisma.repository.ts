import { Injectable, Logger } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { activeAdminIds } from '../../../../infrastructure/notifications/control-chain.loader';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { windowNotifications } from '../../domain/notifications/window-notifications';
import { hasEnded, nextPeriod, utcDay } from '../../domain/periods/evaluation-period';
import { EvaluationPeriodRecord, PeriodResolver, EvaluationPeriodRepository, EvaluationPeriodRollover, EvaluationPeriodRow, OpenedPeriod, RolloverSummary } from '../../domain/periods/evaluation-period.repository';
import { captureControlStates, recordControlStateChanges, recordTimeDrivenStateChanges } from '../shared/control-state-events';

const FRAMEWORK_SELECT = { id: true, serviceId: true, framework: { select: { code: true } }, catalogVersion: { select: { number: true } } } as const;
const PERIOD_SELECT = { id: true, status: true, periodStart: true, periodEnd: true, cutoffDate: true, openedBy: true, closedAt: true } as const;
const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const CALENDAR_PERIODICITIES = ['daily', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual'] as const;
// Cuántos períodos seguidos se abren como máximo en una pasada (la tarea estuvo apagada mucho tiempo).
const MAX_CATCH_UP = 120;

@Injectable()
export class EvaluationPeriodPrismaRepository extends EvaluationPeriodRepository {
  constructor(private readonly prisma: PrismaService, private readonly parameters: EvaluationParametersPort) {
    super();
  }

  set(
    scope: TenantScope,
    serviceId: string,
    frameworkCode: string,
    resolvePeriod: PeriodResolver,
    actor: { userId: string; meta: { ipAddress: string; userAgent: string } },
    audit: Parameters<EvaluationPeriodRepository['set']>[5],
  ): Promise<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord } | null> {
    return this.setOnce(scope, serviceId, frameworkCode, resolvePeriod, actor, audit).catch((e: unknown) => {
      // Dos PUT a la vez sobre un marco sin período: ambos ven «no hay abierto» y los dos lo crean; el índice único deja pasar a uno y el otro reintenta ya como edición.
      if (isUniqueViolation(e)) return this.setOnce(scope, serviceId, frameworkCode, resolvePeriod, actor, audit);
      throw e;
    });
  }

  private setOnce(
    scope: TenantScope,
    serviceId: string,
    frameworkCode: string,
    resolvePeriod: PeriodResolver,
    actor: { userId: string; meta: { ipAddress: string; userAgent: string } },
    audit: Parameters<EvaluationPeriodRepository['set']>[5],
  ): Promise<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // PR-16 · Una sola carga: valida el período (422 antes que 404) y, más abajo, evalúa el estado de los controles.
      const parameters = await this.parameters.load(tx);
      const period = resolvePeriod(parameters);
      // El servicio es de la empresa y el marco está contratado y activo en él; si no, no hay nada que encontrar (404, sin distinguir cuál faltó).
      const found = await tx.serviceFramework.findFirst({
        where: { serviceId, status: 'active', framework: { code: frameworkCode }, service: { organization: { companyId: scope.companyId } } },
        select: FRAMEWORK_SELECT,
      });
      if (!found) return null;
      const open = await tx.serviceFrameworkPeriod.findFirst({ where: { serviceFrameworkId: found.id, status: 'open' }, select: PERIOD_SELECT });
      const record = (r: { periodStart: Date; periodEnd: Date; cutoffDate: Date | null } | null): EvaluationPeriodRecord => ({
        frameworkCode: found.framework.code, catalogVersion: found.catalogVersion.number, periodStart: r?.periodStart ?? null, periodEnd: r?.periodEnd ?? null, cutoffDate: r?.cutoffDate ?? null,
      });
      const before = record(open);
      // Cambia lo que cuenta como evidencia del período (G-11): si mueve el estado de algún control, queda su evento (D91).
      const states = await captureControlStates(tx, serviceId, parameters);
      const data = { periodStart: period.periodStart, periodEnd: period.periodEnd, cutoffDate: period.cutoffDate };
      const row = open
        ? await tx.serviceFrameworkPeriod.update({ where: { id: open.id }, data, select: PERIOD_SELECT })
        : await tx.serviceFrameworkPeriod.create({ data: { ...data, tenantId: scope.companyId, serviceFrameworkId: found.id, status: 'open', openedBy: 'user' }, select: PERIOD_SELECT });
      const after = record(row);
      await insertAuditLog(tx, audit({ before, after }));
      await recordControlStateChanges(tx, {
        tenantId: scope.companyId, serviceId, parameters, before: states, cause: 'evaluation_period_set', actor: { userId: actor.userId, ipAddress: actor.meta.ipAddress, userAgent: actor.meta.userAgent },
      });
      return { before, after };
    }, { timeoutMs: 30_000 });
  }

  list(scope: TenantScope, serviceId: string, frameworkCode: string): Promise<EvaluationPeriodRow[] | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.serviceFramework.findFirst({
        where: { serviceId, status: 'active', framework: { code: frameworkCode }, service: { organization: { companyId: scope.companyId } } },
        select: { id: true },
      });
      if (!found) return null;
      const rows = await tx.serviceFrameworkPeriod.findMany({ where: { serviceFrameworkId: found.id }, select: PERIOD_SELECT });
      const rank = (r: { status: string }) => (r.status === 'open' ? 0 : 1);
      return rows.sort((a, b) => rank(a) - rank(b) || b.periodStart.getTime() - a.periodStart.getTime());
    });
  }
}

// La pasada diaria (D145, D148). El actor es el sistema: sin usuario y con el agente `system`.
@Injectable()
export class EvaluationPeriodRolloverPrismaRepository extends EvaluationPeriodRollover {
  private readonly logger = new Logger(EvaluationPeriodRolloverPrismaRepository.name);

  constructor(private readonly prisma: PrismaService, private readonly parameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  listTenantIds(): Promise<string[]> {
    return this.prisma.withScope({ companyId: '', role: 'admin_monkey' }, async (tx) => (await tx.company.findMany({ where: { status: { not: 'deactivated' } }, select: { id: true }, orderBy: { id: 'asc' } })).map((c) => c.id));
  }

  async rollTenant(tenantId: string, now: Date, audit: Parameters<EvaluationPeriodRollover['rollTenant']>[2]): Promise<RolloverSummary> {
    const opened = await this.rollPeriods(tenantId, now, audit);
    // D91 · Los eventos de estado, solo de los servicios con un período abierto y alguna periodicidad de calendario: son los que una ventana cerrada puede mover. Cada servicio, en su propia transacción.
    // MD-515 · Los avisos de las ventanas (por vencer y vencida) leen la MISMA foto: se suman los servicios sin período abierto (solo reciben el aviso previo) y la periodicidad anual.
    // Los parámetros y los administradores se cargan una vez por empresa, en esa misma consulta.
    const { parameters, services, eventServiceIds, adminIds } = await this.prisma.withScope({ companyId: tenantId }, async (tx) => {
      const parameters = await this.parameters.load(tx);
      // PR-07 `rolling`: también la anual vence por fecha, no solo las de calendario.
      const windowed = [...(parameters.validityWindows === 'rolling' ? [...CALENDAR_PERIODICITIES, 'annual' as const] : CALENDAR_PERIODICITIES)];
      const withPeriodicity = (periodicities: ReadonlyArray<(typeof CALENDAR_PERIODICITIES)[number] | 'annual'>) => ({
        isActive: true,
        requirements: { some: { OR: [{ periodicity: { in: [...periodicities] } }, { periodicity: null, controlRequirement: { periodicity: { in: [...periodicities] } } }] } },
      });
      const eventServiceIds = new Set((await tx.service.findMany({
        where: { organization: { companyId: tenantId }, frameworks: { some: { status: 'active', periods: { some: { status: 'open' } } } }, clientControls: { some: withPeriodicity(windowed) } },
        select: { id: true },
      })).map((s) => s.id));
      const services = await tx.service.findMany({
        where: { organization: { companyId: tenantId }, frameworks: { some: { status: 'active' } }, clientControls: { some: withPeriodicity([...CALENDAR_PERIODICITIES, 'annual']) } },
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
      });
      const adminIds = await activeAdminIds(tx);
      return { parameters, services, eventServiceIds, adminIds };
    });
    let stateEvents = 0;
    const today = now.toISOString().slice(0, 10);
    for (const service of services) {
      stateEvents += await this.prisma.withScope({ companyId: tenantId }, async (tx) => {
        // Con varias réplicas corriendo la tarea, un servicio lo evalúa una sola.
        const [{ locked }] = await tx.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(hashtextextended(${'evaluation_period_state:' + service.id}, 0)) AS locked`;
        if (!locked) return 0;
        const { written, readouts } = await recordTimeDrivenStateChanges(tx, {
          tenantId, serviceId: service.id, parameters, now, actor: { userId: null, ipAddress: null, userAgent: 'system' }, recordEvents: eventServiceIds.has(service.id),
        });
        // MD-515 · Los avisos nacen en la misma transacción que el evento de estado: o quedan los dos o ninguno.
        await this.notifications.emit(tx, windowNotifications({ companyId: tenantId, service, readouts, adminIds, today }));
        return written;
      }, { timeoutMs: 120_000 });
    }
    return { opened, stateEvents };
  }

  // Cierra los períodos abiertos ya terminados y abre el siguiente; con un candado por empresa y en una transacción corta.
  private rollPeriods(tenantId: string, now: Date, audit: Parameters<EvaluationPeriodRollover['rollTenant']>[2]): Promise<number> {
    return this.prisma.withScope({ companyId: tenantId }, async (tx) => {
      const [{ locked }] = await tx.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(hashtextextended(${'evaluation_period_roll:' + tenantId}, 0)) AS locked`;
      if (!locked) return 0;
      const today = utcDay(now);
      let opened = 0;
      const due = await tx.serviceFrameworkPeriod.findMany({
        where: { status: 'open', periodEnd: { lt: today }, serviceFramework: { status: 'active' } },
        select: { id: true, periodStart: true, periodEnd: true, serviceFramework: { select: { id: true, serviceId: true, framework: { select: { code: true } } } } },
        orderBy: { periodEnd: 'asc' },
      });
      for (const prev of due) {
        let current = { id: prev.id, periodStart: prev.periodStart, periodEnd: prev.periodEnd };
        let i = 0;
        for (; i < MAX_CATCH_UP && hasEnded(current.periodEnd, today); i++) {
          await tx.serviceFrameworkPeriod.update({ where: { id: current.id }, data: { status: 'closed', closedAt: now } });
          const next = nextPeriod(current);
          const created = await tx.serviceFrameworkPeriod.create({
            data: { tenantId, serviceFrameworkId: prev.serviceFramework.id, periodStart: next.periodStart, periodEnd: next.periodEnd, cutoffDate: null, status: 'open', openedBy: 'system' },
            select: { id: true },
          });
          const entry: OpenedPeriod = { serviceId: prev.serviceFramework.serviceId, frameworkCode: prev.serviceFramework.framework.code, previous: current, next };
          await insertAuditLog(tx, audit(entry));
          opened++;
          current = { id: created.id, ...next };
        }
        if (i >= MAX_CATCH_UP && hasEnded(current.periodEnd, today)) this.logger.warn(`El servicio ${prev.serviceFramework.serviceId} (${prev.serviceFramework.framework.code}) llegó al tope de ${MAX_CATCH_UP} períodos seguidos y su período abierto sigue terminado; seguirá en la próxima pasada.`);
      }
      return opened;
    }, { timeoutMs: 60_000 });
  }
}
