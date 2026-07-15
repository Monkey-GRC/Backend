import { Injectable } from '@nestjs/common';
import { ControlType } from 'generated/prisma/browser';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { ControlRepository, CreateControlInput, UpdateControlInput } from '../../domain/repositories/control.repository';
import { ControlEntity } from '../../domain/entities/control.entity';

@Injectable()
export class ControlPrismaRepository extends ControlRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    findAll() {
        return this.prisma.control.findMany({
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
                updated_by_user: true,
                created_at: true,
                updated_at: true,
                checks: {
                    select: {
                        id: true,
                        check_id: true,
                        title: true,
                        os: true,
                    },
                },
            }
        });
    }

    async create(input: CreateControlInput) {
        return this.prisma.$transaction(async (tx) => {
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
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.objective !== undefined) updateData['objective'] = input.objective;
        if (input.type !== undefined) updateData['type'] = input.type;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        return this.prisma.control.update({ where: { id }, data: updateData });
    }

    delete(id: string) {
        return this.prisma.control.delete({ where: { id } });
    }
}
