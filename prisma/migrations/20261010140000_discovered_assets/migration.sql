-- AlterTable
ALTER TABLE "tenant"."assets" ADD COLUMN     "parent_asset_id" UUID,
ADD COLUMN     "resource_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "assets_resource_id_key" ON "tenant"."assets"("resource_id");

-- CreateIndex
CREATE INDEX "assets_parent_asset_id_idx" ON "tenant"."assets"("parent_asset_id");

-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_parent_asset_id_fkey" FOREIGN KEY ("parent_asset_id") REFERENCES "tenant"."assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "tenant"."asset_resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

