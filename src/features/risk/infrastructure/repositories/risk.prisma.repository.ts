import { Injectable } from '@nestjs/common';
import { RiskLevel } from 'generated/prisma/browser';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { RiskRepository, CreateRiskInput, UpdateRiskInput } from '../../domain/repositories/risk.repository';
import { RiskEntity } from '../../domain/entities/risk.entity';

@Injectable()
export class RiskPrismaRepository extends RiskRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    findAll() {
        return this.prisma.risk.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                impact: true,
                probability: true,
                level: true,
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

    async create(input: CreateRiskInput) {
        const level = RiskEntity.calculateLevel(input.impact, input.probability) as RiskLevel;

        return this.prisma.$transaction(async (tx) => {
            const risk = await tx.risk.create({
                data: {
                    name: input.name,
                    description: input.description,
                    impact: input.impact,
                    probability: input.probability,
                    level,
                    code: 'PENDING',
                    created_by_user: { connect: { id: input.userId } },
                },
            });

            const code = `RGS-${obfuscateSeq(risk.seq)}`;

            return tx.risk.update({
                where: { id: risk.id },
                data: { code },
            });
        });
    }

    async update(id: string, input: UpdateRiskInput) {
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.impact !== undefined) updateData['impact'] = input.impact;
        if (input.probability !== undefined) updateData['probability'] = input.probability;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        if (input.impact !== undefined || input.probability !== undefined) {
            const current = await this.prisma.risk.findUniqueOrThrow({
                where: { id },
                select: { impact: true, probability: true },
            });
            const newImpact = input.impact ?? current.impact;
            const newProbability = input.probability ?? current.probability;
            updateData['level'] = RiskEntity.calculateLevel(newImpact, newProbability) as RiskLevel;
        }

        return this.prisma.risk.update({ where: { id }, data: updateData });
    }

    delete(id: string) {
        return this.prisma.risk.delete({ where: { id } });
    }
}
