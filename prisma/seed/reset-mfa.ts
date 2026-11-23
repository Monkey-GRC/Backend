// Quita el segundo factor a una cuenta (D94): para quien perdió el celular Y los códigos de recuperación y no tiene quién se lo restablezca por la aplicación.
// Es lo que Monkey le hace al administrador de una empresa (la aplicación solo deja a un administrador restablecer a su propio equipo).
//
//   MFA_RESET_EMAIL=ana@empresa.com npm run mfa:reset              # dry-run: dice a quién y qué haría
//   MFA_RESET_EMAIL=ana@empresa.com npm run mfa:reset -- --apply   # lo hace, en UNA transacción, con su rastro de auditoría
//
// Borra el secreto y los códigos de recuperación, cierra todas sus sesiones y anula sus desafíos abiertos; en su próximo ingreso la persona configura el segundo factor
// de nuevo. Usa el rol dueño (DATABASE_URL). Antes de aplicarlo, Monkey debe comprobar por otro canal que quien lo pide es quien dice ser.
import { connectAsOwner } from './db';

const apply = process.argv.includes('--apply');

async function main() {
  const email = (process.env.MFA_RESET_EMAIL ?? '').trim().toLowerCase();
  if (!email) {
    console.error('✗ Falta la variable de entorno MFA_RESET_EMAIL.');
    process.exit(1);
  }

  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: este comando usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, companyId: true, role: true, status: true, isMfaEnabled: true, company: { select: { name: true } } },
    });
    if (!user) {
      console.error(`✗ No existe una cuenta con el correo ${email}.`);
      process.exit(1);
    }
    console.log(`\nCuenta: ${email} · ${user.role} · ${user.company.name} · ${user.status} · segundo factor ${user.isMfaEnabled ? 'ACTIVO' : 'sin activar'}`);
    if (!user.isMfaEnabled) {
      console.log('Nada que hacer: esa cuenta no tiene segundo factor.');
      return;
    }
    const sessions = await prisma.session.count({ where: { userId: user.id, revokedAt: null } });
    console.log(`Se borraría su secreto y sus códigos de recuperación, y se cerrarían ${sessions} sesión(es) abiertas.`);
    if (!apply) {
      console.log('Dry-run: nada se escribió. Repite con -- --apply.');
      return;
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { isMfaEnabled: false, mfaSecretEncrypted: null, mfaLastUsedStep: null } });
      await tx.userRecoveryCode.deleteMany({ where: { userId: user.id } });
      await tx.mfaChallenge.updateMany({ where: { userId: user.id, consumedAt: null }, data: { consumedAt: now } });
      const closed = await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
      // D123 · Sin segundo factor no hay dispositivos recordados: se olvidan en la misma transacción.
      await tx.trustedDevice.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
      await tx.auditLog.createMany({
        data: [
          {
            tenantId: user.companyId,
            userId: null,
            action: 'auth.mfa_reset',
            resource: 'user',
            result: 'success',
            ipAddress: 'cli',
            userAgent: 'npm run mfa:reset',
            afterState: { user_id: user.id, sessions_closed: closed.count, via: 'script' },
          },
        ],
      });
    });
    console.log('✓ Segundo factor quitado. La persona lo configurará de nuevo en su próximo ingreso.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
