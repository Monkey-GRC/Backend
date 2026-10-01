import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { TenantScope } from '../../common/tenancy/tenant-scope';
export type TransactionClient = Prisma.TransactionClient;
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    withScope<T>(scope: TenantScope, work: (tx: TransactionClient) => Promise<T>, options?: {
        timeoutMs?: number;
    }): Promise<T>;
}
