-- D53, D56: modelo de control técnico para la nube. Recurso hijo del activo, procedencia de los mapeos, canal y regiones de la conexión.
-- Solo cambio de schema; el RLS de asset_resources va en la migración siguiente (schema-implementacion.md §7).

-- CreateEnum
CREATE TYPE "catalog"."mapping_provenance" AS ENUM ('engine_native', 'monkey_proposed', 'committee_ratified');

-- CreateEnum
CREATE TYPE "tenant"."connection_method" AS ENUM ('agent', 'readonly_role', 'access_keys');

-- AlterEnum
ALTER TYPE "catalog"."check_origin" ADD VALUE 'engine_native';

-- AlterTable
ALTER TABLE "catalog"."check_mappings" ADD COLUMN     "provenance" "catalog"."mapping_provenance" NOT NULL DEFAULT 'engine_native';

-- AlterTable
ALTER TABLE "catalog"."checks" ADD COLUMN     "categories" JSONB,
ADD COLUMN     "engine_severity" TEXT,
ADD COLUMN     "resource_type" TEXT,
ADD COLUMN     "service_name" TEXT,
ALTER COLUMN "title_es" DROP NOT NULL,
ALTER COLUMN "verification_rule" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."test_checks" ADD COLUMN     "confidence" "catalog"."mapping_confidence",
ADD COLUMN     "provenance" "catalog"."mapping_provenance" NOT NULL DEFAULT 'monkey_proposed',
ADD COLUMN     "rationale" TEXT;

-- AlterTable
ALTER TABLE "tenant"."asset_provisionings" ADD COLUMN     "connection_method" "tenant"."connection_method",
ADD COLUMN     "regions" TEXT[];

-- AlterTable
ALTER TABLE "tenant"."assets" ADD COLUMN     "external_account_id" TEXT;

-- AlterTable
ALTER TABLE "tenant"."check_results" ADD COLUMN     "asset_resource_id" UUID,
ADD COLUMN     "engine_severity" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "status_detail" TEXT;

-- AlterTable
ALTER TABLE "tenant"."executions" ADD COLUMN     "checks_executed" INTEGER,
ADD COLUMN     "engine_version" TEXT,
ADD COLUMN     "regions" TEXT[];

-- CreateTable
CREATE TABLE "tenant"."asset_resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "resource_uid" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "name" TEXT,
    "region" TEXT,
    "first_seen_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_resources_tenant_id_idx" ON "tenant"."asset_resources"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_resources_asset_id_resource_uid_key" ON "tenant"."asset_resources"("asset_id", "resource_uid");

-- CreateIndex
CREATE INDEX "check_mappings_framework_code_requirement_code_idx" ON "catalog"."check_mappings"("framework_code", "requirement_code");

-- CreateIndex
CREATE UNIQUE INDEX "check_mappings_check_id_framework_code_framework_version_re_key" ON "catalog"."check_mappings"("check_id", "framework_code", "framework_version", "requirement_code");

-- CreateIndex
CREATE INDEX "check_results_asset_resource_id_idx" ON "tenant"."check_results"("asset_resource_id");

-- AddForeignKey
ALTER TABLE "tenant"."check_results" ADD CONSTRAINT "check_results_asset_resource_id_fkey" FOREIGN KEY ("asset_resource_id") REFERENCES "tenant"."asset_resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_resources" ADD CONSTRAINT "asset_resources_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_resources" ADD CONSTRAINT "asset_resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
