import 'dotenv/config';
import { spawn } from 'node:child_process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma-central/client';
import { decryptSecret } from '../src/infrastructure/tenancy/tenant-crypto.util';
import { buildPostgresUrl } from '../src/infrastructure/tenancy/tenant-db.util';

function runMigrateDeploy(databaseUrl: string): Promise<void> {
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
      else reject(new Error(`exit code ${code}: ${stderr}`));
    });
  });
}

async function main() {
  const connectionString = process.env.CENTRAL_DATABASE_URL;
  if (!connectionString) throw new Error('CENTRAL_DATABASE_URL no está definida');

  const adapter = new PrismaPg({ connectionString });
  const centralPrisma = new PrismaClient({ adapter });

  const tenants = await centralPrisma.client.findMany({
    where: { is_active: true, provisioning_status: 'READY' },
    select: {
      id: true,
      name: true,
      db_host: true,
      db_port: true,
      db_name: true,
      db_user: true,
      db_password_enc: true,
      db_ssl: true,
    },
  });

  console.log(`🔧 Migrando ${tenants.length} tenant(s)...`);

  const failures: { name: string; error: string }[] = [];

  for (const tenant of tenants) {
    process.stdout.write(`  → ${tenant.name} (${tenant.db_name})... `);
    if (!tenant.db_host || !tenant.db_port || !tenant.db_name || !tenant.db_user || !tenant.db_password_enc) {
      console.log('SIN DB APROVISIONADA (se omite)');
      continue;
    }
    try {
      const databaseUrl = buildPostgresUrl({
        host: tenant.db_host,
        port: tenant.db_port,
        database: tenant.db_name,
        user: tenant.db_user,
        password: decryptSecret(tenant.db_password_enc),
        ssl: !!tenant.db_ssl,
      });
      await runMigrateDeploy(databaseUrl);
      console.log('OK');
    } catch (err) {
      console.log('FALLÓ');
      failures.push({ name: tenant.name, error: err instanceof Error ? err.message : String(err) });
    }
  }

  await centralPrisma.$disconnect();

  if (failures.length) {
    console.error('\n❌ Tenants con error:');
    for (const f of failures) console.error(`  - ${f.name}: ${f.error}`);
    process.exit(1);
  }

  console.log('\n✅ Todos los tenants migrados correctamente.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
