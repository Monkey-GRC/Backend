-- D110 (MD-211): el catálogo de integraciones. Aditiva: una tabla y un enum nuevos en `catalog`.

-- CreateEnum
CREATE TYPE "catalog"."integration_purpose" AS ENUM ('measurement', 'workflow');

-- CreateTable
CREATE TABLE "catalog"."integrations" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" "catalog"."integration_purpose" NOT NULL,
    "capability_platform_id" UUID,
    "name" TEXT,
    "logo_key" TEXT,
    "availability" "catalog"."framework_availability",
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_code_key" ON "catalog"."integrations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_capability_platform_id_key" ON "catalog"."integrations"("capability_platform_id");

-- AddForeignKey
ALTER TABLE "catalog"."integrations" ADD CONSTRAINT "integrations_capability_platform_id_fkey" FOREIGN KEY ("capability_platform_id") REFERENCES "catalog"."capability_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Un dato, un dueño: con plataforma de conexión, nombre, logo y disponibilidad son los de la plataforma; sin ella, son de la integración.
ALTER TABLE "catalog"."integrations" ADD CONSTRAINT "integrations_single_owner_check" CHECK (
  (capability_platform_id IS NOT NULL AND name IS NULL AND logo_key IS NULL AND availability IS NULL)
  OR
  (capability_platform_id IS NULL AND name IS NOT NULL AND logo_key IS NOT NULL AND availability IS NOT NULL)
);
