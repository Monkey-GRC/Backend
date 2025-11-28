import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema/",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/infrastructure/prisma/seeds/seed.ts"
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
