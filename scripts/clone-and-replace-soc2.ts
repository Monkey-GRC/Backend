/**
 * Para un tenant que TODAVÍA no tiene el template "SOC 2" (catálogo nuevo,
 * 118 controles) clonado: lo clona desde central (mismo criterio que
 * cloneMasterTemplateIntoTenant, en SQL crudo para no depender del contexto
 * de Nest), y de una vez corre el reemplazo (migrar los 128 checks del "SOC 2"
 * de 24 controles y borrar el viejo) — deja al tenant con un solo "SOC 2" de
 * 118 controles, igual que central y que QA Onboarding Test SAS.
 *
 * Uso:
 *   npx tsx scripts/clone-and-replace-soc2.ts --tenant-db-url="postgresql://..." --apply
 */
import 'dotenv/config';
import { Pool, PoolClient } from 'pg';

async function cloneTemplate(centralPool: Pool, tenantPool: PoolClient, masterTemplateId: string) {
  const tpl = (await centralPool.query(`SELECT * FROM mnk_templates WHERE id = $1`, [masterTemplateId])).rows[0];

  const newTplId = (await tenantPool.query(
    `INSERT INTO mnk_templates (id, name, description, objective, scope, slug, code, source_template_id, adopted_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING id`,
    [tpl.name, tpl.description, tpl.objective, tpl.scope, tpl.slug, tpl.code, tpl.id],
  )).rows[0].id;

  const risks = (await centralPool.query(`SELECT * FROM mnk_risks WHERE template_id = $1`, [masterTemplateId])).rows;
  const reasonMap = new Map<string, string>();
  const controlMap = new Map<string, string>();

  for (const risk of risks) {
    const newRiskId = (await tenantPool.query(
      `INSERT INTO mnk_risks (id, name, description, objective, impact, probability, level, code, template_id, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, now()) RETURNING id`,
      [risk.name, risk.description, risk.objective, risk.impact, risk.probability, risk.level, risk.code, newTplId],
    )).rows[0].id;

    const riskReasons = (await centralPool.query(
      `SELECT r.* FROM mnk_reasons r JOIN mnk_risk_reasons rr ON rr.reason_id = r.id WHERE rr.risk_id = $1`,
      [risk.id],
    )).rows;

    for (const reason of riskReasons) {
      let newReasonId = reasonMap.get(reason.id);
      if (!newReasonId) {
        newReasonId = (await tenantPool.query(
          `INSERT INTO mnk_reasons (id, name, description, code, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, now()) RETURNING id`,
          [reason.name, reason.description, reason.code],
        )).rows[0].id;
        reasonMap.set(reason.id, newReasonId!);

        const reasonControls = (await centralPool.query(
          `SELECT c.* FROM mnk_controls c JOIN mnk_reason_controls rc ON rc.control_id = c.id WHERE rc.reason_id = $1`,
          [reason.id],
        )).rows;

        for (const control of reasonControls) {
          let newControlId = controlMap.get(control.id);
          if (!newControlId) {
            newControlId = (await tenantPool.query(
              `INSERT INTO mnk_controls (id, name, description, objective, type, code, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now()) RETURNING id`,
              [control.name, control.description, control.objective, control.type, control.code],
            )).rows[0].id;
            controlMap.set(control.id, newControlId!);

            const checks = (await centralPool.query(`SELECT * FROM mnk_control_checks WHERE control_id = $1`, [control.id])).rows;
            for (const chk of checks) {
              await tenantPool.query(
                `INSERT INTO mnk_control_checks (id, control_id, check_id, title, os, dimension, soc2_code, cis_code, pci_dss_code, soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [newControlId, chk.check_id, chk.title, chk.os, chk.dimension, chk.soc2_code, chk.cis_code, chk.pci_dss_code, chk.soc2_code_inferred, chk.soc2_mapping_source, chk.soc2_mapping_confidence, chk.soc2_mapping_citation],
              );
            }

            const manualChecks = (await centralPool.query(`SELECT * FROM mnk_manual_check_items WHERE control_id = $1`, [control.id])).rows;
            for (const mc of manualChecks) {
              await tenantPool.query(
                `INSERT INTO mnk_manual_check_items (id, control_id, title, description, remediation, dimension, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())`,
                [newControlId, mc.title, mc.description, mc.remediation, mc.dimension],
              );
            }

            const dims = (await centralPool.query(`SELECT * FROM mnk_control_dimension_requirements WHERE control_id = $1`, [control.id])).rows;
            for (const dim of dims) {
              await tenantPool.query(
                `INSERT INTO mnk_control_dimension_requirements (id, control_id, dimension, type, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, now())`,
                [newControlId, dim.dimension, dim.type],
              );
            }
          }
          await tenantPool.query(`INSERT INTO mnk_reason_controls (id, reason_id, control_id) VALUES (gen_random_uuid(), $1, $2)`, [newReasonId, newControlId]);
        }
      }
      await tenantPool.query(`INSERT INTO mnk_risk_reasons (id, risk_id, reason_id) VALUES (gen_random_uuid(), $1, $2)`, [newRiskId, newReasonId]);
    }
  }

  return newTplId;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const urlArg = process.argv.find((a) => a.startsWith('--tenant-db-url='));
  if (!urlArg) throw new Error('Pasa --tenant-db-url="postgresql://..."');
  const tenantUrl = urlArg.split('=').slice(1).join('=');

  const centralPool = new Pool({ connectionString: process.env.CENTRAL_DATABASE_URL });
  const tenantPoolForCheck = new Pool({ connectionString: tenantUrl });

  const masterTpl = (await centralPool.query(`SELECT id FROM mnk_templates WHERE slug = 'soc-2'`)).rows[0];
  if (!masterTpl) throw new Error('No existe el template "soc-2" en central — ¿ya se corrió replace-soc2-legacy-catalog.ts ahí?');

  const already = (await tenantPoolForCheck.query(`SELECT id FROM mnk_templates WHERE source_template_id = $1`, [masterTpl.id])).rows[0];
  if (already) {
    console.log('Este tenant ya tiene el template clonado (source_template_id coincide) — no se re-clona.');
    await tenantPoolForCheck.end();
  } else if (!apply) {
    console.log('[DRY-RUN] Se clonaría el template central "soc-2" (118 controles) hacia este tenant. Corré con --apply.');
    await centralPool.end(); await tenantPoolForCheck.end();
    return;
  } else {
    await tenantPoolForCheck.end();
    const tenantClient = new Pool({ connectionString: tenantUrl });
    const client = await tenantClient.connect();
    try {
      console.log('Clonando template desde central (transacción atómica: todo o nada)...');
      await client.query('BEGIN');
      const newId = await cloneTemplate(centralPool, client, masterTpl.id);
      await client.query('COMMIT');
      console.log('Clonado con id', newId);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Falló el clonado, se revirtió todo (rollback):', err);
      throw err;
    } finally {
      client.release();
      await tenantClient.end();
    }
  }

  await centralPool.end();

  if (!apply) return;

  console.log('\nCorriendo el reemplazo (migrar checks del SOC 2 viejo y borrarlo)...');
  const { execSync } = require('child_process');
  execSync(`npx tsx scripts/replace-soc2-legacy-catalog.ts --tenant-db-url="${tenantUrl}" --apply`, { stdio: 'inherit', cwd: __dirname + '/..' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
