import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../common/tenancy/tenant-scope';
import { TransactionRunner } from '../../common/tenancy/transaction-runner';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionRunner extends TransactionRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  run<T>(scope: TenantScope, fn: () => Promise<T>, options?: { timeoutMs?: number }): Promise<T> {
    return this.prisma.run(scope, fn, options);
  }
}
