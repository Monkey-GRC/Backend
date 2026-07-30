import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { TemplateRepository, CreateTemplateInput, UpdateTemplateInput } from '../../domain/repositories/template.repository';

@Injectable()
export class TemplatePrismaRepository extends TemplateRepository {
    constructor(
        private readonly centralPrisma: CentralPrismaService,
        private readonly tenantConnection: TenantConnectionManager,
    ) {
        super();
    }

    /** MONKEY_ADMIN (sin client_id) administra la biblioteca central; un tenant, la suya propia. */
    private db(): Promise<any> {
        const tenantId = RequestContext.clientId;
        return tenantId ? this.tenantConnection.getClientFor(tenantId) : Promise.resolve(this.centralPrisma);
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
            }
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
            }
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
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.objective !== undefined) updateData['objective'] = input.objective;
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
