// D113 · Guía de corrección de los checks de la sonda de servidores en español → base de datos.
//
//   npm run sonda:translate              # dry-run
//   npm run sonda:translate -- --apply   # escribe, en UNA transacción
//   npm run sonda:translate -- --check   # solo valida los archivos contra el catálogo (sin base de datos)
//
// Lee `data/sonda-es/*.json` (un archivo por política), los VALIDA contra el catálogo (los comandos tienen que aparecer igual en el original: ver `sonda/translations.ts`) y escribe
// `remediation_es` y `translation_origin = 'machine'` (traducción automática, sin revisar). Nunca pisa una traducción que una persona ya revisó (`reviewed`), no toca los títulos,
// no crea ni borra checks y se niega a correr como `monkey_app`. Es idempotente: repetirlo no cambia nada.
import { connectAsOwner } from './db';
import { loadSondaSource, loadTranslationFiles, validateSondaTranslations } from './sonda/translations';

const apply = process.argv.includes('--apply');

async function main() {
  const files = loadTranslationFiles();
  if (files.length === 0) {
    console.log('No hay archivos en data/sonda-es/: nada que cargar.');
    return;
  }
  const source = loadSondaSource();
  const problems = files.flatMap((f) => validateSondaTranslations(f.content, source).map((p) => `${f.file}: ${p}`));
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problema(s) en data/sonda-es. No se escribe nada:`);
    problems.slice(0, 40).forEach((p) => console.error('  - ' + p));
    process.exit(1);
  }
  const items = files.flatMap((f) => f.content.translations.map((t) => ({ policyId: f.content.policyId, ...t })));
  console.log(`Fuente válida: ${items.length} guías en ${files.length} política(s) (${files.map((f) => `${f.content.policyId}: ${f.content.translations.length}`).join(' · ')}).`);
  // `--check`: solo valida (sin base de datos). Sirve mientras se escribe cada tanda.
  if (process.argv.includes('--check')) return;

  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }
    const policyIds = [...new Set(items.map((i) => i.policyId))];
    const db = await prisma.check.findMany({ where: { policyId: { in: policyIds } }, select: { id: true, policyId: true, checkId: true, remediationEs: true, translationOrigin: true } });
    const byKey = new Map(db.map((c) => [`${c.policyId}|${c.checkId}`, c]));

    const missing = items.filter((i) => !byKey.has(`${i.policyId}|${i.checkId}`));
    const reviewed = items.filter((i) => byKey.get(`${i.policyId}|${i.checkId}`)?.translationOrigin === 'reviewed');
    const changed = items.filter((i) => {
      const d = byKey.get(`${i.policyId}|${i.checkId}`);
      return d && d.translationOrigin !== 'reviewed' && d.remediationEs !== i.remediationEs;
    });
    console.log(`\npolíticas: ${policyIds.length} · traducciones en la fuente: ${items.length} · ya revisadas por una persona (no se tocan): ${reviewed.length} · a escribir: ${changed.length}`);
    if (missing.length) console.log(`  ⚠ ${missing.length} no están en la base (¿falta «npm run sonda:load»?), p. ej. ${missing.slice(0, 3).map((m) => `${m.policyId}/${m.checkId}`).join(', ')}`);
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
        for (const t of changed) await tx.check.update({ where: { id: byKey.get(`${t.policyId}|${t.checkId}`)!.id }, data: { remediationEs: t.remediationEs, translationOrigin: 'machine' } });
      },
      { timeout: 300000 },
    );
    console.log(`\n✓ Escritas ${changed.length} guías en una sola transacción.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
