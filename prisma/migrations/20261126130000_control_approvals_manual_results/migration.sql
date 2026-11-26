-- MD-504 (RC-07 núcleo, D132, D140 puntos 1 y 2) · `control_approvals` (aprobación del responsable, aprobación final del admin_empresa y devolución con motivo), `manual_test_results`
-- (el resultado de una prueba manual en un control) y la marca de entrega devuelta en la evidencia. ADITIVA: tablas nuevas y una columna nullable; las tablas v1 (`test_verdicts`,
-- `evidence_reviews`) quedan sin uso y no se tocan (DT). Reversa: borrar la columna `evidence_submissions.returned_approval_id`, las dos tablas y los tres tipos.
-- RLS, inmutabilidad y permisos van aparte (20261126130100).

-- CreateEnum
CREATE TYPE "tenant"."control_approval_step" AS ENUM ('owner', 'final');
CREATE TYPE "tenant"."control_approval_decision" AS ENUM ('approved', 'returned');
CREATE TYPE "tenant"."manual_test_result_value" AS ENUM ('correct', 'observation', 'exception');

-- CreateTable
CREATE TABLE "tenant"."control_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "step" "tenant"."control_approval_step" NOT NULL,
    "decision" "tenant"."control_approval_decision" NOT NULL,
    "reason" TEXT,
    "actor_id" UUID NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "window_start" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),

    CONSTRAINT "control_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenant"."manual_test_results" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "result" "tenant"."manual_test_result_value" NOT NULL,
    "note" TEXT,
    "registered_by" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_test_results_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "tenant"."evidence_submissions" ADD COLUMN "returned_approval_id" UUID;

-- CreateIndex
CREATE INDEX "control_approvals_tenant_id_idx" ON "tenant"."control_approvals"("tenant_id");
CREATE INDEX "control_approvals_client_control_id_at_idx" ON "tenant"."control_approvals"("client_control_id", "at" DESC);
CREATE INDEX "control_approvals_actor_id_idx" ON "tenant"."control_approvals"("actor_id");
CREATE INDEX "manual_test_results_tenant_id_idx" ON "tenant"."manual_test_results"("tenant_id");
CREATE INDEX "manual_test_results_client_control_id_test_id_registered_at_idx" ON "tenant"."manual_test_results"("client_control_id", "test_id", "registered_at" DESC);
CREATE INDEX "manual_test_results_test_id_idx" ON "tenant"."manual_test_results"("test_id");
CREATE INDEX "manual_test_results_registered_by_idx" ON "tenant"."manual_test_results"("registered_by");
CREATE INDEX "evidence_submissions_returned_approval_id_idx" ON "tenant"."evidence_submissions"("returned_approval_id");

-- AddForeignKey
ALTER TABLE "tenant"."control_approvals" ADD CONSTRAINT "control_approvals_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."control_approvals" ADD CONSTRAINT "control_approvals_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."control_approvals" ADD CONSTRAINT "control_approvals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."manual_test_results" ADD CONSTRAINT "manual_test_results_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."manual_test_results" ADD CONSTRAINT "manual_test_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."manual_test_results" ADD CONSTRAINT "manual_test_results_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."manual_test_results" ADD CONSTRAINT "manual_test_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_returned_approval_id_fkey" FOREIGN KEY ("returned_approval_id") REFERENCES "tenant"."control_approvals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
