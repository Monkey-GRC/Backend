// D90 · Guía de corrección de los checks de nube en español → base de datos.
//
//   npm run cloud:translate              # dry-run
//   npm run cloud:translate -- --apply   # escribe, en UNA transacción
//
// Escribe `title_es`, `remediation_es` y `translation_origin = 'machine'` desde data/cloud-checks-es.json (AWS) y data/cloud-<plataforma>-checks-es.json (--platform aws|gcp; por defecto, las plataformas con dataset) (traducción automática, sin revisar). Nunca pisa una traducción
// que una persona ya revisó (`reviewed`) y solo actualiza lo que cambió. No crea ni borra checks y se niega a correr como `monkey_app`.
import { existsSync, readFileSync } from 'node:fs';
import { connectAsOwner } from './db';
import { Platform } from './cloud/build';
import { selectedPlatforms, translationsPath } from './cloud/datasets';
import { CheckTranslation, validateTranslations } from './cloud/translations';

const apply = process.argv.includes('--apply');

type Prisma = Awaited<ReturnType<typeof connectAsOwner>>['prisma'];

type Plan = { platform: Platform; items: CheckTranslation[]; byKey: Map<string, { id: string; checkId: string; translationOrigin: string | null }>; reviewed: number; changed: CheckTranslation[]; errors: string[] };

// Solo lee y calcula: nunca escribe ni sale del proceso.
async function planPlatform(prisma: Prisma, platform: Platform): Promise<Plan> {
  const items = existsSync(translationsPath(platform)) ? (JSON.parse(readFileSync(translationsPath(platform), 'utf8')) as CheckTranslation[]) : [];
  const dbChecks = await prisma.check.findMany({ where: { platform, policyId: 'cloud_configuration' }, select: { id: true, checkId: true, titleEs: true, remediationEs: true, translationOrigin: true } });
  const byKey = new Map(dbChecks.map((c) => [c.checkId, c]));
  const errors = validateTranslations(items, new Set(byKey.keys())).slice(0, 30).map((p) => `[${platform}] ${p}`);
  if (errors.length) return { platform, items, byKey, reviewed: 0, changed: [], errors };
  const reviewed = items.filter((t) => byKey.get(t.checkId)!.translationOrigin === 'reviewed').length;
  const changed = items.filter((t) => {
    const d = byKey.get(t.checkId)!;
    return d.translationOrigin !== 'reviewed' && (d.titleEs !== t.titleEs || d.remediationEs !== t.remediationEs || d.translationOrigin !== 'machine');
  });
  return { platform, items, byKey, reviewed, changed, errors };
}

async function main() {
  const platforms = selectedPlatforms(process.argv);
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})  plataformas: ${platforms.join(', ') || 'ninguna'}`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }
    const plans: Plan[] = [];
    for (const platform of platforms) plans.push(await planPlatform(prisma, platform));
    const errors = plans.flatMap((p) => p.errors);
    if (errors.length) {
      console.error(`\n✗ ${errors.length} problema(s). No se escribe nada:`);
      errors.forEach((e) => console.error('  - ' + e));
      process.exit(1);
    }
    plans.forEach((p) => console.log(`\n== ${p.platform} ==\ntraducciones en la fuente: ${p.items.length} · ya revisadas por una persona (no se tocan): ${p.reviewed} · a escribir: ${p.changed.length}`));
    const total = plans.reduce((n, p) => n + p.changed.length, 0);
    if (total === 0) {
      console.log('\n✓ Nada que escribir.');
      return;
    }
    if (!apply) {
      console.log('\nDry-run: nada se escribió. Repite con -- --apply para cargarlas.');
      return;
    }
    await prisma.$transaction(
      async (tx) => {
        for (const p of plans) for (const t of p.changed) await tx.check.update({ where: { id: p.byKey.get(t.checkId)!.id }, data: { titleEs: t.titleEs, remediationEs: t.remediationEs, translationOrigin: 'machine' } });
      },
      { timeout: 120000 },
    );
    console.log(`\n✓ Escritas ${total} traducciones de ${plans.length} plataforma(s) en una sola transacción.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});