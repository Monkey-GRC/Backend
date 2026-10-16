-- MD-144 · Exclusiones de un activo en un test: las propone la empresa y las decide el consultor (D78, D79), y vencen al final del período del servicio.
--
-- 1. `exclusions` pasa de la forma vieja (propuesta del consultor, aprobada por la empresa) a la de D78/D79: estado, quién decide, motivo, sustentación técnica,
--    servicio y activo. Nada escribía en esta tabla; si un ambiente tuviera filas, la migración se detiene en vez de adivinar su servicio y su estado.
-- 2. `service_frameworks` recibe el período auditado y la fecha de corte que el modelo ya define (D68, REQ-004). Quién los llena es P26 y sigue abierto: hasta
--    entonces valen NULL, y una exclusión no se puede proponer (409 EVALUATION_NOT_DEFINED).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "tenant"."exclusions") THEN
    RAISE EXCEPTION 'exclusions tiene filas: cambió de quién propone y quién decide (D78); revisarlas a mano antes de migrar';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "tenant"."exclusion_status" AS ENUM ('pending', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "tenant"."exclusions" DROP CONSTRAINT "exclusions_approved_by_fkey";

-- AlterTable
ALTER TABLE "tenant"."exclusions" DROP COLUMN "approved_by",
ADD COLUMN     "asset_id" UUID,
ADD COLUMN     "decided_at" TIMESTAMP(3),
ADD COLUMN     "decided_by" UUID,
ADD COLUMN     "decision_note" TEXT,
ADD COLUMN     "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "service_id" UUID NOT NULL,
ADD COLUMN     "status" "tenant"."exclusion_status" NOT NULL DEFAULT 'pending',
ADD COLUMN     "technical_justification" TEXT,
ADD COLUMN     "valid_from" DATE NOT NULL,
ALTER COLUMN "excluded_check_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."service_frameworks" ADD COLUMN     "cutoff_date" DATE,
ADD COLUMN     "period_end" DATE,
ADD COLUMN     "period_start" DATE;

-- CreateIndex
CREATE INDEX "exclusions_service_id_idx" ON "tenant"."exclusions"("service_id");

-- CreateIndex
CREATE INDEX "exclusions_asset_id_idx" ON "tenant"."exclusions"("asset_id");

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Lo que la base impone (no solo la aplicación): toda exclusión excluye un activo o un check; una decisión trae quién y cuándo, y un rechazo trae su motivo;
-- la vigencia no se invierte; y una sola propuesta pendiente por activo y test.
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_target" CHECK (asset_id IS NOT NULL OR excluded_check_id IS NOT NULL);
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_decision_shape" CHECK (
  (status = 'pending' AND decided_by IS NULL AND decided_at IS NULL)
  OR (status = 'approved' AND decided_by IS NOT NULL AND decided_at IS NOT NULL)
  OR (status = 'rejected' AND decided_by IS NOT NULL AND decided_at IS NOT NULL AND decision_note IS NOT NULL AND length(btrim(decision_note)) > 0)
);
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_validity_order" CHECK (valid_until >= valid_from);
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_justification_present" CHECK (length(btrim(justification)) > 0);
CREATE UNIQUE INDEX "exclusions_one_pending_per_asset_test" ON "tenant"."exclusions"("service_id", "test_id", "asset_id") WHERE status = 'pending' AND asset_id IS NOT NULL;
