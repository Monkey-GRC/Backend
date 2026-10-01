// Regulaciones (MD-75) y capacidades automáticas ac_01…ac_06 (MD-83) → base de datos.
//
//   npm run reference:load              # dry-run
//   npm run reference:load -- --apply   # escribe, en UNA transacción
//   npm run reference:verify            # solo lectura; sale con código 1 si algo no cuadra
//
// Mismas reglas que el seed de SOC 2: solo inserta lo que falta, aborta con diff si una fila existe con
// contenido distinto, no borra nada y se niega a correr como `monkey_app`.
import { connectAsOwner, short } from './soc2/db';
import { CAPABILITIES, REGULATIONS } from './reference/data';

const apply = process.argv.includes('--apply');
const verify = process.argv.includes('--verify');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${verify ? 'verify' : apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    const regDb = await prisma.regulation.findMany();
    const capDb = await prisma.automatedCapability.findMany();

    const conflicts: string[] = [];
    const regMissing = REGULATIONS.filter((s) => {
      const d = regDb.find((r) => r.code === s.code);
      if (!d) return true;
      for (const f of ['name', 'jurisdiction'] as const) if (d[f] !== s[f]) conflicts.push(`regulación ${s.code}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      return false;
    });
    const capMissing = CAPABILITIES.filter((s) => {
      const d = capDb.find((r) => r.catalogCode === s.catalogCode);
      if (!d) return true;
      for (const f of ['category', 'method', 'provider', 'baseFrequency', 'generatedEvidence', 'supportedPlatforms', 'requiredPermissions'] as const) {
        if (!same(d[f], s[f])) conflicts.push(`capacidad ${s.catalogCode}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      }
      return false;
    });
    const orphans = [
      ...regDb.filter((d) => !REGULATIONS.some((s) => s.code === d.code)).map((d) => `regulación ${d.code} está en la base y no en la fuente`),
      ...capDb.filter((d) => !CAPABILITIES.some((s) => s.catalogCode === d.catalogCode)).map((d) => `capacidad ${d.catalogCode} está en la base y no en la fuente`),
    ];

    console.log('\ntabla                    fuente   a insertar');
    console.log(`regulations              ${String(REGULATIONS.length).padStart(6)}   ${String(regMissing.length).padStart(10)}`);
    console.log(`automated_capabilities   ${String(CAPABILITIES.length).padStart(6)}   ${String(capMissing.length).padStart(10)}`);
    orphans.forEach((m) => console.warn('  ⚠ ' + m + ' (NO se toca)'));
    if (conflicts.length) {
      console.error(`\n✗ ${conflicts.length} fila(s) existen con contenido DISTINTO al de la fuente. No se sobrescribe nada:`);
      conflicts.forEach((m) => console.error('  - ' + m));
      process.exit(1);
    }

    if (verify) {
      const problems = [...regMissing.map((s) => `falta la regulación ${s.code}`), ...capMissing.map((s) => `falta la capacidad ${s.catalogCode}`), ...orphans];
      if (problems.length) {
        problems.forEach((m) => console.error('  ✗ ' + m));
        process.exit(1);
      }
      console.log(`\n  ✓ regulations = ${REGULATIONS.length}, idénticas a la fuente\n  ✓ automated_capabilities = ${CAPABILITIES.length}, idénticas a la fuente`);
      console.log('\n✓ Los catálogos de referencia coinciden con la fuente.');
      return;
    }

    const total = regMissing.length + capMissing.length;
    if (total === 0) {
      console.log('\n✓ La base ya coincide con la fuente. Nada que insertar.');
      return;
    }
    if (!apply) {
      console.log(`\nDry-run: se insertarían ${total} filas. Nada se escribió. Repite con -- --apply para cargarlas.`);
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.regulation.createMany({ data: regMissing.map((r) => ({ ...r })) });
      await tx.automatedCapability.createMany({ data: capMissing.map((c) => ({ ...c })) });
    });
    console.log(`\n✓ Cargadas ${total} filas en una sola transacción. Ejecuta: npm run reference:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
