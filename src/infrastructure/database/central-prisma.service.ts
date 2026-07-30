import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma-central/client';
import { RequestContext } from 'src/common/utils/request-context';

// Solo estos modelos tienen columnas created_by/updated_by en el schema —
// las tablas puente (RiskReason, ReasonControl, ControlCheck) y CompanyProfile no.
const AUDITABLE_MODELS = new Set(['User', 'Client', 'Template', 'Risk', 'Reason', 'Control']);

@Injectable()
export class CentralPrismaService extends PrismaClient
    implements OnModuleInit {

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.CENTRAL_DATABASE_URL!,
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();

        // $extends() devuelve un cliente NUEVO, no muta `this` — sus delegados
        // de modelo (this.user, this.client, ...) son propiedades propias
        // enumerables, así que Object.assign sí propaga correctamente el
        // middleware a la instancia inyectada por Nest (verificado).
        const extended = this.$extends({
            query: {
                $allModels: {
                    async create({ model, args, query }) {
                        const data = args?.data as Record<string, unknown> | undefined;
                        // No pisar si el caller ya usó la forma de relación
                        // (created_by_user: { connect: ... } }) — Prisma no
                        // acepta el escalar y la relación de la misma FK a la vez.
                        if (
                            RequestContext.userId &&
                            data &&
                            AUDITABLE_MODELS.has(model) &&
                            data.created_by === undefined &&
                            data.created_by_user === undefined
                        ) {
                            data.created_by = RequestContext.userId;
                        }
                        return query(args);
                    },

                    async update({ model, args, query }) {
                        const data = args?.data as Record<string, unknown> | undefined;
                        if (
                            RequestContext.userId &&
                            data &&
                            AUDITABLE_MODELS.has(model) &&
                            data.updated_by === undefined &&
                            data.updated_by_user === undefined
                        ) {
                            data.updated_by = RequestContext.userId;
                        }
                        return query(args);
                    },
                },
            },
        });
        Object.assign(this, extended);
    }
}
