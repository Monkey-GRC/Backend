-- El catálogo de políticas de la sonda se vuelve la fuente de las versiones que se ofrecen al cliente (D113). Aditiva: columnas nuevas y anulables (o con valor
-- por defecto) sobre `catalog.sca_policies`, que hoy está vacía.

-- AlterTable
ALTER TABLE "catalog"."sca_policies" ADD COLUMN     "distribution" TEXT,
ADD COLUMN     "distribution_name" TEXT,
ADD COLUMN     "is_offerable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "os_code" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "version_code" TEXT,
ADD COLUMN     "version_label" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sca_policies_version_code_key" ON "catalog"."sca_policies"("version_code");

-- CreateIndex
CREATE INDEX "sca_policies_os_code_is_offerable_idx" ON "catalog"."sca_policies"("os_code", "is_offerable");
