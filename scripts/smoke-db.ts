import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.APP_DATABASE_URL }),
  });

  const info = await prisma.$queryRaw`
    select current_user as usuario, current_setting('timezone') as zona
  `;
  const frameworks = await prisma.framework.count();
  const organizations = await prisma.organization.count();

  console.log(info, { frameworks, organizations });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
