// Seed de arranque (schema-implementacion.md §9, modelo-datos.md §4.4): la empresa interna de
// Monkey y el primer admin_monkey. Sin ellos no se puede registrar ninguna empresa, porque
// access_keys.created_by es FK obligatoria a users.
//
// Corre con DATABASE_URL (rol dueño, ignora RLS), nunca con el rol de la app. Los datos salen
// del .env para que ningún correo ni contraseña quede en git. Es idempotente: si el admin ya
// existe no lo toca (tampoco su contraseña).
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../generated/prisma/client';
import { REGULATION_SEED } from '../../src/common/catalogs/onboarding-catalogs';
import { meetsPasswordPolicy } from '../../src/common/security/password-policy';
import { CAPABILITY_SEED } from './capabilities';

const required = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Falta ${key} en el .env`);
  return value;
};

async function main() {
  const companyName = required('SEED_MONKEY_COMPANY_NAME');
  const companyEmail = required('SEED_MONKEY_COMPANY_EMAIL').toLowerCase();
  const adminEmail = required('SEED_ADMIN_EMAIL').toLowerCase();
  const adminName = required('SEED_ADMIN_NAME');
  const adminLastName = required('SEED_ADMIN_LAST_NAME');
  const adminPassword = required('SEED_ADMIN_PASSWORD');

  if (!meetsPasswordPolicy(adminPassword)) {
    throw new Error(
      'SEED_ADMIN_PASSWORD no cumple la política: 12+ caracteres con mayúscula, minúscula, número y símbolo',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: required('DATABASE_URL') }),
  });

  try {
    // Catálogo de regulaciones (Componente 1 del onboarding). No se puntúa (D10). Idempotente:
    // agrega las que faltan y respeta cualquier ajuste posterior de nombre o jurisdicción.
    for (const regulation of REGULATION_SEED) {
      await prisma.regulation.upsert({
        where: { code: regulation.code },
        update: {},
        create: regulation,
      });
    }
    console.log(`Regulaciones sembradas: ${REGULATION_SEED.length}`);

    // Capacidades automáticas ac_01 a ac_06 (Componente 3). Idempotente y sin pisar ajustes.
    for (const capability of CAPABILITY_SEED) {
      await prisma.automatedCapability.upsert({
        where: { catalogCode: capability.catalogCode },
        update: {},
        create: capability,
      });
    }
    console.log(`Capacidades automáticas sembradas: ${CAPABILITY_SEED.length}`);

    await prisma.$transaction(async (tx) => {
      let company = await tx.company.findFirst({
        where: { name: companyName, adminEmail: companyEmail },
      });
      if (!company) {
        company = await tx.company.create({
          data: { name: companyName, adminEmail: companyEmail, isolationStrategy: 'shared' },
        });
        console.log(`Empresa interna creada: ${company.name} (${company.id})`);
      } else {
        console.log(`Empresa interna ya existía: ${company.name} (${company.id})`);
      }

      const existing = await tx.user.findUnique({ where: { email: adminEmail } });
      if (existing) {
        if (existing.companyId !== company.id || existing.role !== 'admin_monkey') {
          throw new Error(
            `${adminEmail} ya existe pero no es admin_monkey de ${companyName}; no se modifica`,
          );
        }
        console.log(`admin_monkey ya existía: ${adminEmail} (no se cambia su contraseña)`);
        return;
      }

      const admin = await tx.user.create({
        data: {
          companyId: company.id,
          email: adminEmail,
          name: adminName,
          lastName: adminLastName,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: 'admin_monkey',
          status: 'active',
        },
      });
      console.log(`admin_monkey creado: ${admin.email} (${admin.id})`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: Error) => {
  console.error(`Seed falló: ${error.message}`);
  process.exit(1);
});
