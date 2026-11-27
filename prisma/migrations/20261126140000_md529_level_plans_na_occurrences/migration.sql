-- MD-529 (D135, D140 puntos 3 y 4, D131 punto 3) · Corrección del nivel (R5), plan de remediación por excepción, solicitud de «No aplica» de un requisito, ocurrencias de los requisitos
-- «cuando sea requerido» y su declaración trimestral de «sin ocurrencias». ADITIVA: enum y tablas nuevas y una columna nullable en `evidence_submissions`; nada existente se toca.
-- Reversa: borrar la columna `evidence_submissions.requirement_occurrence_id`, las cinco tablas y el enum. RLS y permisos van aparte (20261126140100).

CREATE TYPE "tenant"."change_request_status" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "tenant"."control_level_overrides" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "suggested_level" SMALLINT NOT NULL,
    "proposed_level" SMALLINT NOT NULL,
    "justification" TEXT NOT NULL,
    "status" "tenant"."change_request_status" NOT NULL DEFAULT 'pending',
    "proposed_by" UUID NOT NULL,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_by" UUID,
    "decided_at" TIMESTAMP(3),
    "decision_reason" TEXT,
    "window_start" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),
    CONSTRAINT "control_level_overrides_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "control_level_overrides_levels_check" CHECK ("suggested_level" BETWEEN 0 AND 5 AND "proposed_level" BETWEEN 1 AND 5),
    CONSTRAINT "control_level_overrides_justification_check" CHECK (length(btrim("justification")) > 0)
);

CREATE TABLE "tenant"."remediation_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "client_control_requirement_id" UUID,
    "what" TEXT NOT NULL,
    "assignee_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "tenant"."change_request_status" NOT NULL DEFAULT 'pending',
    "proposed_by" UUID NOT NULL,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_by" UUID,
    "decided_at" TIMESTAMP(3),
    "decision_reason" TEXT,
    "window_start" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),
    CONSTRAINT "remediation_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "remediation_plans_what_check" CHECK (length(btrim("what")) > 0)
);

CREATE TABLE "tenant"."requirement_applicability_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_requirement_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "tenant"."change_request_status" NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_by" UUID,
    "decided_at" TIMESTAMP(3),
    "decision_reason" TEXT,
    "reverted_by" UUID,
    "reverted_at" TIMESTAMP(3),
    "revert_reason" TEXT,
    CONSTRAINT "requirement_applicability_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "requirement_applicability_requests_reason_check" CHECK (length(btrim("reason")) > 0)
);

CREATE TABLE "tenant"."requirement_occurrences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_requirement_id" UUID NOT NULL,
    "occurred_on" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "registered_by" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "requirement_occurrences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "requirement_occurrences_description_check" CHECK (length(btrim("description")) > 0)
);

CREATE TABLE "tenant"."no_occurrence_declarations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_requirement_id" UUID NOT NULL,
    "window_start" DATE NOT NULL,
    "window_end" DATE NOT NULL,
    "note" TEXT,
    "declared_by" UUID NOT NULL,
    "declared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invalidated_at" TIMESTAMP(3),
    CONSTRAINT "no_occurrence_declarations_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tenant"."evidence_submissions" ADD COLUMN "requirement_occurrence_id" UUID;

-- Índices. Los únicos parciales sostienen las reglas «una pendiente por…» aunque dos peticiones lleguen a la vez.
CREATE INDEX "control_level_overrides_tenant_id_idx" ON "tenant"."control_level_overrides"("tenant_id");
CREATE INDEX "control_level_overrides_control_idx" ON "tenant"."control_level_overrides"("client_control_id", "proposed_at" DESC);
CREATE UNIQUE INDEX "control_level_overrides_one_pending" ON "tenant"."control_level_overrides"("client_control_id") WHERE "status" = 'pending' AND "invalidated_at" IS NULL;
CREATE INDEX "remediation_plans_tenant_id_idx" ON "tenant"."remediation_plans"("tenant_id");
CREATE INDEX "remediation_plans_control_idx" ON "tenant"."remediation_plans"("client_control_id", "proposed_at" DESC);
CREATE UNIQUE INDEX "remediation_plans_one_live" ON "tenant"."remediation_plans"("client_control_id", "test_id") WHERE "status" IN ('pending', 'approved') AND "invalidated_at" IS NULL;
CREATE INDEX "requirement_applicability_requests_tenant_id_idx" ON "tenant"."requirement_applicability_requests"("tenant_id");
CREATE INDEX "requirement_applicability_requests_req_idx" ON "tenant"."requirement_applicability_requests"("client_control_requirement_id", "requested_at" DESC);
CREATE UNIQUE INDEX "requirement_applicability_requests_one_pending" ON "tenant"."requirement_applicability_requests"("client_control_requirement_id") WHERE "status" = 'pending';
CREATE INDEX "requirement_occurrences_tenant_id_idx" ON "tenant"."requirement_occurrences"("tenant_id");
CREATE INDEX "requirement_occurrences_req_idx" ON "tenant"."requirement_occurrences"("client_control_requirement_id", "occurred_on" DESC);
CREATE INDEX "no_occurrence_declarations_tenant_id_idx" ON "tenant"."no_occurrence_declarations"("tenant_id");
CREATE INDEX "no_occurrence_declarations_req_idx" ON "tenant"."no_occurrence_declarations"("client_control_requirement_id", "window_start" DESC);
CREATE UNIQUE INDEX "no_occurrence_declarations_one_live" ON "tenant"."no_occurrence_declarations"("client_control_requirement_id", "window_start") WHERE "invalidated_at" IS NULL;
CREATE INDEX "evidence_submissions_requirement_occurrence_id_idx" ON "tenant"."evidence_submissions"("requirement_occurrence_id");

-- Claves foráneas
ALTER TABLE "tenant"."control_level_overrides" ADD CONSTRAINT "control_level_overrides_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."control_level_overrides" ADD CONSTRAINT "control_level_overrides_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."control_level_overrides" ADD CONSTRAINT "control_level_overrides_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."control_level_overrides" ADD CONSTRAINT "control_level_overrides_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_requirement_fkey" FOREIGN KEY ("client_control_requirement_id") REFERENCES "tenant"."client_control_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."remediation_plans" ADD CONSTRAINT "remediation_plans_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD CONSTRAINT "requirement_applicability_requests_req_fkey" FOREIGN KEY ("client_control_requirement_id") REFERENCES "tenant"."client_control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD CONSTRAINT "requirement_applicability_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD CONSTRAINT "requirement_applicability_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD CONSTRAINT "requirement_applicability_requests_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_applicability_requests" ADD CONSTRAINT "requirement_applicability_requests_reverted_by_fkey" FOREIGN KEY ("reverted_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_occurrences" ADD CONSTRAINT "requirement_occurrences_req_fkey" FOREIGN KEY ("client_control_requirement_id") REFERENCES "tenant"."client_control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_occurrences" ADD CONSTRAINT "requirement_occurrences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."requirement_occurrences" ADD CONSTRAINT "requirement_occurrences_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."no_occurrence_declarations" ADD CONSTRAINT "no_occurrence_declarations_req_fkey" FOREIGN KEY ("client_control_requirement_id") REFERENCES "tenant"."client_control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."no_occurrence_declarations" ADD CONSTRAINT "no_occurrence_declarations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."no_occurrence_declarations" ADD CONSTRAINT "no_occurrence_declarations_declared_by_fkey" FOREIGN KEY ("declared_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_requirement_occurrence_id_fkey" FOREIGN KEY ("requirement_occurrence_id") REFERENCES "tenant"."requirement_occurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
