import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersPort } from '../../domain/engine/v2/parameters';
import { ControlAccess, ControlEdit, ControlEditRepository, ControlSnapshot, DimensionState, OwnControlCreated, OwnControlInput, PeriodicityChange, PeriodicityState } from '../../domain/controls/control-edit.repository';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const OWN_CODE = /^C(\d+)$/;
const snapshotOf = (interpretation: string, dims: Array<{ dimension: string; reasonNotApplicable: string | null }>): ControlSnapshot => ({
  interpretation,
  dimensions: dims.map((d) => ({ dimension: d.dimension, applies: d.reasonNotApplicable === null, reasonNotApplicable: d.reasonNotApplicable })).sort((a, b) => a.dimension.localeCompare(b.dimension)),
});
const dimensionsJson = (s: ControlSnapshot) => s.dimensions.map((d) => ({ dimension: d.dimension, applies: d.applies, reason_not_applicable: d.reasonNotApplicable })) as Prisma.InputJsonValue;

@Injectable()
export class ControlEditPrismaRepository extends ControlEditRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort) {
    super();
  }

  contractedCriteria(scope: TenantScope, serviceId: string): Promise<string[] | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      return (await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion);
    });
  }

  async createOwnControl(scope: TenantScope, input: OwnControlInput, audit: Parameters<ControlEditRepository['createOwnControl']>[2]): Promise<OwnControlCreated> {
    // El código `C##` es el siguiente libre del servicio. Dos altas a la vez pueden pedir el mismo: la restricción única lo detecta y se reintenta.
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.withScope(scope, async (tx) => {
          const used = await tx.clientControl.findMany({ where: { serviceId: input.serviceId, controlId: null }, select: { ownCode: true } });
          const next = Math.max(0, ...used.map((u) => Number(OWN_CODE.exec(u.ownCode)?.[1] ?? 0))) + 1;
          const ownCode = `C${String(next).padStart(2, '0')}`;

          const control = await tx.clientControl.create({
            data: {
              tenantId: scope.companyId, serviceId: input.serviceId, controlId: null, ownCode, name: input.name, trustCriterion: input.trustCriterion as never,
              clientInterpretation: input.interpretation, type: 'manual', sourceRef: null, isActive: true,
              // Solo documental (D65): su única dimensión es la documental, con las mismas banderas que las del catálogo (la IA pre-valida y una persona confirma).
              dimensions: {
                create: [{ tenantId: scope.companyId, dimension: 'policy', type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true, reasonNotApplicable: null }],
              },
            },
            select: { id: true },
          });
          // Un control propio cuenta desde que se crea (D96): cambia lo que se mide, así que deja un evento de cumplimiento.
          await tx.complianceEvent.createMany({
            data: [{
              tenantId: scope.companyId, userId: input.createdBy, changedField: 'client_control.create', previousValue: Prisma.DbNull,
              newValue: { client_control_id: control.id, own_code: ownCode, trust_criterion: input.trustCriterion },
              ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent,
            }],
          });
          const created: OwnControlCreated = { controlId: control.id, ownCode };
          await insertAuditLog(tx, audit(created));
          return created;
        });
      } catch (e) {
        if (isUniqueViolation(e) && attempt < 3) continue;
        throw e;
      }
    }
  }

  findAccess(scope: TenantScope, controlId: string): Promise<ControlAccess | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const c = await tx.clientControl.findFirst({ where: { id: controlId }, select: { id: true, serviceId: true, isActive: true, controlId: true } });
      return c ? { id: c.id, serviceId: c.serviceId, isActive: c.isActive, origin: c.controlId ? 'catalog' : 'own' } : null;
    });
  }

  update(
    scope: TenantScope,
    controlId: string,
    edit: ControlEdit,
    actor: { userId: string; meta: { ipAddress: string; userAgent: string } },
    audit: Parameters<ControlEditRepository['update']>[4],
  ): Promise<{ before: ControlSnapshot; after: ControlSnapshot } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { id: true, serviceId: true, isActive: true, ownCode: true, clientInterpretation: true, dimensions: { select: { dimension: true, reasonNotApplicable: true } } },
      });
      if (!found) return null;
      if (!found.isActive) throw new DomainError('CONTROL_RETIRED');
      const before = snapshotOf(found.clientInterpretation, found.dimensions);

      // Una dimensión que el control no lleva no se puede cambiar: no hay nada que aplicar o dejar de aplicar.
      const carried = new Set(found.dimensions.map((d) => d.dimension as string));
      const unknown = (edit.dimensions ?? []).map((d, i) => ({ d, i })).filter(({ d }) => !carried.has(d.dimension));
      if (unknown.length) throw new ValidationException(unknown.map(({ i }) => ({ field: `dimensions[${i}].dimension`, code: 'dimension.not_in_control' })));

      const dimensionsChange = !!edit.dimensions?.some((d) => before.dimensions.find((x) => x.dimension === d.dimension)?.reasonNotApplicable !== d.reasonNotApplicable);
      // Quitar o poner una dimensión cambia lo que se mide: si mueve el estado de algún control, queda su evento.
      const parameters = dimensionsChange ? await this.evaluationParameters.load(tx) : null;
      const states = parameters ? await captureControlStates(tx, found.serviceId, parameters) : null;

      if (edit.interpretation !== undefined) await tx.clientControl.update({ where: { id: controlId }, data: { clientInterpretation: edit.interpretation } });
      for (const d of edit.dimensions ?? []) {
        await tx.clientControlDimension.updateMany({ where: { clientControlId: controlId, dimension: d.dimension as never }, data: { reasonNotApplicable: d.applies ? null : d.reasonNotApplicable } });
      }

      const after = snapshotOf(
        edit.interpretation ?? found.clientInterpretation,
        before.dimensions.map((d) => {
          const e = edit.dimensions?.find((x: DimensionState) => x.dimension === d.dimension);
          return { dimension: d.dimension, reasonNotApplicable: e ? (e.applies ? null : e.reasonNotApplicable) : d.reasonNotApplicable };
        }),
      );
      if (dimensionsChange) {
        await tx.complianceEvent.createMany({
          data: [{
            tenantId: scope.companyId, userId: actor.userId, changedField: 'client_control.update',
            previousValue: { client_control_id: controlId, dimensions: dimensionsJson(before) }, newValue: { client_control_id: controlId, dimensions: dimensionsJson(after) },
            ipAddress: actor.meta.ipAddress, userAgent: actor.meta.userAgent,
          }],
        });
      }
      await insertAuditLog(tx, audit({ before, after }));
      if (states && parameters) {
        await recordControlStateChanges(tx, { parameters,
          tenantId: scope.companyId, serviceId: found.serviceId, before: states, cause: 'control_updated',
          actor: { userId: actor.userId, ipAddress: actor.meta.ipAddress, userAgent: actor.meta.userAgent },
        });
      }
      return { before, after };
    });
  }

  setPeriodicity(
    scope: TenantScope,
    controlId: string,
    input: { periodicity: string | null; justification: string },
    actor: { userId: string; meta: { ipAddress: string; userAgent: string } },
    audit: Parameters<ControlEditRepository['setPeriodicity']>[4],
  ): Promise<PeriodicityChange | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: {
          id: true, serviceId: true, isActive: true, periodicityJustification: true, periodicityChangedAt: true,
          requirements: { select: { id: true, periodicity: true, controlRequirement: { select: { periodicity: true } } } },
        },
      });
      if (!found) return null;
      if (!found.isActive) throw new DomainError('CONTROL_RETIRED');
      const state = (periodicity: string | null, changed: boolean, justification: string | null): PeriodicityState => ({ periodicity, source: changed ? 'client' : 'catalog', justification });
      const before = state(found.requirements[0]?.periodicity ?? null, found.periodicityChangedAt !== null, found.periodicityJustification);

      // Repetir lo mismo no cambia nada: ni requisitos, ni rastro.
      const same = input.periodicity === null ? found.periodicityChangedAt === null : found.requirements.every((r) => r.periodicity === input.periodicity);
      if (same) return { changed: false, before, after: before };

      const parameters = await this.evaluationParameters.load(tx);
      const states = await captureControlStates(tx, found.serviceId, parameters);
      if (input.periodicity === null) {
        for (const r of found.requirements) await tx.clientControlRequirement.update({ where: { id: r.id }, data: { periodicity: r.controlRequirement.periodicity } });
      } else {
        await tx.clientControlRequirement.updateMany({ where: { clientControlId: controlId }, data: { periodicity: input.periodicity as never } });
      }
      const now = new Date();
      await tx.clientControl.update({
        where: { id: controlId },
        data: input.periodicity === null
          ? { periodicityJustification: null, periodicityChangedAt: null, periodicityChangedBy: null }
          : { periodicityJustification: input.justification, periodicityChangedAt: now, periodicityChangedBy: actor.userId },
      });
      const after = state(input.periodicity === null ? (found.requirements[0]?.controlRequirement.periodicity ?? null) : input.periodicity, input.periodicity !== null, input.periodicity === null ? null : input.justification);
      await insertAuditLog(tx, audit({ before, after }));
      await recordControlStateChanges(tx, {
        parameters, tenantId: scope.companyId, serviceId: found.serviceId, before: states, cause: 'periodicity_changed',
        actor: { userId: actor.userId, ipAddress: actor.meta.ipAddress, userAgent: actor.meta.userAgent },
      });
      return { changed: true, before, after };
    }, { timeoutMs: 30_000 });
  }

  retire(scope: TenantScope, controlId: string, actor: { userId: string; meta: { ipAddress: string; userAgent: string } }, audit: Parameters<ControlEditRepository['retire']>[3]): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { id: true, isActive: true, ownCode: true, clientInterpretation: true, dimensions: { select: { dimension: true, reasonNotApplicable: true } } },
      });
      if (!found) return false;
      // El estado se vuelve a comprobar en el UPDATE: dos bajas a la vez no la cuentan dos veces.
      const { count } = await tx.clientControl.updateMany({ where: { id: controlId, isActive: true }, data: { isActive: false } });
      if (count === 0) throw new DomainError('CONTROL_RETIRED');
      await tx.complianceEvent.createMany({
        data: [{
          tenantId: scope.companyId, userId: actor.userId, changedField: 'client_control.retire',
          previousValue: { client_control_id: controlId, own_code: found.ownCode, is_active: true }, newValue: { client_control_id: controlId, own_code: found.ownCode, is_active: false },
          ipAddress: actor.meta.ipAddress, userAgent: actor.meta.userAgent,
        }],
      });
      await insertAuditLog(tx, audit({ before: { ...snapshotOf(found.clientInterpretation, found.dimensions), ownCode: found.ownCode } }));
      return true;
    });
  }
}