import { Injectable } from '@nestjs/common';
import { ControlType } from 'generated/prisma-tenant/browser';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { ControlRepository, CreateControlInput, UpdateControlInput } from '../../domain/repositories/control.repository';
import { ControlEntity } from '../../domain/entities/control.entity';

@Injectable()
export class ControlPrismaRepository extends ControlRepository {
    constructor(
        private readonly centralPrisma: CentralPrismaService,
        private readonly tenantConnection: TenantConnectionManager,
    ) {
        super();
    }

    private db(): Promise<any> {
        const tenantId = RequestContext.clientId;
        return tenantId ? this.tenantConnection.getClientFor(tenantId) : Promise.resolve(this.centralPrisma);
    }

    async findAll() {
        const db = await this.db();
        return db.control.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                objective: true,
                type: true,
                created_by_user: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                        role: true,
                        username: true,
                    }
                },
                updated_by_user: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                        role: true,
                        username: true,
                    }
                },
                created_at: true,
                updated_at: true,
                checks: {
                    select: {
                        id: true,
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
            }
        });
    }

    async findOne(id: string) {
        const db = await this.db();
        return db.control.findUniqueOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                objective: true,
                type: true,
                created_at: true,
                updated_at: true,
                checks: {
                    select: {
                        id: true,
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
                reasons: {
                    select: {
                        reason: {
                            select: { id: true, name: true, code: true },
                        },
                    },
                },
            }
        });
    }

    async create(input: CreateControlInput) {
        const db = await this.db();
        return db.$transaction(async (tx: any) => {
            const control = await tx.control.create({
                data: {
                    name: input.name,
                    description: input.description,
                    objective: input.objective,
                    type: input.type ?? ControlType.MANUAL,
                    code: 'PENDING',
                    created_by_user: { connect: { id: input.userId } },
                    checks: input.checklist?.length
                        ? {
                            create: input.checklist.map((item) => ({
                                check_id: item.checkId,
                                title: item.title,
                                os: input.os!,
                                soc2_code: item.soc2Code ?? null,
                                cis_code: item.cisCode ?? null,
                                pci_dss_code: item.pciDssCode ?? null,
                                soc2_code_inferred: item.soc2CodeInferred ?? null,
                                soc2_mapping_source: item.soc2MappingSource ?? null,
                                soc2_mapping_confidence: item.soc2MappingConfidence ?? null,
                                soc2_mapping_citation: item.soc2MappingCitation ?? null,
                            })),
                        }
                        : undefined,
                },
            });

            const code = ControlEntity.generateCode(control.seq);

            return tx.control.update({
                where: { id: control.id },
                data: { code },
            });
        });
    }

    async update(id: string, input: UpdateControlInput) {
        const db = await this.db();
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.objective !== undefined) updateData['objective'] = input.objective;
        if (input.type !== undefined) updateData['type'] = input.type;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        return db.control.update({ where: { id }, data: updateData });
    }

    async delete(id: string) {
        const db = await this.db();
        return db.control.delete({ where: { id } });
    }
}
