import * as bcrypt from 'bcrypt'
import { PrismaClient, Role } from 'generated/prisma/client'

export async function seedUsers(prisma: PrismaClient) {
  console.log("➡️ Insertando usuarios...")

  const users = [
    {
      email: 'jannergonpa.10@gmail.com',
      username: 'janner-gp',
      password: 'Janner2002+',
      name: 'Janner',
      last_name: 'Gonzalez',
      role: Role.MONKEY_ADMIN,
      is_active: true,
      created_by: 'seed_script',
    },
    {
      email: 'sergio011304@gmail.com',
      username: 'sergio-lema',
      password: 'Sergio2003+',
      name: 'Sergio',
      last_name: 'Lema',
      role: Role.MONKEY_ADMIN,
      is_active: true,
      created_by: 'seed_script',
    },
  ]

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10)

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hashed }
    })
  }

  console.log("✔️ Usuarios seed completado")
}
