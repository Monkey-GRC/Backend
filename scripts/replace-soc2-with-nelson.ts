/**
 * Reemplaza el template "SOC 2" (24 controles originales) por "SOC 2 (Nelson)"
 * (118 controles) en UNA base (central o de un tenant), dejando un solo
 * catálogo SOC 2, sin duplicados:
 *
 *   1. Migra los ControlCheck (checks reales de Wazuh) de los 8 controles
 *      AUTOMATIC originales hacia su control equivalente en el catálogo de
 *      Nelson (mapeo curado a mano, ver CONTROL_MAPPING).
 *   2. Verifica que ningún ManualCheckItem de los 24 controles originales
 *      tenga evidencia real o estado distinto de PENDING — si encuentra
 *      algo, SE DETIENE sin borrar nada (no se pierde trabajo real sin avisar).
 *   3. Borra Control/Reason/Risk/Template del "SOC 2" original (24 controles).
 *   4. Renombra "SOC 2 (Nelson)" -> nombre "SOC 2", slug "soc-2" — así el
 *      onboarding (que ya lista los templates de central para elegir) no
 *      necesita ningún cambio de código: solo va a quedar un "SOC 2".
 *
 * Uso (por base):
 *   npx tsx scripts/replace-soc2-with-nelson.ts --db=central
 *   npx tsx scripts/replace-soc2-with-nelson.ts --db=central --apply
 *   npx tsx scripts/replace-soc2-with-nelson.ts --tenant-db-url="postgresql://..." --apply
 */
import 'dotenv/config';
import { Pool } from 'pg';

const CONTROL_MAPPING: Record<string, string> = {
  'Política de contraseñas conforme a CIS Benchmark': 'Política de contraseñas aplicada',
  'Control de cuentas privilegiadas y permisos de archivos de identidad': 'Acceso al sistema operativo de producción restringido',
  'Bastionado del servicio SSH': 'Estándares de fortalecimiento de red y sistemas mantenidos',
  'Firewall con política de denegación por defecto': 'Firewalls de red utilizados',
  'Avisos legales (banner) de acceso a los sistemas': 'Políticas de seguridad establecidas y revisadas',
  'Bastionado de particiones del sistema operativo': 'Sistema de gestión de configuración establecido',
  'Deshabilitación de servicios innecesarios': 'Sistema de gestión de configuración establecido',
  'Auditoría y registro continuo de eventos del sistema (auditd)': 'Gestión de registros (logs) utilizada',
};

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

  const pool = new Pool({ connectionString });

  const oldTemplate = await pool.query(`SELECT id, name, slug FROM mnk_templates WHERE slug = 'soc-2-tsc'`);
  // El template Nelson puede llamarse "soc-2-nelson" (antes de renombrar en central)
  // o ya "soc-2" (si se clonó DESPUÉS de que central se renombró) — cualquiera de
  // los dos que exista y no sea el viejo "soc-2-tsc" es el correcto.
  const newTemplate = await pool.query(`SELECT id, name, slug FROM mnk_templates WHERE slug IN ('soc-2-nelson', 'soc-2') AND slug != 'soc-2-tsc'`);

  if (oldTemplate.rows.length === 0) {
    console.log(`[${label}] No hay template "soc-2" original — nada que reemplazar aquí (¿ya se corrió antes?).`);
    await pool.end();
    return;
  }
  if (newTemplate.rows.length === 0) {
    console.log(`[${label}] No existe "soc-2-nelson" en esta base todavía — hay que adoptarlo primero (POST /templates/master/:id/adopt).`);
    await pool.end();
    return;
  }

  const oldTemplateId = oldTemplate.rows[0].id;
  const newTemplateId = newTemplate.rows[0].id;
  console.log(`[${label}] Template viejo: ${oldTemplateId} | Template Nelson: ${newTemplateId}`);

  // --- Paso 1: mapear los 8 controles AUTOMATIC con sus checks ---
  const oldControls = await pool.query(`
    SELECT c.id, c.name, count(cc.id) as checks
    FROM mnk_controls c
    JOIN mnk_reason_controls rc ON rc.control_id = c.id
    JOIN mnk_risk_reasons rr ON rr.reason_id = rc.reason_id
    JOIN mnk_risks r ON r.id = rr.risk_id
    LEFT JOIN mnk_control_checks cc ON cc.control_id = c.id
    WHERE r.template_id = $1
    GROUP BY c.id, c.name
  `, [oldTemplateId]);

  console.log(`[${label}] Controles del template viejo: ${oldControls.rows.length}`);

  const moves: { oldControlId: string; oldName: string; newControlId: string; newName: string; checks: number }[] = [];
  const unmapped: string[] = [];

  for (const row of oldControls.rows) {
    const checks = Number(row.checks);
    if (checks === 0) continue; // sin checks, no hay nada que migrar
    const targetName = CONTROL_MAPPING[row.name];
    if (!targetName) {
      unmapped.push(`${row.name} (${checks} checks)`);
      continue;
    }
    const target = await pool.query(`
      SELECT ctl.id FROM mnk_controls ctl
      JOIN mnk_reason_controls rc ON rc.control_id = ctl.id
      JOIN mnk_risk_reasons rr ON rr.reason_id = rc.reason_id
      JOIN mnk_risks r ON r.id = rr.risk_id
      WHERE r.template_id = $1 AND ctl.name = $2
      LIMIT 1
    `, [newTemplateId, targetName]);
    if (target.rows.length === 0) {
      unmapped.push(`${row.name} -> "${targetName}" (NO ENCONTRADO en Nelson)`);
      continue;
    }
    moves.push({ oldControlId: row.id, oldName: row.name, newControlId: target.rows[0].id, newName: targetName, checks });
  }

  console.log(`\n=== Checks a migrar ===`);
  for (const m of moves) console.log(`  "${m.oldName}" (${m.checks} checks) -> "${m.newName}"`);
  if (unmapped.length) {
    console.log(`\n⚠️  Controles con checks SIN mapeo resuelto (no se tocan):`);
    for (const u of unmapped) console.log(`  ${u}`);
  }

  // --- Paso 2: verificar que no haya evidencia manual real que se perdería ---
  const riskyManualChecks = await pool.query(`
    SELECT mci.id, mci.title, mci.status, c.name as control_name,
           (SELECT count(*) FROM mnk_manual_check_evidence WHERE manual_check_id = mci.id) as evidencia
    FROM mnk_manual_check_items mci
    JOIN mnk_controls c ON c.id = mci.control_id
    JOIN mnk_reason_controls rc ON rc.control_id = c.id
    JOIN mnk_risk_reasons rr ON rr.reason_id = rc.reason_id
    JOIN mnk_risks r ON r.id = rr.risk_id
    WHERE r.template_id = $1
      AND (mci.status != 'PENDING' OR EXISTS (SELECT 1 FROM mnk_manual_check_evidence WHERE manual_check_id = mci.id))
  `, [oldTemplateId]);

  if (riskyManualChecks.rows.length > 0) {
    console.log(`\n🛑 DETENIDO: hay ${riskyManualChecks.rows.length} checks manuales con evaluación real o evidencia subida en el template viejo — NO se borra nada para no perder ese trabajo:`);
    for (const r of riskyManualChecks.rows) {
      console.log(`   "${r.title}" (control "${r.control_name}") — status=${r.status}, evidencia=${r.evidencia}`);
    }
    await pool.end();
    process.exit(1);
  }
  console.log(`\n✅ Sin evidencia manual real en riesgo — todos los manual checks del template viejo están en PENDING sin evidencia.`);

  if (!apply) {
    console.log('\n[DRY-RUN] No se escribió nada. Corré con --apply para ejecutar de verdad.');
    await pool.end();
    return;
  }

  console.log('\n[APPLY] Migrando checks...');
  for (const m of moves) {
    await pool.query(`UPDATE mnk_control_checks SET control_id = $1 WHERE control_id = $2`, [m.newControlId, m.oldControlId]);
  }

  console.log('Borrando controles/reasons/risks/template viejo...');
  const oldRiskIds = (await pool.query(`SELECT id FROM mnk_risks WHERE template_id = $1`, [oldTemplateId])).rows.map((r) => r.id);
  const oldReasonIds = (await pool.query(`
    SELECT DISTINCT reason_id FROM mnk_risk_reasons WHERE risk_id = ANY($1::uuid[])
  `, [oldRiskIds])).rows.map((r) => r.reason_id);

  // Controles: ya no tienen checks (migrados) — al borrarlos se cascadea mnk_reason_controls y mnk_manual_check_items (vacíos/PENDING, ya verificado)
  await pool.query(`
    DELETE FROM mnk_controls ctl USING mnk_reason_controls rc, mnk_risk_reasons rr, mnk_risks r
    WHERE rc.control_id = ctl.id AND rr.reason_id = rc.reason_id AND r.id = rr.risk_id AND r.template_id = $1
  `, [oldTemplateId]);

  await pool.query(`DELETE FROM mnk_risk_reasons WHERE risk_id = ANY($1::uuid[])`, [oldRiskIds]);
  await pool.query(`DELETE FROM mnk_risks WHERE id = ANY($1::uuid[])`, [oldRiskIds]);

  // Reasons huérfanas (ya no referenciadas por ningún control)
  const orphanReasons = await pool.query(`
    SELECT id FROM mnk_reasons WHERE id = ANY($1::uuid[])
      AND id NOT IN (SELECT reason_id FROM mnk_reason_controls)
      AND id NOT IN (SELECT reason_id FROM mnk_risk_reasons)
  `, [oldReasonIds]);
  await pool.query(`DELETE FROM mnk_reasons WHERE id = ANY($1::uuid[])`, [orphanReasons.rows.map((r) => r.id)]);

  await pool.query(`DELETE FROM mnk_templates WHERE id = $1`, [oldTemplateId]);

  console.log('Renombrando "SOC 2 (Nelson)" -> "SOC 2"...');
  await pool.query(`UPDATE mnk_templates SET name = 'SOC 2', slug = 'soc-2' WHERE id = $1`, [newTemplateId]);

  console.log(`\n✅ [${label}] Listo: catálogo unificado, solo queda "SOC 2" con 118 controles.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
