import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/central/schema/",
  migrations: {
    path: "prisma/central/migrations",
    seed: "tsx src/infrastructure/database/seeds/central-seed.ts"
  },
  datasource: {
    url: env("CENTRAL_DATABASE_URL"),
    shadowDatabaseUrl: env("CENTRAL_SHADOW_DATABASE_URL"),
  },
});
