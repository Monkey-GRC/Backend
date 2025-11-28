import { PrismaPg } from '@prisma/adapter-pg'

// Importar seeds individuales
import { seedUsers } from './user.seed'
import { PrismaClient } from 'generated/prisma/client'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL no está definida")

  // Conectar con PG
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
  });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Ejecutando seeds...")

  // Ejecutar seeds en orden
  await seedUsers(prisma)

  console.log("🌱 Seeds completados.")

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
