-- MD-150 y MD-118 · El control propio de la empresa y los cambios que propone (modelo-datos.md §7.1, D65, D79).

-- Un control propio lleva nombre y categoría (D79). En uno del catálogo salen de `controls` y de sus requisitos, así que son nulos.
ALTER TABLE "tenant"."client_controls" ADD COLUMN "name" TEXT;
ALTER TABLE "tenant"."client_controls" ADD COLUMN "trust_criterion" "catalog"."trust_criterion_code";
ALTER TABLE "tenant"."client_controls" ADD CONSTRAINT "client_controls_own_has_name_and_category"
  CHECK ("control_id" IS NOT NULL OR ("name" IS NOT NULL AND "trust_criterion" IS NOT NULL));

CREATE TYPE "tenant"."client_control_change_type" AS ENUM ('create', 'retire', 'edit_dimensions', 'edit_interpretation');
CREATE TYPE "tenant"."client_control_change_status" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "tenant"."client_control_changes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "change_type" "tenant"."client_control_change_type" NOT NULL,
    "proposed_values" JSONB NOT NULL,
    "status" "tenant"."client_control_change_status" NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "decided_by" UUID,
    "decision_note" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "client_control_changes_pkey" PRIMARY KEY ("id"),
    -- Una propuesta decidida dice quién y cuándo; una pendiente no. Rechazar exige un motivo.
    CONSTRAINT "client_control_changes_decision_consistent" CHECK (
      ("status" = 'pending' AND "decided_by" IS NULL AND "decided_at" IS NULL)
      OR ("status" <> 'pending' AND "decided_by" IS NOT NULL AND "decided_at" IS NOT NULL)
    ),
    CONSTRAINT "client_control_changes_reject_needs_note" CHECK ("status" <> 'rejected' OR length(btrim(coalesce("decision_note", ''))) > 0)
);

CREATE INDEX "client_control_changes_tenant_id_idx" ON "tenant"."client_control_changes"("tenant_id");
CREATE INDEX "client_control_changes_service_id_status_idx" ON "tenant"."client_control_changes"("service_id", "status");
CREATE INDEX "client_control_changes_client_control_id_idx" ON "tenant"."client_control_changes"("client_control_id");
-- Una propuesta pendiente por tipo y por control: dos a la vez se pisarían al decidirse.
CREATE UNIQUE INDEX "client_control_changes_one_pending_per_type" ON "tenant"."client_control_changes"("client_control_id", "change_type") WHERE "status" = 'pending';

ALTER TABLE "tenant"."client_control_changes" ADD CONSTRAINT "client_control_changes_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."client_control_changes" ADD CONSTRAINT "client_control_changes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."client_control_changes" ADD CONSTRAINT "client_control_changes_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."client_control_changes" ADD CONSTRAINT "client_control_changes_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."client_control_changes" ADD CONSTRAINT "client_control_changes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Aislamiento por empresa, como el resto de las tablas del escenario del cliente.
ALTER TABLE "tenant"."client_control_changes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant"."client_control_changes" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tenant"."client_control_changes"
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
