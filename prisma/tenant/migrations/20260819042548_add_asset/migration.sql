-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SERVER', 'DATABASE', 'CLOUD_RESOURCE', 'NETWORK_DEVICE');

-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('WAZUH_AGENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "mnk_control_checks" ADD COLUMN     "cis_code" TEXT,
ADD COLUMN     "pci_dss_code" TEXT,
ADD COLUMN     "soc2_code" TEXT;

-- CreateTable
CREATE TABLE "mnk_assets" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "type" "AssetType" NOT NULL,
    "source" "AssetSource" NOT NULL DEFAULT 'MANUAL',
    "external_id" TEXT,
    "os" "ChecklistOs",
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnk_assets_seq_key" ON "mnk_assets"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_assets_code_key" ON "mnk_assets"("code");

-- CreateIndex
CREATE INDEX "mnk_assets_seq_idx" ON "mnk_assets"("seq");

-- CreateIndex
CREATE INDEX "mnk_assets_code_idx" ON "mnk_assets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_assets_source_external_id_key" ON "mnk_assets"("source", "external_id");

-- AddForeignKey
ALTER TABLE "mnk_assets" ADD CONSTRAINT "mnk_assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_assets" ADD CONSTRAINT "mnk_assets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
