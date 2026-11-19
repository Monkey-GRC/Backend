import { Global, Module } from '@nestjs/common';
import { TransactionRunner } from '../../common/tenancy/transaction-runner';
import { PrismaService } from './prisma.service';
import { PrismaTransactionRunner } from './prisma-transaction-runner';

@Global()
@Module({
  providers: [PrismaService, { provide: TransactionRunner, useClass: PrismaTransactionRunner }],
  exports: [PrismaService, TransactionRunner],
})
export class DatabaseModule {}
