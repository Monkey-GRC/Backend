-- CreateEnum
CREATE TYPE "tenant"."audit_observation_type" AS ENUM ('observation', 'recommendation', 'information_request');

-- CreateEnum
CREATE TYPE "tenant"."audit_observation_status" AS ENUM ('open', 'answered', 'closed');

-- CreateTable
CREATE TABLE "tenant"."audit_observations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "client_control_id" UUID,
    "evidence_submission_id" UUID,
    "created_by" UUID NOT NULL,
    "type" "tenant"."audit_observation_type" NOT NULL,
    "body" TEXT NOT NULL,
    "status" "tenant"."audit_observation_status" NOT NULL DEFAULT 'open',
    "answer_note" TEXT,
    "answer_evidence_id" UUID,
    "answered_by" UUID,
    "answered_at" TIMESTAMP(3),
    "closed_by" UUID,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_observations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_observations_tenant_id_idx" ON "tenant"."audit_observations"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_observations_service_id_status_idx" ON "tenant"."audit_observations"("service_id", "status");

-- CreateIndex
CREATE INDEX "audit_observations_client_control_id_status_idx" ON "tenant"."audit_observations"("client_control_id", "status");

-- CreateIndex
CREATE INDEX "audit_observations_evidence_submission_id_idx" ON "tenant"."audit_observations"("evidence_submission_id");

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_evidence_submission_id_fkey" FOREIGN KEY ("evidence_submission_id") REFERENCES "tenant"."evidence_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_answer_evidence_id_fkey" FOREIGN KEY ("answer_evidence_id") REFERENCES "tenant"."evidence_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_answered_by_fkey" FOREIGN KEY ("answered_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_observations" ADD CONSTRAINT "audit_observations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
