-- D121 · Veredicto en dos niveles (MD-194, §7.4b): `test_verdicts` (el veredicto de una prueba manual no documental, inmutable) y `test_verdict_reviews` (una revisión por rol,
-- con las mismas dos funciones de D102: `responsable` dueño y `admin_empresa`; reutiliza el enum `evidence_reviewer_role`). El estado se deriva, no se guarda.
-- Las evaluaciones manuales que ya existían (una fila por control, activo y veredicto) se migran como UN veredicto aprobado por quien lo dio (no hay empresas reales, D102).
-- Las filas de `evaluations` quedan (son inmutables); el motor deja de leer las de origen `manual`.
-- Reversa: DROP TABLE tenant.test_verdict_reviews, tenant.test_verdicts; DROP TYPE tenant.verdict_review_decision, tenant.verdict_result (los veredictos nuevos se pierden; los migrados siguen en `evaluations`).
-- Solo el schema y los datos; RLS, inmutabilidad y permisos van aparte (20261117000200_rls_test_verdicts).

-- CreateEnum
CREATE TYPE "tenant"."verdict_result" AS ENUM ('compliant', 'non_compliant');

-- CreateEnum
CREATE TYPE "tenant"."verdict_review_decision" AS ENUM ('approve', 'reject');

-- CreateTable
CREATE TABLE "tenant"."test_verdicts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "result" "tenant"."verdict_result" NOT NULL,
    "note" TEXT,
    "closure_observation_reason" TEXT,
    "registered_by" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_verdicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."test_verdict_reviews" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "test_verdict_id" UUID NOT NULL,
    "reviewer_role" "tenant"."evidence_reviewer_role" NOT NULL,
    "decision" "tenant"."verdict_review_decision" NOT NULL,
    "note" TEXT,
    "reviewed_by" UUID NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_verdict_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_verdicts_tenant_id_idx" ON "tenant"."test_verdicts"("tenant_id");

-- CreateIndex
CREATE INDEX "test_verdicts_service_id_test_id_registered_at_idx" ON "tenant"."test_verdicts"("service_id", "test_id", "registered_at");

-- CreateIndex
CREATE INDEX "test_verdicts_client_control_id_idx" ON "tenant"."test_verdicts"("client_control_id");

-- CreateIndex
CREATE INDEX "test_verdicts_registered_by_idx" ON "tenant"."test_verdicts"("registered_by");

-- CreateIndex
CREATE INDEX "test_verdict_reviews_tenant_id_idx" ON "tenant"."test_verdict_reviews"("tenant_id");

-- CreateIndex
CREATE INDEX "test_verdict_reviews_reviewed_by_idx" ON "tenant"."test_verdict_reviews"("reviewed_by");

-- CreateIndex
CREATE UNIQUE INDEX "test_verdict_reviews_test_verdict_id_reviewer_role_key" ON "tenant"."test_verdict_reviews"("test_verdict_id", "reviewer_role");

-- AddForeignKey
ALTER TABLE "tenant"."test_verdicts" ADD CONSTRAINT "test_verdicts_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdicts" ADD CONSTRAINT "test_verdicts_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdicts" ADD CONSTRAINT "test_verdicts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdicts" ADD CONSTRAINT "test_verdicts_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdicts" ADD CONSTRAINT "test_verdicts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdict_reviews" ADD CONSTRAINT "test_verdict_reviews_test_verdict_id_fkey" FOREIGN KEY ("test_verdict_id") REFERENCES "tenant"."test_verdicts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdict_reviews" ADD CONSTRAINT "test_verdict_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."test_verdict_reviews" ADD CONSTRAINT "test_verdict_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- MigrateData: un veredicto aprobado por cada (servicio, test, instante, quien lo confirmó). El control de origen es uno cualquiera de los que lo compartían.
WITH manual AS (
  SELECT DISTINCT ON (service_id, test_id, evaluated_at, confirmed_by)
         id, tenant_id, service_id, client_control_id, test_id, result, verdict_note, closure_observation_reason, confirmed_by, evaluated_at
    FROM "tenant"."evaluations"
   WHERE origin = 'manual' AND confirmed_by IS NOT NULL AND result IN ('compliant', 'non_compliant')
   ORDER BY service_id, test_id, evaluated_at, confirmed_by, client_control_id, id
), inserted AS (
  INSERT INTO "tenant"."test_verdicts" (id, tenant_id, service_id, client_control_id, test_id, result, note, closure_observation_reason, registered_by, registered_at)
  SELECT gen_random_uuid(), tenant_id, service_id, client_control_id, test_id, result::text::"tenant"."verdict_result", verdict_note, closure_observation_reason, confirmed_by, evaluated_at
    FROM manual
  RETURNING id, tenant_id, registered_by, registered_at
)
INSERT INTO "tenant"."test_verdict_reviews" (id, tenant_id, test_verdict_id, reviewer_role, decision, note, reviewed_by, reviewed_at)
SELECT gen_random_uuid(), tenant_id, id, 'admin_empresa', 'approve', NULL, registered_by, registered_at FROM inserted;
