import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { TenantScope } from '../../common/tenancy/tenant-scope';

export type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('APP_DATABASE_URL'),
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // Ejecuta `work` dentro de una transacción con las variables de sesión que leen las políticas
  // RLS. set_config(..., true) las acota a ESTA transacción: nunca se filtran a otra petición
  // que reutilice la conexión del pool (modelo-datos.md §4.4).
  withScope<T>(scope: TenantScope, work: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT set_config('app.tenant_id', ${scope.companyId}, true),
               set_config('app.user_id', ${scope.userId ?? ''}, true),
               set_config('app.user_role', ${scope.role ?? ''}, true)
      `;
      return work(tx);
    });
  }
}
