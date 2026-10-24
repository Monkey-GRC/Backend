-- CreateEnum
CREATE TYPE "tenant"."assessor_role" AS ENUM ('consultor', 'auditor');

-- CreateEnum
CREATE TYPE "tenant"."assessment_verdict" AS ENUM ('ready', 'not_ready', 'certified', 'not_certified');

-- DropForeignKey
ALTER TABLE "audit"."compliance_events" DROP CONSTRAINT "compliance_events_user_id_fkey";

-- AlterTable
ALTER TABLE "audit"."compliance_events" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "ip_address" DROP NOT NULL,
ALTER COLUMN "user_agent" DROP NOT NULL;

-- CreateTable
CREATE TABLE "tenant"."framework_assessments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_framework_id" UUID NOT NULL,
    "assessor_role" "tenant"."assessor_role" NOT NULL,
    "verdict" "tenant"."assessment_verdict" NOT NULL,
    "rationale" TEXT NOT NULL,
    "issued_by" UUID NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "framework_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "framework_assessments_service_framework_id_assessor_role_is_idx" ON "tenant"."framework_assessments"("service_framework_id", "assessor_role", "issued_at");

-- CreateIndex
CREATE INDEX "framework_assessments_tenant_id_idx" ON "tenant"."framework_assessments"("tenant_id");

-- CreateIndex
CREATE INDEX "framework_assessments_issued_by_idx" ON "tenant"."framework_assessments"("issued_by");

-- AddForeignKey
ALTER TABLE "audit"."compliance_events" ADD CONSTRAINT "compliance_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."framework_assessments" ADD CONSTRAINT "framework_assessments_service_framework_id_fkey" FOREIGN KEY ("service_framework_id") REFERENCES "tenant"."service_frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."framework_assessments" ADD CONSTRAINT "framework_assessments_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."framework_assessments" ADD CONSTRAINT "framework_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
