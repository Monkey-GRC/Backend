import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { Pool } from 'pg';
import format from 'pg-format';
import { generateSecureToken } from 'src/common/utils/secure-random.util';
import { assertSafePgIdentifier, buildPostgresUrl, tenantIdentifiersFromSeq } from 'src/infrastructure/tenancy/tenant-db.util';

export interface ProvisionedTenantDb {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbSsl: boolean;
}

function tenantDbTarget() {
  const host = process.env.TENANT_DB_HOST;
  const port = Number(process.env.TENANT_DB_PORT ?? 5432);
  const ssl = process.env.TENANT_DB_SSL === 'true';
  if (!host) throw new InternalServerErrorException('TENANT_DB_HOST no está configurada');
  return { host, port, ssl };
}

@Injectable()
export class TenantProvisioningService {
  async provision(clientSeq: number): Promise<ProvisionedTenantDb> {
    const { dbUser, dbName } = tenantIdentifiersFromSeq(clientSeq);
    const { host, port, ssl } = tenantDbTarget();
    const dbPassword = generateSecureToken(24);

    await this.createRoleAndDatabase(dbUser, dbPassword, dbName);

    const databaseUrl = buildPostgresUrl({ host, port, database: dbName, user: dbUser, password: dbPassword, ssl });

    try {
      await this.runTenantMigrations(databaseUrl);
    } catch (err) {
      await this.deprovision(dbName, dbUser);
      throw err;
    }

    return { dbHost: host, dbPort: port, dbName, dbUser, dbPassword, dbSsl: ssl };
  }

  async deprovision(dbName: string, dbUser: string): Promise<void> {
    assertSafePgIdentifier(dbName);
    assertSafePgIdentifier(dbUser);

    const pool = new Pool({ connectionString: process.env.POSTGRES_ADMIN_URL });
    try {
      await pool.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [dbName],
      );
      await pool.query(format('DROP DATABASE IF EXISTS %I', dbName));
      await pool.query(format('DROP ROLE IF EXISTS %I', dbUser));
    } finally {
      await pool.end();
    }
  }

  private async createRoleAndDatabase(dbUser: string, dbPassword: string, dbName: string): Promise<void> {
    assertSafePgIdentifier(dbUser);
    assertSafePgIdentifier(dbName);

    const pool = new Pool({ connectionString: process.env.POSTGRES_ADMIN_URL });
    try {
      await pool.query(format('CREATE ROLE %I WITH LOGIN PASSWORD %L', dbUser, dbPassword));
      await pool.query(format('CREATE DATABASE %I OWNER %I', dbName, dbUser));
    } finally {
      await pool.end();
    }
  }

  private runTenantMigrations(databaseUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'npx',
        ['prisma', 'migrate', 'deploy', '--config', 'prisma.config.tenant.ts'],
        {
          cwd: process.cwd(),
          env: { ...process.env, TENANT_MIGRATION_DATABASE_URL: databaseUrl },
        },
      );

      let stderr = '';
      child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`prisma migrate deploy (tenant) falló con código ${code}: ${stderr}`));
      });
    });
  }
}
