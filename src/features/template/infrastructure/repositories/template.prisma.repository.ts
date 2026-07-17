import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { TemplateRepository, CreateTemplateInput, UpdateTemplateInput } from '../../domain/repositories/template.repository';

@Injectable()
export class TemplatePrismaRepository extends TemplateRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    findAll() {
        return this.prisma.template.findMany({
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
                updated_by_user: true,
                created_at: true,
                updated_at: true,
            }
        });
    }

    findOne(id: string) {
        return this.prisma.template.findUniqueOrThrow({
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
        return this.prisma.$transaction(async (tx) => {
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
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.objective !== undefined) updateData['objective'] = input.objective;
        if (input.scope !== undefined) updateData['scope'] = input.scope;
        if (input.slug !== undefined) updateData['slug'] = input.slug;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        return this.prisma.template.update({ where: { id }, data: updateData });
    }

    delete(id: string) {
        return this.prisma.template.delete({ where: { id } });
    }
}
