// Seed de arranque: la empresa interna de Monkey y el primer `admin_monkey`.
//
// Sin esto no se puede crear la primera clave de acceso (`access_keys.created_by` es FK obligatoria a
// `users`) y nadie puede registrar un tenant. Es el único usuario que no nace de una clave de acceso.
//
//   BOOTSTRAP_ADMIN_EMAIL=... BOOTSTRAP_ADMIN_PASSWORD=... BOOTSTRAP_ADMIN_NAME=... BOOTSTRAP_ADMIN_LAST_NAME=... \
//     npm run bootstrap:admin              # dry-run
//   ... npm run bootstrap:admin -- --apply # crea la empresa y el usuario, en UNA transacción
//
// La contraseña llega SOLO por variable de entorno: no se pasa como argumento (queda en el historial del
// shell), no se imprime y no se guarda en ningún archivo. Se cumple la política de modelo-datos.md §5.3
// (12+ caracteres con mayúscula, minúscula, número y símbolo) y se guarda con bcrypt.
// Idempotente: si ya existe un `admin_monkey` no hace nada y no toca al existente. Usa el rol dueño.
import bcrypt from 'bcrypt';
import { connectAsOwner } from './soc2/db';
import { passwordProblems } from './bootstrap/password';

const apply = process.argv.includes('--apply');
const BCRYPT_COST = 12;

async function main() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';
  const name = (process.env.BOOTSTRAP_ADMIN_NAME ?? '').trim();
  const lastName = (process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? '').trim();
  const companyName = (process.env.BOOTSTRAP_COMPANY_NAME ?? 'Monkey').trim();

  const missing = Object.entries({ BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_NAME: name, BOOTSTRAP_ADMIN_LAST_NAME: lastName })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error(`✗ Faltan variables de entorno: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('✗ BOOTSTRAP_ADMIN_EMAIL no es un correo válido.');
    process.exit(1);
  }
  const problems = passwordProblems(password);
  if (problems.length) {
    console.error(`✗ La contraseña no cumple la política (§5.3): ${problems.join('; ')}.`);
    process.exit(1);
  }

  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    const existing = await prisma.user.findFirst({ where: { role: 'admin_monkey' }, select: { email: true } });
    if (existing) {
      console.log(`✓ Ya existe un admin_monkey (${existing.email}). Nada que hacer.`);
      return;
    }
    const emailTaken = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    if (emailTaken) {
      console.error(`✗ El correo ${email} ya pertenece a un usuario con rol ${emailTaken.role}; no se convierte en admin_monkey.`);
      process.exit(1);
    }

    console.log(`\nSe crearía: la empresa interna "${companyName}" (shared) y el admin_monkey ${email}.`);
    if (!apply) {
      console.log('Dry-run: nada se escribió. Repite con -- --apply.');
      return;
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    await prisma.$transaction(async (tx) => {
      const company = (await tx.company.findFirst({ where: { name: companyName, adminEmail: email } })) ?? (await tx.company.create({ data: { name: companyName, adminEmail: email, isolationStrategy: 'shared' } }));
      await tx.user.create({ data: { companyId: company.id, email, name, lastName, passwordHash, role: 'admin_monkey' } });
    });
    console.log('\n✓ Creados la empresa interna y el admin_monkey. Cambia la contraseña en el primer acceso.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Error inesperado'); // nunca el objeto completo: podría arrastrar el hash
  process.exit(1);
});
