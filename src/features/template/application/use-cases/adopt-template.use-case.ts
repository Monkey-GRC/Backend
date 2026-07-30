import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';

@Injectable()
export class AdoptTemplateUseCase {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantConnection: TenantConnectionManager,
    private readonly i18n: I18nService,
  ) {}

  async execute(masterTemplateId: string) {
    const tenantId = RequestContext.clientId;
    if (!tenantId) {
      // Solo tiene sentido "adoptar" dentro de una sesión de tenant.
      throw new NotFoundException(this.i18n.t('template.MASTER_NOT_FOUND'));
    }

    const master = await this.centralPrisma.template.findUnique({
      where: { id: masterTemplateId },
      include: {
        risks: {
          include: {
            reasons: {
              include: {
                reason: {
                  include: {
                    controls: {
                      include: {
                        control: {
                          include: { checks: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!master) {
      throw new NotFoundException(this.i18n.t('template.MASTER_NOT_FOUND'));
    }

    const tenantDb = await this.tenantConnection.getClientFor(tenantId);

    return tenantDb.$transaction(async (tx: any) => {
      const newTemplate = await tx.template.create({
        data: {
          name: master.name,
          description: master.description,
          objective: master.objective,
          scope: master.scope,
          slug: master.slug,
          code: master.code,
          source_template_id: master.id,
          adopted_at: new Date(),
        },
      });

      const reasonMap = new Map<string, string>();
      const controlMap = new Map<string, string>();

      for (const masterRisk of master.risks) {
        const newRisk = await tx.risk.create({
          data: {
            name: masterRisk.name,
            description: masterRisk.description,
            objective: masterRisk.objective,
            impact: masterRisk.impact,
            probability: masterRisk.probability,
            level: masterRisk.level,
            code: masterRisk.code,
            template_id: newTemplate.id,
          },
        });

        for (const rr of masterRisk.reasons) {
          const masterReason = rr.reason;
          let newReasonId = reasonMap.get(masterReason.id);

          if (!newReasonId) {
            const newReason = await tx.reason.create({
              data: {
                name: masterReason.name,
                description: masterReason.description,
                code: masterReason.code,
              },
            });
            newReasonId = newReason.id;
            reasonMap.set(masterReason.id, newReasonId!);

            for (const rc of masterReason.controls) {
              const masterControl = rc.control;
              let newControlId = controlMap.get(masterControl.id);

              if (!newControlId) {
                const newControl = await tx.control.create({
                  data: {
                    name: masterControl.name,
                    description: masterControl.description,
                    objective: masterControl.objective,
                    type: masterControl.type,
                    code: masterControl.code,
                  },
                });
                newControlId = newControl.id;
                controlMap.set(masterControl.id, newControlId!);

                if (masterControl.checks.length) {
                  await tx.controlCheck.createMany({
                    data: masterControl.checks.map((check: any) => ({
                      control_id: newControlId,
                      check_id: check.check_id,
                      title: check.title,
                      os: check.os,
                    })),
                  });
                }
              }

              await tx.reasonControl.create({
                data: { reason_id: newReasonId, control_id: newControlId },
              });
            }
          }

          await tx.riskReason.create({
            data: { risk_id: newRisk.id, reason_id: newReasonId },
          });
        }
      }

      return newTemplate;
    });
  }
}
