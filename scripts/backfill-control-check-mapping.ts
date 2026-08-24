import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma-central/client';
import { decryptSecret } from '../src/infrastructure/tenancy/tenant-crypto.util';
import { buildPostgresUrl } from '../src/infrastructure/tenancy/tenant-db.util';

const POLICY_ID_BY_OS: Record<string, string> = {
  UBUNTU: 'cis_ubuntu22-04',
  WINDOWS: 'cis_win11_enterprise',
};

type CatalogRow = {
  soc2_code: string | null;
  cis_code: string | null;
  pci_dss_code: string | null;
  soc2_code_inferred: string | null;
  soc2_mapping_source: string | null;
  soc2_mapping_confidence: string | null;
  soc2_mapping_citation: string | null;
};

async function loadCatalog(wazuhPool: Pool): Promise<Map<string, CatalogRow>> {
  const { rows } = await wazuhPool.query(`
    SELECT policy_id, check_id, soc2_code, cis_code, pci_dss_code,
           soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation
    FROM cis_checks
  `);
  const map = new Map<string, CatalogRow>();
  for (const row of rows) {
    map.set(`${row.policy_id}::${row.check_id}`, row);
  }
  return map;
}

async function backfillDb(label: string, dbPool: Pool, catalog: Map<string, CatalogRow>) {
  const { rows } = await dbPool.query(`
    SELECT id, check_id, os FROM mnk_control_checks
    WHERE soc2_code IS NULL AND soc2_code_inferred IS NULL
  `);

  let updated = 0;
  let noMatch = 0;
  for (const row of rows) {
    const policyId = POLICY_ID_BY_OS[row.os];
    const catalogRow = policyId ? catalog.get(`${policyId}::${row.check_id}`) : undefined;
    if (!catalogRow) {
      noMatch++;
      continue;
    }
    await dbPool.query(
      `UPDATE mnk_control_checks SET
         soc2_code = $1, cis_code = $2, pci_dss_code = $3,
         soc2_code_inferred = $4, soc2_mapping_source = $5,
         soc2_mapping_confidence = $6, soc2_mapping_citation = $7
       WHERE id = $8`,
      [
        catalogRow.soc2_code, catalogRow.cis_code, catalogRow.pci_dss_code,
        catalogRow.soc2_code_inferred, catalogRow.soc2_mapping_source,
        catalogRow.soc2_mapping_confidence, catalogRow.soc2_mapping_citation,
        row.id,
      ],
    );
    updated++;
  }
  console.log(`  → ${label}: ${rows.length} checks sin mapeo encontrados, ${updated} actualizados, ${noMatch} sin match en el catálogo`);
}

async function main() {
  const wazuhPool = new Pool({ connectionString: process.env.WAZUH_DATABASE_URL });
  const catalog = await loadCatalog(wazuhPool);
  console.log(`Catálogo cargado: ${catalog.size} checks`);

  const centralPool = new Pool({ connectionString: process.env.CENTRAL_DATABASE_URL });
  console.log('Backfill en central (plantillas maestras):');
  await backfillDb('central', centralPool, catalog);
  await centralPool.end();

  const centralConnectionString = process.env.CENTRAL_DATABASE_URL;
  if (!centralConnectionString) throw new Error('CENTRAL_DATABASE_URL no está definida');
  const adapter = new PrismaPg({ connectionString: centralConnectionString });
  const centralPrisma = new PrismaClient({ adapter });

  const tenants = await centralPrisma.client.findMany({
    where: { is_active: true, provisioning_status: 'READY' },
    select: {
      id: true, name: true, db_host: true, db_port: true, db_name: true,
      db_user: true, db_password_enc: true, db_ssl: true,
    },
  });

  console.log(`\nBackfill en ${tenants.length} tenant(s):`);
  for (const tenant of tenants) {
    if (!tenant.db_password_enc) continue;
    const url = buildPostgresUrl({
      host: tenant.db_host!,
      port: tenant.db_port!,
      database: tenant.db_name!,
      user: tenant.db_user!,
      password: decryptSecret(tenant.db_password_enc),
      ssl: tenant.db_ssl!,
    });
    const tenantPool = new Pool({ connectionString: url });
    console.log(`  ${tenant.name} (${tenant.db_name}):`);
    await backfillDb(tenant.name, tenantPool, catalog);
    await tenantPool.end();
  }

  await wazuhPool.end();
  await centralPrisma.$disconnect();
  console.log('\nListo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
