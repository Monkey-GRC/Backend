// D90 · Guía de corrección de los checks de nube en español → base de datos.
//
//   npm run cloud:translate              # dry-run
//   npm run cloud:translate -- --apply   # escribe, en UNA transacción
//
// Escribe `title_es`, `remediation_es` y `translation_origin = 'machine'` desde data/cloud-checks-es.json (traducción automática, sin revisar). Nunca pisa una traducción
// que una persona ya revisó (`reviewed`) y solo actualiza lo que cambió. No crea ni borra checks y se niega a correr como `monkey_app`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { connectAsOwner } from './soc2/db';
import { CheckTranslation, validateTranslations } from './cloud/translations';

const apply = process.argv.includes('--apply');

async function main() {
  const items = JSON.parse(readFileSync(resolve('prisma/seed/data/cloud-checks-es.json'), 'utf8')) as CheckTranslation[];
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }
    const dbChecks = await prisma.check.findMany({ where: { platform: 'aws', policyId: 'cloud_configuration' }, select: { id: true, checkId: true, titleEs: true, remediationEs: true, translationOrigin: true } });
    const byKey = new Map(dbChecks.map((c) => [c.checkId, c]));
    const problems = validateTranslations(items, new Set(byKey.keys()));
    if (problems.length) {
      console.error(`\n✗ ${problems.length} problema(s) en data/cloud-checks-es.json. No se escribe nada:`);
      problems.slice(0, 30).forEach((p) => console.error('  - ' + p));
      process.exit(1);
    }
    const reviewed = items.filter((t) => byKey.get(t.checkId)!.translationOrigin === 'reviewed');
    const changed = items.filter((t) => {
      const d = byKey.get(t.checkId)!;
      return d.translationOrigin !== 'reviewed' && (d.titleEs !== t.titleEs || d.remediationEs !== t.remediationEs || d.translationOrigin !== 'machine');
    });
    console.log(`\ntraducciones en la fuente: ${items.length} · ya revisadas por una persona (no se tocan): ${reviewed.length} · a escribir: ${changed.length}`);
    if (changed.length === 0) {
      console.log('\n✓ Nada que escribir.');
      return;
    }
    if (!apply) {
      console.log('\nDry-run: nada se escribió. Repite con -- --apply para cargarlas.');
      return;
    }
    await prisma.$transaction(
      async (tx) => {
        for (const t of changed) await tx.check.update({ where: { id: byKey.get(t.checkId)!.id }, data: { titleEs: t.titleEs, remediationEs: t.remediationEs, translationOrigin: 'machine' } });
      },
      { timeout: 120000 },
    );
    console.log(`\n✓ Escritas ${changed.length} traducciones en una sola transacción.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});