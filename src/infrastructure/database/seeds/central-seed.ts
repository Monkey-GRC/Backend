import { PrismaPg } from '@prisma/adapter-pg'

// Importar seeds individuales
import { seedUsers } from './user.seed'
import { PrismaClient } from 'generated/prisma-central/client'

async function main() {
  const connectionString = process.env.CENTRAL_DATABASE_URL
  if (!connectionString) throw new Error("CENTRAL_DATABASE_URL no está definida")

  // Conectar con PG
  const adapter = new PrismaPg({
    connectionString,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Ejecutando seeds de la DB central...")

  // Ejecutar seeds en orden
  await seedUsers(prisma)

  console.log("🌱 Seeds completados.")

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
