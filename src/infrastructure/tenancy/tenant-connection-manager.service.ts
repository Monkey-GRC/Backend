import { Injectable, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { decryptSecret } from './tenant-crypto.util';
import { buildPostgresUrl } from './tenant-db.util';
import { createTenantPrismaClient, TenantPrismaClient } from './tenant-prisma-client.factory';

@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
  private readonly clients = new Map<string, TenantPrismaClient>();
  private readonly pending = new Map<string, Promise<TenantPrismaClient>>();

  constructor(private readonly centralPrisma: CentralPrismaService) {}

  async getClientFor(clientId: string): Promise<TenantPrismaClient> {
    const cached = this.clients.get(clientId);
    if (cached) return cached;

    const inFlight = this.pending.get(clientId);
    if (inFlight) return inFlight;

    const creating = this.connect(clientId);
    this.pending.set(clientId, creating);
    try {
      const client = await creating;
      this.clients.set(clientId, client);
      return client;
    } finally {
      this.pending.delete(clientId);
    }
  }

  private async connect(clientId: string): Promise<TenantPrismaClient> {
    const row = await this.centralPrisma.client.findUnique({ where: { id: clientId } });
    if (!row || !row.is_active) {
      throw new UnauthorizedException();
    }

    const password = decryptSecret(row.db_password_enc);
    const url = buildPostgresUrl({
      host: row.db_host,
      port: row.db_port,
      database: row.db_name,
      user: row.db_user,
      password,
      ssl: row.db_ssl,
    });

    const client = createTenantPrismaClient(url);
    await client.$connect();
    return client;
  }

  async evict(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    this.clients.delete(clientId);
    if (client) {
      await client.$disconnect();
    }
  }

  async onModuleDestroy() {
    await Promise.all([...this.clients.values()].map((client) => client.$disconnect()));
  }
}
