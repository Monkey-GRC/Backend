import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import {
  TemplateRepository,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '../../domain/repositories/template.repository';

@Injectable()
export class TemplatePrismaRepository extends TemplateRepository {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantConnection: TenantConnectionManager,
  ) {
    super();
  }

  private db(): Promise<any> {
    const tenantId = RequestContext.clientId;
    return tenantId
      ? this.tenantConnection.getClientFor(tenantId)
      : Promise.resolve(this.centralPrisma);
  }

  async findContracted() {
    const db = await this.db();
    return db.template.findMany({
      where: { source_template_id: { not: null } },
      select: { id: true, name: true },
      orderBy: { seq: 'asc' },
    });
  }

  async findAll() {
    const db = await this.db();
    return db.template.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        objective: true,
        scope: true,
        slug: true,
        created_by_user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            role: true,
            username: true,
          },
        },
        updated_by_user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            role: true,
            username: true,
          },
        },
        created_at: true,
        updated_at: true,
        risks: {
          select: { id: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const db = await this.db();
    return db.template.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        objective: true,
        scope: true,
        slug: true,
        created_at: true,
        updated_at: true,
        risks: {
          select: { id: true, name: true, code: true, level: true },
        },
      },
    });
  }

  async findFullTree(id: string) {
    const db = await this.db();
    return db.template.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        objective: true,
        scope: true,
        slug: true,
        risks: {
          orderBy: { seq: 'asc' },
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            impact: true,
            probability: true,
            level: true,
            reasons: {
              select: {
                reason: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    controls: {
                      select: {
                        control: {
                          select: {
                            id: true,
                            name: true,
                            code: true,
                            description: true,
                            objective: true,
                            type: true,
                            checks: {
                              select: {
                                check_id: true,
                                title: true,
                                os: true,
                                soc2_code: true,
                                cis_code: true,
                                pci_dss_code: true,
                                soc2_code_inferred: true,
                                soc2_mapping_source: true,
                                soc2_mapping_confidence: true,
                                soc2_mapping_citation: true,
                              },
                            },
                            manual_checks: {
                              select: {
                                id: true,
                                title: true,
                                description: true,
                                remediation: true,
                                status: true,
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
          },
        },
      },
    });
  }

  async create(input: CreateTemplateInput) {
    const db = await this.db();
    return db.$transaction(async (tx: any) => {
      const template = await tx.template.create({
        data: {
          name: input.name,
          description: input.description,
          objective: input.objective,
          scope: input.scope,
          slug: input.slug,
          code: 'PENDING',
          created_by_user: { connect: { id: input.userId } },
        },
      });

      const code = `TPL-${obfuscateSeq(template.seq)}`;

      return tx.template.update({
        where: { id: template.id },
        data: { code },
      });
    });
  }

  async update(id: string, input: UpdateTemplateInput) {
    const db = await this.db();
    const updateData: Record<string, any> = {};

    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.description !== undefined)
      updateData['description'] = input.description;
    if (input.objective !== undefined)
      updateData['objective'] = input.objective;
    if (input.scope !== undefined) updateData['scope'] = input.scope;
    if (input.slug !== undefined) updateData['slug'] = input.slug;
    updateData['updated_by_user'] = { connect: { id: input.userId } };

    return db.template.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    const db = await this.db();
    return db.template.delete({ where: { id } });
  }
}
