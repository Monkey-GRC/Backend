-- MD-500, D145, D148 · Los períodos auditados salen de service_frameworks a su propia tabla (uno por fila, con histórico) y el control del cliente guarda su cambio de periodicidad (D147).

-- CreateEnum
CREATE TYPE "tenant"."evaluation_period_status" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "tenant"."evaluation_period_origin" AS ENUM ('user', 'system');

-- CreateTable
CREATE TABLE "tenant"."service_framework_periods" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_framework_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "cutoff_date" DATE,
    "status" "tenant"."evaluation_period_status" NOT NULL DEFAULT 'open',
    "opened_by" "tenant"."evaluation_period_origin" NOT NULL DEFAULT 'user',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_framework_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_framework_periods_tenant_id_idx" ON "tenant"."service_framework_periods"("tenant_id");

-- CreateIndex
CREATE INDEX "service_framework_periods_service_framework_id_idx" ON "tenant"."service_framework_periods"("service_framework_id");

-- Como mucho un período abierto por servicio × marco (D148).
CREATE UNIQUE INDEX "service_framework_periods_one_open_key" ON "tenant"."service_framework_periods"("service_framework_id") WHERE "status" = 'open';

-- AddForeignKey
ALTER TABLE "tenant"."service_framework_periods" ADD CONSTRAINT "service_framework_periods_service_framework_id_fkey" FOREIGN KEY ("service_framework_id") REFERENCES "tenant"."service_frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_framework_periods" ADD CONSTRAINT "service_framework_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Lo declarado hasta hoy pasa a ser el período abierto, declarado por una persona.
INSERT INTO "tenant"."service_framework_periods" ("id", "tenant_id", "service_framework_id", "period_start", "period_end", "cutoff_date", "status", "opened_by")
SELECT gen_random_uuid(), sf."tenant_id", sf."id", sf."period_start", sf."period_end", sf."cutoff_date", 'open', 'user'
  FROM "tenant"."service_frameworks" sf
 WHERE sf."period_start" IS NOT NULL AND sf."period_end" IS NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."service_frameworks" DROP COLUMN "period_start", DROP COLUMN "period_end", DROP COLUMN "cutoff_date";

-- AlterTable
ALTER TABLE "tenant"."client_controls" ADD COLUMN "periodicity_justification" TEXT, ADD COLUMN "periodicity_changed_at" TIMESTAMP(3), ADD COLUMN "periodicity_changed_by" UUID;
