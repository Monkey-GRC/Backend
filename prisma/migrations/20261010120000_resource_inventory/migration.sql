-- AlterTable
ALTER TABLE "tenant"."asset_provisionings" ADD COLUMN     "inventory_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenant"."asset_resources" ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'other';
