"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.APP_DATABASE_URL }),
    });
    const info = await prisma.$queryRaw `
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
//# sourceMappingURL=smoke-db.js.map