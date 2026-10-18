-- MD-126 · D84 · La empresa solo APORTA la evidencia: nadie en la empresa la aprueba ni la rechaza. La revisan el consultor y el auditor (MD-127).
-- Se retiran la aprobación de la empresa y su estado, se guarda cuándo se subió cada entrega y se impide pisar una versión.
ALTER TABLE "tenant"."evidence_submissions" DROP CONSTRAINT "evidence_submissions_approved_by_fkey";
ALTER TABLE "tenant"."evidence_submissions" DROP COLUMN "approved_by", DROP COLUMN "validation_status";
DROP TYPE "tenant"."evidence_validation_status";

ALTER TABLE "tenant"."evidence_submissions" ADD COLUMN "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- La versión crece de uno en uno por requerimiento; el índice impide que dos subidas a la vez se queden con la misma.
CREATE UNIQUE INDEX "evidence_submissions_evidence_requirement_id_version_key" ON "tenant"."evidence_submissions"("evidence_requirement_id", "version");

-- Una entrega es histórico: una versión nueva nunca pisa ni borra la anterior (C1, RN-04). La app solo inserta y lee.
REVOKE UPDATE, DELETE ON "tenant"."evidence_submissions" FROM monkey_app;
