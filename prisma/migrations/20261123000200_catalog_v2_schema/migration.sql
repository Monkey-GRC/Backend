-- Catálogo v2 (VF18, MD-491), estrategia aditiva: no se borra ninguna tabla v1. `tests.type` pasa de texto a enum (se pierde el texto v1, que la v2 no usa).
-- CreateEnum
CREATE TYPE "catalog"."document_type" AS ENUM ('policy', 'procedure', 'matrix', 'manual', 'document');

-- CreateEnum
CREATE TYPE "catalog"."document_origin" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "catalog"."document_acceptance" AS ENUM ('users_who_apply', 'all_users', 'not_required');

-- CreateEnum
CREATE TYPE "catalog"."control_type" AS ENUM ('manual', 'it_dependent_manual', 'automated');

-- CreateEnum
CREATE TYPE "catalog"."periodicity" AS ENUM ('permanent', 'daily', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual', 'on_demand');

-- CreateEnum
CREATE TYPE "catalog"."requirement_type" AS ENUM ('documentary', 'population', 'operational', 'technical');

-- CreateEnum
CREATE TYPE "catalog"."cause_origin" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "catalog"."cause_type" AS ENUM ('human', 'processes', 'information', 'measurement', 'technology', 'physical_infrastructure', 'criminal_security', 'third_parties', 'legal_regulatory', 'environmental', 'organizational_governance', 'internal_financial', 'strategic', 'external_technology', 'climate', 'biological', 'political', 'economic');

-- CreateEnum
CREATE TYPE "catalog"."test_type" AS ENUM ('documentary', 'population', 'operational', 'technical');

-- CreateEnum
CREATE TYPE "catalog"."test_primary_source" AS ENUM ('document', 'manual', 'probe', 'cloud_engine', 'probe_and_cloud_engine', 'integration');

-- CreateEnum
CREATE TYPE "catalog"."test_level" AS ENUM ('design', 'implementation', 'effectiveness', 'implementation_and_effectiveness');

-- CreateEnum
CREATE TYPE "catalog"."test_automation" AS ENUM ('manual', 'semi_automated', 'automated');

-- CreateEnum
CREATE TYPE "catalog"."check_role" AS ENUM ('direct', 'complementary', 'dependency');


-- AlterTable
ALTER TABLE "catalog"."controls" ADD COLUMN     "periodicity" "catalog"."periodicity",
ADD COLUMN     "suggested_owner_role" TEXT,
ADD COLUMN     "type" "catalog"."control_type",
ALTER COLUMN "domain" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."point_of_focus_controls" ADD COLUMN     "domain" TEXT;

-- AlterTable
ALTER TABLE "catalog"."causes" ADD COLUMN     "cause_origin" "catalog"."cause_origin",
ADD COLUMN     "cause_type" "catalog"."cause_type",
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "failure_category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."risk_causes" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."tests" ADD COLUMN     "automation" "catalog"."test_automation",
ADD COLUMN     "control_id" UUID,
ADD COLUMN     "correct_if" TEXT,
ADD COLUMN     "display_name_reviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exception_if" TEXT,
ADD COLUMN     "frequency_sample" TEXT,
ADD COLUMN     "integration_category_id" UUID,
ADD COLUMN     "level" "catalog"."test_level",
ADD COLUMN     "observation_if" TEXT,
ADD COLUMN     "primary_source" "catalog"."test_primary_source",
ADD COLUMN     "standard_procedure_id" UUID,
ADD COLUMN     "why_it_matters" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "catalog"."test_type",
ALTER COLUMN "tool" DROP NOT NULL,
ALTER COLUMN "population" DROP NOT NULL,
ALTER COLUMN "period" DROP NOT NULL,
ALTER COLUMN "population_size" DROP NOT NULL,
ALTER COLUMN "suggested_sample_size" DROP NOT NULL,
ALTER COLUMN "selection_method" DROP NOT NULL,
ALTER COLUMN "evidence_to_request" DROP NOT NULL,
ALTER COLUMN "prerequisites" DROP NOT NULL,
ALTER COLUMN "step_by_step" DROP NOT NULL,
ALTER COLUMN "step_by_step" SET DATA TYPE TEXT USING "step_by_step"::text,
ALTER COLUMN "attributes_to_validate" DROP NOT NULL,
ALTER COLUMN "compliance_criterion" DROP NOT NULL,
ALTER COLUMN "exceptions" DROP NOT NULL,
ALTER COLUMN "exceptions_handling" DROP NOT NULL,
ALTER COLUMN "evidence_to_retain" DROP NOT NULL,
ALTER COLUMN "automated_coverage" DROP NOT NULL,
ALTER COLUMN "complementary_manual_validation" DROP NOT NULL,
ALTER COLUMN "limitations" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."test_checks" ADD COLUMN     "applies_when" TEXT,
ADD COLUMN     "common_objective" TEXT,
ADD COLUMN     "module_ref" TEXT,
ADD COLUMN     "owner_control_id" UUID,
ADD COLUMN     "role" "catalog"."check_role" NOT NULL DEFAULT 'direct',
ALTER COLUMN "check_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."client_causes" ADD COLUMN     "cause_type" "catalog"."cause_type",
ADD COLUMN     "origin" "catalog"."cause_origin",
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "failure_category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "catalog"."control_requirements" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "control_id" UUID NOT NULL,
    "point_number" INTEGER,
    "text" TEXT NOT NULL,
    "type" "catalog"."requirement_type" NOT NULL,
    "periodicity" "catalog"."periodicity",
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "assembly_note" TEXT,

    CONSTRAINT "control_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_requirement_tests" (
    "id" UUID NOT NULL,
    "control_requirement_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,

    CONSTRAINT "control_requirement_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_requirement_documents" (
    "id" UUID NOT NULL,
    "control_requirement_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,

    CONSTRAINT "control_requirement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."standard_procedures" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "when_used" TEXT,
    "generic_steps" TEXT,
    "typical_evidence" TEXT,

    CONSTRAINT "standard_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."integration_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "example_tools" TEXT,
    "evidence_provided" TEXT,
    "procedure_code" TEXT,

    CONSTRAINT "integration_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."integration_category_controls" (
    "id" UUID NOT NULL,
    "integration_category_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,

    CONSTRAINT "integration_category_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."documents" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "catalog"."document_type" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minimum_content" TEXT,
    "review_periodicity" "catalog"."periodicity",
    "suggested_approver_role" TEXT,
    "suggested_owner_role" TEXT,
    "origin" "catalog"."document_origin" NOT NULL,
    "suggested_acceptance" "catalog"."document_acceptance" NOT NULL,
    "test_id" UUID,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_documents" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,

    CONSTRAINT "control_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_framework_mappings" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "framework_code" TEXT NOT NULL,
    "requirement_ref" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL DEFAULT 'direct',
    "justification" TEXT,

    CONSTRAINT "control_framework_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "control_requirements_code_key" ON "catalog"."control_requirements"("code");

-- CreateIndex
CREATE INDEX "control_requirements_control_id_idx" ON "catalog"."control_requirements"("control_id");

-- CreateIndex
CREATE INDEX "control_requirement_tests_test_id_idx" ON "catalog"."control_requirement_tests"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_requirement_tests_control_requirement_id_test_id_key" ON "catalog"."control_requirement_tests"("control_requirement_id", "test_id");

-- CreateIndex
CREATE INDEX "control_requirement_documents_document_id_idx" ON "catalog"."control_requirement_documents"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_requirement_documents_control_requirement_id_docume_key" ON "catalog"."control_requirement_documents"("control_requirement_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "standard_procedures_code_key" ON "catalog"."standard_procedures"("code");

-- CreateIndex
CREATE UNIQUE INDEX "integration_categories_name_key" ON "catalog"."integration_categories"("name");

-- CreateIndex
CREATE INDEX "integration_categories_procedure_code_idx" ON "catalog"."integration_categories"("procedure_code");

-- CreateIndex
CREATE INDEX "integration_category_controls_control_id_idx" ON "catalog"."integration_category_controls"("control_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_category_controls_integration_category_id_contr_key" ON "catalog"."integration_category_controls"("integration_category_id", "control_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_code_key" ON "catalog"."documents"("code");

-- CreateIndex
CREATE UNIQUE INDEX "documents_test_id_key" ON "catalog"."documents"("test_id");

-- CreateIndex
CREATE INDEX "control_documents_document_id_idx" ON "catalog"."control_documents"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_documents_control_id_document_id_key" ON "catalog"."control_documents"("control_id", "document_id");

-- CreateIndex
CREATE INDEX "control_framework_mappings_control_id_idx" ON "catalog"."control_framework_mappings"("control_id");

-- CreateIndex
CREATE INDEX "control_framework_mappings_framework_code_requirement_ref_idx" ON "catalog"."control_framework_mappings"("framework_code", "requirement_ref");

-- CreateIndex
CREATE INDEX "tests_control_id_idx" ON "catalog"."tests"("control_id");

-- CreateIndex
CREATE INDEX "tests_standard_procedure_id_idx" ON "catalog"."tests"("standard_procedure_id");

-- CreateIndex
CREATE INDEX "tests_integration_category_id_idx" ON "catalog"."tests"("integration_category_id");

-- CreateIndex
CREATE INDEX "test_checks_owner_control_id_idx" ON "catalog"."test_checks"("owner_control_id");

-- AddForeignKey
ALTER TABLE "catalog"."control_requirements" ADD CONSTRAINT "control_requirements_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_requirement_tests" ADD CONSTRAINT "control_requirement_tests_control_requirement_id_fkey" FOREIGN KEY ("control_requirement_id") REFERENCES "catalog"."control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_requirement_tests" ADD CONSTRAINT "control_requirement_tests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_requirement_documents" ADD CONSTRAINT "control_requirement_documents_control_requirement_id_fkey" FOREIGN KEY ("control_requirement_id") REFERENCES "catalog"."control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_requirement_documents" ADD CONSTRAINT "control_requirement_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "catalog"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."integration_categories" ADD CONSTRAINT "integration_categories_procedure_code_fkey" FOREIGN KEY ("procedure_code") REFERENCES "catalog"."standard_procedures"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."integration_category_controls" ADD CONSTRAINT "integration_category_controls_integration_category_id_fkey" FOREIGN KEY ("integration_category_id") REFERENCES "catalog"."integration_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."integration_category_controls" ADD CONSTRAINT "integration_category_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."documents" ADD CONSTRAINT "documents_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_documents" ADD CONSTRAINT "control_documents_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_documents" ADD CONSTRAINT "control_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "catalog"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_framework_mappings" ADD CONSTRAINT "control_framework_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."tests" ADD CONSTRAINT "tests_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."tests" ADD CONSTRAINT "tests_standard_procedure_id_fkey" FOREIGN KEY ("standard_procedure_id") REFERENCES "catalog"."standard_procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."tests" ADD CONSTRAINT "tests_integration_category_id_fkey" FOREIGN KEY ("integration_category_id") REFERENCES "catalog"."integration_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."test_checks" ADD CONSTRAINT "test_checks_owner_control_id_fkey" FOREIGN KEY ("owner_control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Exactamente uno de check_id / module_ref: los 19 vínculos «N/A» de la v2 guardan el módulo y el motor los ignora.
ALTER TABLE "catalog"."test_checks" ADD CONSTRAINT "test_checks_check_or_module_ck"
  CHECK ((check_id IS NOT NULL AND module_ref IS NULL) OR (check_id IS NULL AND module_ref IS NOT NULL));
