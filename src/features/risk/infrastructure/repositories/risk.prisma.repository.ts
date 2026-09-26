import { Injectable } from '@nestjs/common';
import { RiskLevel } from 'generated/prisma-tenant/browser';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import { RiskRepository, CreateRiskInput, UpdateRiskInput } from '../../domain/repositories/risk.repository';
import { RiskEntity } from '../../domain/entities/risk.entity';

@Injectable()
export class RiskPrismaRepository extends RiskRepository {
    constructor(
        private readonly centralPrisma: CentralPrismaService,
        private readonly tenantConnection: TenantConnectionManager,
    ) {
        super();
    }

    /** MONKEY_ADMIN (sin client_id) opera sobre la biblioteca central; un tenant, sobre su propia DB. */
    private db(): Promise<any> {
        const tenantId = RequestContext.clientId;
        return tenantId ? this.tenantConnection.getClientFor(tenantId) : Promise.resolve(this.centralPrisma);
    }

    async findAll() {
        const db = await this.db();
        return db.risk.findMany({
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
        return db.risk.findUniqueOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                impact: true,
                probability: true,
                level: true,
                created_at: true,
                updated_at: true,
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

    async create(input: CreateRiskInput) {
        const db = await this.db();
        const level = RiskEntity.calculateLevel(input.impact, input.probability) as RiskLevel;

        return db.$transaction(async (tx: any) => {
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
        const db = await this.db();
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.description !== undefined) updateData['description'] = input.description;
        if (input.impact !== undefined) updateData['impact'] = input.impact;
        if (input.probability !== undefined) updateData['probability'] = input.probability;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        if (input.impact !== undefined || input.probability !== undefined) {
            const current = await db.risk.findUniqueOrThrow({
                where: { id },
                select: { impact: true, probability: true },
            });
            const newImpact = input.impact ?? current.impact;
            const newProbability = input.probability ?? current.probability;
            updateData['level'] = RiskEntity.calculateLevel(newImpact, newProbability) as RiskLevel;
        }

        return db.risk.update({ where: { id }, data: updateData });
    }

    async delete(id: string) {
        const db = await this.db();
        return db.risk.delete({ where: { id } });
    }
}
