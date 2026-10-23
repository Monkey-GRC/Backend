-- D88 · Una prueba documental se valida en su control, con la evidencia de ESE control.
--
-- 1. `test_id` (nulo) en `evidence_requirements` y en `control_evidence_templates`: la prueba documental a la que sirve el documento. Nulo = compartido con todas las pruebas
--    documentales del control (así llegan las 89 asignaciones del Excel, que no dicen a cuál sirve cada una; DT-76). Que la prueba sea documental y esté en el control lo
--    comprueba la aplicación (la base no puede mirar otra tabla en un CHECK).
-- 2. `evidence_reviews` (MD-127, D84): una fila por entrega y por rol (consultor, auditor) con los seis atributos y la validación humana. `ai_prevalidated` no se guarda: se deriva.
--    De la revisión del consultor sale el estado de la evidencia y, con él, el de la prueba documental en su control.

-- CreateEnum
CREATE TYPE "tenant"."evidence_reviewer_role" AS ENUM ('consultor', 'auditor');

-- CreateEnum
CREATE TYPE "tenant"."evidence_review" AS ENUM ('pending_review', 'human_validated');

-- AlterTable
ALTER TABLE "catalog"."control_evidence_templates" ADD COLUMN     "test_id" UUID;

-- AlterTable
ALTER TABLE "tenant"."evidence_requirements" ADD COLUMN     "test_id" UUID;

-- CreateTable
CREATE TABLE "tenant"."evidence_reviews" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "evidence_submission_id" UUID NOT NULL,
    "reviewer_role" "tenant"."evidence_reviewer_role" NOT NULL,
    "reviewed_by" UUID NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_ok" BOOLEAN,
    "period_ok" BOOLEAN,
    "valid_ok" BOOLEAN,
    "approved_ok" BOOLEAN,
    "signed_ok" BOOLEAN,
    "content_ok" BOOLEAN,
    "review" "tenant"."evidence_review" NOT NULL DEFAULT 'pending_review',
    "note" TEXT,

    CONSTRAINT "evidence_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidence_reviews_tenant_id_idx" ON "tenant"."evidence_reviews"("tenant_id");

-- CreateIndex
CREATE INDEX "evidence_reviews_reviewed_by_idx" ON "tenant"."evidence_reviews"("reviewed_by");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_reviews_evidence_submission_id_reviewer_role_key" ON "tenant"."evidence_reviews"("evidence_submission_id", "reviewer_role");

-- CreateIndex
CREATE INDEX "control_evidence_templates_test_id_idx" ON "catalog"."control_evidence_templates"("test_id");

-- CreateIndex
CREATE INDEX "evidence_requirements_test_id_idx" ON "tenant"."evidence_requirements"("test_id");

-- AddForeignKey
ALTER TABLE "catalog"."control_evidence_templates" ADD CONSTRAINT "control_evidence_templates_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_requirements" ADD CONSTRAINT "evidence_requirements_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_reviews" ADD CONSTRAINT "evidence_reviews_evidence_submission_id_fkey" FOREIGN KEY ("evidence_submission_id") REFERENCES "tenant"."evidence_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_reviews" ADD CONSTRAINT "evidence_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_reviews" ADD CONSTRAINT "evidence_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Una revisión no se borra: es parte del rastro de quién juzgó qué (D84). La aplicación la inserta y la reemplaza (UPDATE), nunca la borra.
REVOKE DELETE ON "tenant"."evidence_reviews" FROM monkey_app;
