/**
 * Crea el Template "SOC 2 (Nelson)" completo — Template -> Risk -> Reason ->
 * Control -> ControlDimensionRequirement — a partir de
 * MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx (hoja SOC2_Maestro, 118 filas),
 * respetando la agrupación que Nelson ya usa:
 *
 *   - Risk    = 1 por cada "Dominio" distinto (27) — placeholder de
 *               impact/probability/level porque Nelson no evalúa riesgo,
 *               solo cataloga controles (ver aviso en cada Risk creado).
 *   - Reason  = 1 por cada código TSC distinto (~61-88) — su texto es el
 *               "Criterio SOC 2" (AICPA) real de Nelson para ese código,
 *               nunca inventado.
 *   - Control = 1 por fila (118), igual que seed-soc2-catalog.ts, con sus
 *               ControlDimensionRequirement (solo dimensiones "Sí...").
 *
 * NO crea ControlCheck ni ManualCheckItem (misma razón que
 * seed-soc2-catalog.ts: la ambigüedad 1-código-TSC-a-muchos-controles
 * requiere revisión humana, no se automatiza aquí).
 *
 * Uso:
 *   npx tsx scripts/seed-soc2-template.ts            # dry-run
 *   npx tsx scripts/seed-soc2-template.ts --apply     # aplica
 */
import 'dotenv/config';
import * as XLSX from 'xlsx';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ControlDimension, ControlType } from 'generated/prisma-central/client';
import { obfuscateSeq } from '../src/common/utils/obfuscate-code';

const EXCEL_PATH = '/home/carlos-castano/Escritorio/Next/Monkey/MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx';
const SHEET = 'SOC2_Maestro';

const DIMENSION_COLUMNS: { prefix: string; dimension: ControlDimension }[] = [
  { prefix: 'APP', dimension: ControlDimension.APP },
  { prefix: 'BD', dimension: ControlDimension.DATABASE },
  { prefix: 'NUBE', dimension: ControlDimension.CLOUD },
  { prefix: 'SERVIDORES', dimension: ControlDimension.SERVER },
  { prefix: 'GOBIERNO', dimension: ControlDimension.POLICY },
];

function mapTipo(tipoRaw: string): ControlType {
  const t = (tipoRaw || '').toLowerCase();
  if (t.includes('automático') || t.includes('automatico')) return ControlType.AUTOMATIC;
  return ControlType.MANUAL;
}

function aplicaConfirmado(aplicaRaw: string): boolean {
  return (aplicaRaw || '').trim().startsWith('Sí');
}

type ParsedRow = {
  monkeyId: string;
  name: string;
  description: string;
  dominio: string;
  codes: string[];
  criterioByCode: Map<string, string>;
  dimensions: { dimension: ControlDimension; type: ControlType }[];
};

function parseSheet(): ParsedRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[SHEET], { header: 1, defval: '' });
  const header: string[] = rows[0];
  const idx = (col: string) => header.indexOf(col);

  const idxId = idx('ID Control MONKEY');
  const idxName = idx('Control');
  const idxDesc = idx('Descripción del control');
  const idxTsc = idx('TSC Ref');
  const idxCriterio = idx('Criterio SOC 2');
  const idxDominio = idx('Dominio');

  const parsed: ParsedRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monkeyId = String(row[idxId] || '').trim();
    if (!monkeyId) continue;

    const codes = String(row[idxTsc] || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const criterios = String(row[idxCriterio] || '').split(/\r?\n/).map((s) => s.trim());
    const criterioByCode = new Map<string, string>();
    codes.forEach((code, i) => criterioByCode.set(code, criterios[i] || criterios[0] || '(sin texto de criterio en la fuente)'));

    const dimensions: ParsedRow['dimensions'] = [];
    for (const { prefix, dimension } of DIMENSION_COLUMNS) {
      const aplica = String(row[idx(`${prefix} Aplica`)] || '');
      const tipo = String(row[idx(`${prefix} Tipo`)] || '');
      if (aplicaConfirmado(aplica)) dimensions.push({ dimension, type: mapTipo(tipo) });
    }

    parsed.push({
      monkeyId,
      name: String(row[idxName] || '').trim(),
      description: String(row[idxDesc] || '').trim(),
      dominio: String(row[idxDominio] || '(Sin dominio)').trim(),
      codes,
      criterioByCode,
      dimensions,
    });
  }

  return parsed;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const parsed = parseSheet();

  const dominios = [...new Set(parsed.map((r) => r.dominio))].sort();
  const codigoATexto = new Map<string, string>();
  for (const row of parsed) for (const [code, texto] of row.criterioByCode) if (!codigoATexto.has(code)) codigoATexto.set(code, texto);
  const codigos = [...codigoATexto.keys()].sort();

  console.log(`Filas (Control): ${parsed.length}`);
  console.log(`Risk a crear (por Dominio): ${dominios.length}`);
  console.log(`Reason a crear (por código TSC, con su Criterio SOC 2 real): ${codigos.length}`);

  if (!apply) {
    console.log('\n[DRY-RUN] Ejemplo de la cadena completa para 1 control:');
    const ejemplo = parsed.find((r) => r.codes.length > 1) ?? parsed[0];
    console.log(`  Template: SOC 2 (Nelson)`);
    console.log(`    Risk: "${ejemplo.dominio}" (impact=2, probability=2 -> level=MEDIUM, placeholder pendiente de evaluar)`);
    for (const code of ejemplo.codes) {
      console.log(`      Reason "${code}": "${ejemplo.criterioByCode.get(code)!.slice(0, 90)}..."`);
    }
    console.log(`        Control: ${ejemplo.monkeyId} "${ejemplo.name}"`);
    console.log(`          dimensiones: ${ejemplo.dimensions.map((d) => `${d.dimension}:${d.type}`).join(', ') || '(ninguna confirmada)'}`);
    console.log('\nCorré con --apply para crear todo de verdad.');
    return;
  }

  const connectionString = process.env.CENTRAL_DATABASE_URL;
  if (!connectionString) throw new Error('CENTRAL_DATABASE_URL no está definida');
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('\n[APPLY] Creando Template...');
  const templateCreated = await prisma.template.create({
    data: {
      name: 'SOC 2 (Nelson)',
      slug: 'soc-2-nelson',
      description: 'Marco SOC 2 importado desde MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx (basado en el marco real de Nelson, extraído de Vanta), con dimensiones verificadas contra Wazuh.',
      objective: 'Cumplimiento SOC 2 (Trust Services Criteria) orientado a control, con evidencia por dimensión (Política/Servidor/BD/Nube/App).',
      code: 'PENDING',
    },
  });
  await prisma.template.update({ where: { id: templateCreated.id }, data: { code: `TPL-${obfuscateSeq(templateCreated.seq)}` } });
  console.log(`  Template creado: ${templateCreated.id}`);

  console.log('Creando Risk (uno por Dominio)...');
  const riskIdByDominio = new Map<string, string>();
  for (const dominio of dominios) {
    const risk = await prisma.risk.create({
      data: {
        name: dominio,
        description: `Dominio del marco SOC 2 de Nelson. Impact/probability son PLACEHOLDER (2/2) — Nelson cataloga controles, no evalúa riesgo; pendiente de evaluación real por el equipo.`,
        code: 'PENDING',
        impact: 2,
        probability: 2,
        level: 'MEDIUM',
        template_id: templateCreated.id,
      },
    });
    await prisma.risk.update({ where: { id: risk.id }, data: { code: `RGS-${obfuscateSeq(risk.seq)}` } });
    riskIdByDominio.set(dominio, risk.id);
  }
  console.log(`  ${riskIdByDominio.size} Risk creados.`);

  console.log('Creando Reason (uno por código TSC, con su Criterio SOC 2 real)...');
  const reasonIdByCode = new Map<string, string>();
  for (const code of codigos) {
    const reason = await prisma.reason.create({
      data: { name: `Criterio ${code}`, description: codigoATexto.get(code)!, code: 'PENDING' },
    });
    await prisma.reason.update({ where: { id: reason.id }, data: { code: `RSN-${obfuscateSeq(reason.seq)}` } });
    reasonIdByCode.set(code, reason.id);
  }
  console.log(`  ${reasonIdByCode.size} Reason creados.`);

  console.log('Vinculando Risk<->Reason (RiskReason) según qué controles comparten Dominio+código...');
  const riskReasonSeen = new Set<string>();
  for (const row of parsed) {
    const riskId = riskIdByDominio.get(row.dominio)!;
    for (const code of row.codes) {
      const reasonId = reasonIdByCode.get(code)!;
      const key = `${riskId}::${reasonId}`;
      if (riskReasonSeen.has(key)) continue;
      riskReasonSeen.add(key);
      await prisma.riskReason.create({ data: { risk_id: riskId, reason_id: reasonId } });
    }
  }
  console.log(`  ${riskReasonSeen.size} vínculos Risk<->Reason creados.`);

  console.log('Creando Control + ControlDimensionRequirement + ReasonControl...');
  let creados = 0;
  for (const row of parsed) {
    const control = await prisma.control.create({
      data: {
        name: row.name,
        description: `[Nelson ${row.monkeyId} | TSC ${row.codes.join(', ')}] ${row.description}`,
        type: row.dimensions.some((d) => d.type === ControlType.AUTOMATIC)
          ? (row.dimensions.every((d) => d.type === ControlType.AUTOMATIC) ? ControlType.AUTOMATIC : ControlType.HYBRID)
          : ControlType.MANUAL,
        code: 'PENDING',
      },
    });
    await prisma.control.update({ where: { id: control.id }, data: { code: `CTR-${obfuscateSeq(control.seq)}` } });

    for (const dim of row.dimensions) {
      await prisma.controlDimensionRequirement.create({ data: { control_id: control.id, dimension: dim.dimension, type: dim.type } });
    }

    for (const code of row.codes) {
      const reasonId = reasonIdByCode.get(code)!;
      await prisma.reasonControl.create({ data: { reason_id: reasonId, control_id: control.id } }).catch(() => {
        // mismo control+reason ya vinculado (2 codigos iguales en la misma fila, no debería pasar pero por seguridad)
      });
    }
    creados++;
  }

  console.log(`\n✅ Listo: Template "SOC 2 (Nelson)" con ${riskIdByDominio.size} Risk, ${reasonIdByCode.size} Reason y ${creados} Control (con sus dimensiones).`);
  console.log('Recordatorio: no se crearon checks (ControlCheck) ni evidencia manual (ManualCheckItem) — pendiente de curaduría humana.');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
