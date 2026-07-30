import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/tenant/schema/",
  migrations: {
    path: "prisma/tenant/migrations",
  },
  datasource: {
    url: env("TENANT_MIGRATION_DATABASE_URL"),
    shadowDatabaseUrl: env("TENANT_MIGRATION_SHADOW_DATABASE_URL"),
  },
});
