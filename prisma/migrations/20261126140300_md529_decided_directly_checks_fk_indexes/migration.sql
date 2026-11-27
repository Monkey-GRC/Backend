-- MD-529 · Segunda revisión: marca explícita de decisión directa, CHECK de coherencia estado/decisión e índices de las FK
-- a personas y a la prueba. ADITIVA: columnas nuevas con default, restricciones e índices; nada existente se borra.
-- Va aparte de 20261126140000 porque esa ya está aplicada en la base dev compartida.

-- `decided_directly` marca la solicitud que quien lleva el control aprobó al crearla (sin paso de decisión aparte).
ALTER TABLE "tenant"."control_level_overrides" ADD COLUMN "decided_directly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tenant"."remediation_plans" ADD COLUMN "decided_directly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD COLUMN "decided_directly" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "tenant"."control_level_overrides"
  ADD CONSTRAINT "control_level_overrides_decision_check" CHECK (("status" = 'pending' AND "decided_by" IS NULL AND "decided_at" IS NULL) OR ("status" <> 'pending' AND "decided_by" IS NOT NULL AND "decided_at" IS NOT NULL)),
  ADD CONSTRAINT "control_level_overrides_decided_directly_check" CHECK (NOT "decided_directly" OR "status" = 'approved');
ALTER TABLE "tenant"."remediation_plans"
  ADD CONSTRAINT "remediation_plans_decision_check" CHECK (("status" = 'pending' AND "decided_by" IS NULL AND "decided_at" IS NULL) OR ("status" <> 'pending' AND "decided_by" IS NOT NULL AND "decided_at" IS NOT NULL)),
  ADD CONSTRAINT "remediation_plans_decided_directly_check" CHECK (NOT "decided_directly" OR "status" = 'approved');
ALTER TABLE "tenant"."requirement_applicability_requests"
  ADD CONSTRAINT "requirement_applicability_requests_decision_check" CHECK (("status" = 'pending' AND "decided_by" IS NULL AND "decided_at" IS NULL) OR ("status" <> 'pending' AND "decided_by" IS NOT NULL AND "decided_at" IS NOT NULL)),
  ADD CONSTRAINT "requirement_applicability_requests_decided_directly_check" CHECK (NOT "decided_directly" OR "status" = 'approved');
ALTER TABLE "tenant"."no_occurrence_declarations"
  ADD CONSTRAINT "no_occurrence_declarations_window_check" CHECK ("window_end" >= "window_start");

-- Índices de las claves foráneas a personas y a la prueba (el borrado de un usuario o de una prueba no recorre la tabla).
CREATE INDEX "control_level_overrides_proposed_by_idx" ON "tenant"."control_level_overrides"("proposed_by");
CREATE INDEX "control_level_overrides_decided_by_idx" ON "tenant"."control_level_overrides"("decided_by");
CREATE INDEX "remediation_plans_assignee_id_idx" ON "tenant"."remediation_plans"("assignee_id");
CREATE INDEX "remediation_plans_proposed_by_idx" ON "tenant"."remediation_plans"("proposed_by");
CREATE INDEX "remediation_plans_decided_by_idx" ON "tenant"."remediation_plans"("decided_by");
CREATE INDEX "remediation_plans_test_id_idx" ON "tenant"."remediation_plans"("test_id");
CREATE INDEX "requirement_applicability_requests_requested_by_idx" ON "tenant"."requirement_applicability_requests"("requested_by");
CREATE INDEX "requirement_applicability_requests_decided_by_idx" ON "tenant"."requirement_applicability_requests"("decided_by");
CREATE INDEX "requirement_occurrences_registered_by_idx" ON "tenant"."requirement_occurrences"("registered_by");
CREATE INDEX "no_occurrence_declarations_declared_by_idx" ON "tenant"."no_occurrence_declarations"("declared_by");
