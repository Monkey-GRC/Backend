import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma-tenant/client';
import { RequestContext } from 'src/common/utils/request-context';

// Solo estos modelos tienen columnas created_by/updated_by en el schema —
// las tablas puente (RiskReason, ReasonControl, ControlCheck) y CompanyProfile no.
const AUDITABLE_MODELS = new Set(['User', 'Risk', 'Reason', 'Control']);

export function createTenantPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  return client.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const data = args?.data as Record<string, unknown> | undefined;
          // No pisar si el caller ya usó la forma de relación
          // (created_by_user: { connect: ... } }) — Prisma no acepta el
          // escalar y la relación de la misma FK a la vez.
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
}

export type TenantPrismaClient = ReturnType<typeof createTenantPrismaClient>;
