import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { RequestContext } from 'src/common/utils/request-context';

@Injectable()
export class PrismaService extends PrismaClient
    implements OnModuleInit {

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();

        this.$extends({
            query: {
                $allModels: {
                    async create({ args, query }) {
                        if (RequestContext.userId && args?.data) {
                            args.data.created_by ??= RequestContext.userId;
                        }
                        return query(args);
                    },

                    async update({ args, query }) {
                        if (RequestContext.userId && args?.data) {
                            args.data.updated_by = RequestContext.userId;
                        }
                        return query(args);
                    },
                },
            },
        });
    }
}
