import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { TenantScope } from '../../common/tenancy/tenant-scope';

export type TransactionClient = Prisma.TransactionClient;

const QUEUE_WAIT_MS = 10_000;

type OpenTransaction = { scope: TenantScope; tx: TransactionClient; timeoutMs?: number };
const sameScope = (a: TenantScope, b: TenantScope) => a.companyId === b.companyId && (a.userId ?? '') === (b.userId ?? '') && (a.role ?? '') === (b.role ?? '');

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

  // Transacción abierta por `run` para la petición en curso (contexto ambiente).
  private readonly current = new AsyncLocalStorage<OpenTransaction>();

  // Abre UNA transacción para el caso de uso: los `withScope` que se llamen dentro con el mismo scope la reutilizan.
  run<T>(scope: TenantScope, fn: () => Promise<T>, options: { timeoutMs?: number } = {}): Promise<T> {
    const open = this.current.getStore();
    if (open) {
      this.reuse(open, scope, options);
      return fn();
    }
    return this.openScope(scope, (tx) => this.current.run({ scope, tx, timeoutMs: options.timeoutMs }, fn), options);
  }

  // Dentro de `run`: otro scope es un error (nunca se mezclan empresas ni se abre otra transacción en silencio) y un timeout
  // mayor que el de la transacción abierta también, porque ya no se puede ampliar: quien lo pide debe pedirlo en `run`.
  private reuse(open: OpenTransaction, scope: TenantScope, options: { timeoutMs?: number }): TransactionClient {
    if (!sameScope(open.scope, scope)) throw new Error('withScope con un scope distinto dentro de una transacción de caso de uso');
    if (options.timeoutMs && options.timeoutMs > (open.timeoutMs ?? 5_000)) throw new Error('withScope pide más timeout que la transacción de caso de uso abierta');
    return open.tx;
  }

  // Ejecuta `work` dentro de una transacción con las variables de sesión que leen las políticas
  // RLS. set_config(..., true) las acota a ESTA transacción: nunca se filtran a otra petición
  // que reutilice la conexión del pool (modelo-datos.md §4.4).
  //
  // `timeoutMs` sube el límite de la transacción (5 s por defecto en Prisma) para trabajos largos
  // como el clonado del catálogo, que escribe cientos de filas de una sola vez.
  async withScope<T>(
    scope: TenantScope,
    work: (tx: TransactionClient) => Promise<T>,
    options: { timeoutMs?: number } = {},
  ): Promise<T> {
    const open = this.current.getStore();
    if (open) return work(this.reuse(open, scope, options));
    return this.openScope(scope, work, options);
  }

  private openScope<T>(
    scope: TenantScope,
    work: (tx: TransactionClient) => Promise<T>,
    options: { timeoutMs?: number },
  ): Promise<T> {
    return this.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT set_config('app.tenant_id', ${scope.companyId}, true),
                 set_config('app.user_id', ${scope.userId ?? ''}, true),
                 set_config('app.user_role', ${scope.role ?? ''}, true)
        `;
        return work(tx);
      },
      // `maxWait` es cuánto espera una petición por una conexión libre del pool. Con el valor por
      // defecto (2 s) una ráfaga de peticiones paralelas terminaba en 500 aunque la base estuviera
      // sana; aquí se encolan.
      options.timeoutMs
        ? { timeout: options.timeoutMs, maxWait: QUEUE_WAIT_MS }
        : { maxWait: QUEUE_WAIT_MS },
    );
  }
}
