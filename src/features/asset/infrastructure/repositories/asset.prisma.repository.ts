import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetRepository, CreateAssetInput, UpdateAssetInput } from '../../domain/repositories/asset.repository';

@Injectable()
export class AssetPrismaRepository extends AssetRepository {
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
        return db.asset.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                source: true,
                external_id: true,
                os: true,
                wazuh_policy_id: true,
                status: true,
                last_seen_at: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { seq: 'asc' },
        });
    }

    async findOne(id: string) {
        const db = await this.db();
        return db.asset.findUniqueOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                source: true,
                external_id: true,
                os: true,
                wazuh_policy_id: true,
                status: true,
                last_seen_at: true,
                created_at: true,
                updated_at: true,
            },
        });
    }

    async create(input: CreateAssetInput) {
        const db = await this.db();
        return db.$transaction(async (tx: any) => {
            const asset = await tx.asset.create({
                data: {
                    name: input.name,
                    type: input.type,
                    source: input.source,
                    external_id: input.externalId,
                    os: input.os,
                    wazuh_policy_id: input.wazuhPolicyId,
                    code: 'PENDING',
                    created_by_user: { connect: { id: input.userId } },
                },
            });

            const code = AssetEntity.generateCode(asset.seq);

            return tx.asset.update({
                where: { id: asset.id },
                data: { code },
            });
        });
    }

    async update(id: string, input: UpdateAssetInput) {
        const db = await this.db();
        const updateData: Record<string, any> = {};

        if (input.name !== undefined) updateData['name'] = input.name;
        if (input.type !== undefined) updateData['type'] = input.type;
        if (input.status !== undefined) updateData['status'] = input.status;
        if (input.externalId !== undefined) updateData['external_id'] = input.externalId;
        if (input.os !== undefined) updateData['os'] = input.os;
        if (input.wazuhPolicyId !== undefined) updateData['wazuh_policy_id'] = input.wazuhPolicyId;
        updateData['updated_by_user'] = { connect: { id: input.userId } };

        return db.asset.update({ where: { id }, data: updateData });
    }

    async delete(id: string) {
        const db = await this.db();
        return db.asset.delete({ where: { id } });
    }
}
