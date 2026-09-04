/**
 * Purga cualquier referencia interna de origen ("Nelson"/"Vanta" — nombres
 * de contexto de la conversación con el cliente, nunca deben quedar en un
 * dato de producto) de `mnk_controls.description`, `mnk_templates.description`
 * y `mnk_risks.description`, en UNA base (central o un tenant):
 *
 *   - Control: `description` con formato "[Nelson {id} | TSC {codes}] {texto}"
 *     -> se extrae {id} a la columna oculta `source_ref` (para que scripts
 *     de importación futuros puedan re-matchear sin depender de texto
 *     visible) y `description` queda solo con {texto}.
 *   - Template: `description` que mencione la referencia interna se
 *     reemplaza por un texto profesional genérico.
 *   - Risk: mismo reemplazo genérico (todos los Risk de dominio comparten
 *     el mismo texto placeholder).
 *
 * Idempotente — si ya se corrió antes, no encuentra nada que cambiar.
 *
 * Uso:
 *   npx tsx scripts/sanitize-control-descriptions.ts --db=central
 *   npx tsx scripts/sanitize-control-descriptions.ts --db=central --apply
 *   npx tsx scripts/sanitize-control-descriptions.ts --tenant-db-url="postgresql://..." --apply
 */
import 'dotenv/config';
import { Pool } from 'pg';

const GENERIC_TEMPLATE_DESCRIPTION =
  'Marco SOC 2 (Trust Services Criteria), evaluado por control y por dimensión (Política, Servidor, Base de Datos, Nube, Aplicación).';

const GENERIC_RISK_DESCRIPTION =
  'Dominio del marco SOC 2. Impact/probability son PLACEHOLDER (2/2) — este catálogo cataloga controles, no evalúa riesgo; pendiente de evaluación real por el equipo.';

const CONTROL_PATTERN = /^\[Nelson ([A-Z0-9-]+) \| TSC [^\]]*\]\s*(.*)$/s;

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

  const controls = (await pool.query(
    `SELECT id, name, description FROM mnk_controls WHERE description ILIKE '%nelson%'`,
  )).rows;

  console.log(`[${label}] Controles con "Nelson" en description: ${controls.length}`);
  let controlsFixed = 0;
  let controlsUnmatched = 0;

  for (const c of controls) {
    const match = c.description.match(CONTROL_PATTERN);
    if (!match) {
      controlsUnmatched++;
      console.log(`  ⚠️  No matchea el patrón esperado: "${c.name}" -> "${c.description.slice(0, 80)}..."`);
      continue;
    }
    const [, sourceRef, cleanText] = match;
    controlsFixed++;
    if (apply) {
      await pool.query(
        `UPDATE mnk_controls SET description = $1, source_ref = $2 WHERE id = $3`,
        [cleanText.trim(), sourceRef, c.id],
      );
    }
  }

  const templates = (await pool.query(
    `SELECT id, name, description FROM mnk_templates WHERE description ILIKE '%nelson%' OR description ILIKE '%vanta%'`,
  )).rows;

  console.log(`[${label}] Templates con "Nelson"/"Vanta" en description: ${templates.length}`);
  for (const t of templates) {
    console.log(`  "${t.name}": "${t.description}"`);
    if (apply) {
      await pool.query(`UPDATE mnk_templates SET description = $1 WHERE id = $2`, [GENERIC_TEMPLATE_DESCRIPTION, t.id]);
    }
  }

  const risks = (await pool.query(
    `SELECT id, name, description FROM mnk_risks WHERE description ILIKE '%nelson%'`,
  )).rows;

  console.log(`[${label}] Risks con "Nelson" en description: ${risks.length}`);
  for (const r of risks) {
    if (apply) {
      await pool.query(`UPDATE mnk_risks SET description = $1 WHERE id = $2`, [GENERIC_RISK_DESCRIPTION, r.id]);
    }
  }

  console.log(`\n=== [${label}] ${apply ? 'APLICADO' : 'DRY-RUN'} ===`);
  console.log(`Controles corregidos: ${controlsFixed} | sin matchear (revisar a mano): ${controlsUnmatched}`);
  console.log(`Templates corregidos: ${templates.length}`);
  console.log(`Risks corregidos: ${risks.length}`);
  if (!apply) console.log('\n[DRY-RUN] No se escribió nada. Corré con --apply para aplicar de verdad.');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
