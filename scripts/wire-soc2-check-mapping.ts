/**
 * Completa la evaluabilidad de los 118 controles del catálogo SOC 2 en UNA
 * base (central o un tenant), usando el mapeo REAL que ya está curado en
 * MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx (columna "SERVIDORES Check Wazuh",
 * con IDs reales de check por control) en vez de solo los 8 controles
 * migrados desde el catálogo viejo de 24:
 *
 *   1. Dimensión SERVER: para toda fila con "SERVIDORES Aplica" que
 *      empiece en "Sí"/"SÍ" (incluye el caso "SÍ, PERO SOLO SI es Linux",
 *      que el seed original excluía por un bug de mayúscula/acento en el
 *      startsWith), crea ControlDimensionRequirement(SERVER, AUTOMATIC) si
 *      falta, y ControlCheck reales (resueltos contra el catálogo cacheado
 *      de Wazuh, WAZUH_DATABASE_URL) para cada ID listado en
 *      "SERVIDORES Check Wazuh" — idempotente por (control_id, check_id).
 *   2. Dimensión POLICY (GOBIERNO): para toda fila con "GOBIERNO Aplica"
 *      = "Sí...", crea ManualCheckItem si el control todavía no tiene uno
 *      para esa dimensión — título = nombre del control, descripción =
 *      "GOBIERNO Evidencia requerida/indicada" (o fallback genérico).
 *
 * No borra ni pisa nada existente — solo agrega lo que falte. Los 128
 * checks ya migrados desde el catálogo viejo (7 controles) se detectan
 * como ya existentes (mismo check_id) y no se duplican.
 *
 * Uso:
 *   npx tsx scripts/wire-soc2-check-mapping.ts --db=central
 *   npx tsx scripts/wire-soc2-check-mapping.ts --db=central --apply
 *   npx tsx scripts/wire-soc2-check-mapping.ts --tenant-db-url="postgresql://..." --apply
 */
import 'dotenv/config';
import * as XLSX from 'xlsx';
import { Pool } from 'pg';

const EXCEL_PATH = '/home/carlos-castano/Escritorio/Next/Monkey/MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx';
const SHEET = 'SOC2_Maestro';

function isApplicable(raw: string): boolean {
  return /^s[íi]/i.test((raw || '').trim());
}

function parseCheckIds(raw: string): string[] {
  if (!raw) return [];
  return [...new Set(
    raw.split('|').map((s) => s.trim()).map((s) => s.match(/^(\d+)/)?.[1]).filter((s): s is string => !!s),
  )];
}

type ParsedRow = {
  monkeyId: string;
  name: string;
  serverApplicable: boolean;
  checkIds: string[];
  policyApplicable: boolean;
  policyEvidence: string;
};

function parseSheet(): ParsedRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[SHEET], { header: 1, defval: '' });
  const header: string[] = rows[0];
  const idx = (col: string) => header.indexOf(col);

  const iId = idx('ID Control MONKEY');
  const iName = idx('Control');
  const iServAplica = idx('SERVIDORES Aplica');
  const iServCheck = idx('SERVIDORES Check Wazuh');
  const iGobAplica = idx('GOBIERNO Aplica');
  const iGobEvid = idx('GOBIERNO Evidencia requerida/indicada');

  const parsed: ParsedRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monkeyId = String(row[iId] || '').trim();
    if (!monkeyId) continue;
    parsed.push({
      monkeyId,
      name: String(row[iName] || '').trim(),
      serverApplicable: isApplicable(String(row[iServAplica] || '')),
      checkIds: parseCheckIds(String(row[iServCheck] || '')),
      policyApplicable: isApplicable(String(row[iGobAplica] || '')),
      policyEvidence: String(row[iGobEvid] || '').trim(),
    });
  }
  return parsed;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dbArg = process.argv.find((a) => a.startsWith('--db='));
  const urlArg = process.argv.find((a) => a.startsWith('--tenant-db-url='));

  let connectionString: string;
  let label: string;
  if (urlArg) {
    connectionString = urlArg.split('=').slice(1).join('=');
    label = 'tenant';
  } else if (dbArg?.split('=')[1] === 'central') {
    connectionString = process.env.CENTRAL_DATABASE_URL!;
    label = 'central';
  } else {
    throw new Error('Pasa --db=central o --tenant-db-url="postgresql://..."');
  }

  const parsed = parseSheet();
  const pool = new Pool({ connectionString });
  const wazuhPool = new Pool({ connectionString: process.env.WAZUH_DATABASE_URL });

  const tpl = (await pool.query(`SELECT id FROM mnk_templates WHERE slug = 'soc-2'`)).rows[0];
  if (!tpl) throw new Error(`[${label}] No existe el template "soc-2" en esta base.`);

  const cisRows = (await wazuhPool.query(`
    SELECT check_id, title, soc2_code, cis_code, pci_dss_code, soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation
    FROM cis_checks
  `)).rows;
  const cisById = new Map(cisRows.map((r) => [r.check_id, r]));
  console.log(`[${label}] Catálogo Wazuh cacheado: ${cisById.size} checks.`);

  let dimReqCreated = 0, checksCreated = 0, checksSkippedExisting = 0, checksNotFoundInCatalog = 0;
  let manualDimReqOk = 0, manualCreated = 0, manualSkippedExisting = 0;
  let controlsNotFound = 0;
  const notFoundIds: string[] = [];

  for (const row of parsed) {
    const controlRes = await pool.query(
      `SELECT ctl.id, ctl.name FROM mnk_controls ctl
       JOIN mnk_reason_controls rc ON rc.control_id = ctl.id
       JOIN mnk_risk_reasons rr ON rr.reason_id = rc.reason_id
       JOIN mnk_risks r ON r.id = rr.risk_id
       WHERE r.template_id = $1 AND ctl.source_ref = $2
       LIMIT 1`,
      [tpl.id, row.monkeyId],
    );
    if (controlRes.rows.length === 0) {
      controlsNotFound++;
      notFoundIds.push(row.monkeyId);
      continue;
    }
    const controlId = controlRes.rows[0].id;

    // --- SERVER ---
    if (row.serverApplicable) {
      const dimExists = (await pool.query(
        `SELECT 1 FROM mnk_control_dimension_requirements WHERE control_id = $1 AND dimension = 'SERVER'`,
        [controlId],
      )).rows.length > 0;
      if (!dimExists) {
        dimReqCreated++;
        if (apply) {
          await pool.query(
            `INSERT INTO mnk_control_dimension_requirements (id, control_id, dimension, type, updated_at)
             VALUES (gen_random_uuid(), $1, 'SERVER', 'AUTOMATIC', now())`,
            [controlId],
          );
        }
      }

      for (const checkId of row.checkIds) {
        const cis = cisById.get(checkId);
        if (!cis) { checksNotFoundInCatalog++; continue; }
        const already = (await pool.query(
          `SELECT 1 FROM mnk_control_checks WHERE control_id = $1 AND check_id = $2`,
          [controlId, checkId],
        )).rows.length > 0;
        if (already) { checksSkippedExisting++; continue; }
        checksCreated++;
        if (apply) {
          await pool.query(
            `INSERT INTO mnk_control_checks
               (id, control_id, check_id, title, os, dimension, soc2_code, cis_code, pci_dss_code, soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation)
             VALUES (gen_random_uuid(), $1, $2, $3, 'UBUNTU', 'SERVER', $4, $5, $6, $7, $8, $9, $10)`,
            [controlId, checkId, cis.title, cis.soc2_code, cis.cis_code, cis.pci_dss_code, cis.soc2_code_inferred, cis.soc2_mapping_source, cis.soc2_mapping_confidence, cis.soc2_mapping_citation],
          );
        }
      }
    }

    // --- POLICY (GOBIERNO) ---
    if (row.policyApplicable) {
      const dimExists = (await pool.query(
        `SELECT 1 FROM mnk_control_dimension_requirements WHERE control_id = $1 AND dimension = 'POLICY'`,
        [controlId],
      )).rows.length > 0;
      if (dimExists) manualDimReqOk++;
      else if (apply) {
        await pool.query(
          `INSERT INTO mnk_control_dimension_requirements (id, control_id, dimension, type, updated_at)
           VALUES (gen_random_uuid(), $1, 'POLICY', 'MANUAL', now())`,
          [controlId],
        );
      }

      const hasManual = (await pool.query(
        `SELECT 1 FROM mnk_manual_check_items WHERE control_id = $1 AND dimension = 'POLICY'`,
        [controlId],
      )).rows.length > 0;
      if (hasManual) {
        manualSkippedExisting++;
      } else {
        manualCreated++;
        const description = row.policyEvidence || `Evidencia manual pendiente de cargar para el control "${row.name}" (dimensión Política).`;
        if (apply) {
          await pool.query(
            `INSERT INTO mnk_manual_check_items (id, control_id, title, description, remediation, dimension, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, 'POLICY', now())`,
            [controlId, row.name, description, 'Cargar evidencia (documento, política, captura) que sustente este control.'],
          );
        }
      }
    }
  }

  console.log(`\n=== [${label}] ${apply ? 'APLICADO' : 'DRY-RUN'} ===`);
  console.log(`Controles del Excel no encontrados en esta base: ${controlsNotFound}${notFoundIds.length ? ' -> ' + notFoundIds.join(', ') : ''}`);
  console.log(`\n-- SERVER --`);
  console.log(`ControlDimensionRequirement(SERVER) creados: ${dimReqCreated}`);
  console.log(`ControlCheck creados: ${checksCreated}`);
  console.log(`ControlCheck ya existentes (sin tocar): ${checksSkippedExisting}`);
  console.log(`Check IDs del Excel NO encontrados en el catálogo cacheado de Wazuh: ${checksNotFoundInCatalog}`);
  console.log(`\n-- POLICY --`);
  console.log(`ControlDimensionRequirement(POLICY) ya existentes: ${manualDimReqOk}`);
  console.log(`ManualCheckItem creados: ${manualCreated}`);
  console.log(`ManualCheckItem ya existentes (sin tocar): ${manualSkippedExisting}`);

  if (!apply) console.log('\n[DRY-RUN] No se escribió nada. Corré con --apply para aplicar de verdad.');

  await pool.end();
  await wazuhPool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
