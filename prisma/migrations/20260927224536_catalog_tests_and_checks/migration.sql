-- CreateEnum
CREATE TYPE "catalog"."TestPlanOrigin" AS ENUM ('predefined', 'custom');

-- CreateEnum
CREATE TYPE "catalog"."CheckOrigin" AS ENUM ('cis_native', 'monkey_policy', 'auditor_criterion');

-- CreateTable
CREATE TABLE "catalog"."test_plans" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "population" TEXT NOT NULL,
    "sampling_rule" TEXT NOT NULL,
    "origin" "catalog"."TestPlanOrigin" NOT NULL,

    CONSTRAINT "test_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."tests" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "dimension" "catalog"."Dimension" NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "population" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "population_size" INTEGER NOT NULL,
    "suggested_sample_size" INTEGER NOT NULL,
    "selection_method" TEXT NOT NULL,
    "evidence_to_request" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "step_by_step" JSONB NOT NULL,
    "attributes_to_validate" JSONB NOT NULL,
    "compliance_criterion" TEXT NOT NULL,
    "exceptions_handling" TEXT NOT NULL,
    "evidence_to_retain" TEXT NOT NULL,
    "automated_coverage" TEXT NOT NULL,
    "complementary_manual_validation" TEXT NOT NULL,
    "limitations" TEXT NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_tests" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,

    CONSTRAINT "control_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."checks" (
    "id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "check_id" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "remediation" TEXT NOT NULL,
    "verification_rule" TEXT NOT NULL,
    "origin" "catalog"."CheckOrigin" NOT NULL,
    "mapping_provenance" TEXT NOT NULL,
    "mapping_confidence" TEXT NOT NULL,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."test_checks" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "check_id" UUID NOT NULL,

    CONSTRAINT "test_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."check_mappings" (
    "id" UUID NOT NULL,
    "check_id" UUID NOT NULL,
    "framework_code" TEXT NOT NULL,
    "framework_version" TEXT NOT NULL,
    "requirement_code" TEXT NOT NULL,

    CONSTRAINT "check_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."sca_policies" (
    "id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "benchmark" TEXT NOT NULL,
    "sca_id" TEXT NOT NULL,
    "yaml_file" TEXT NOT NULL,
    "check_count" INTEGER NOT NULL,

    CONSTRAINT "sca_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tests_code_key" ON "catalog"."tests"("code");

-- CreateIndex
CREATE UNIQUE INDEX "control_tests_control_id_test_id_key" ON "catalog"."control_tests"("control_id", "test_id");

-- CreateIndex
CREATE UNIQUE INDEX "checks_platform_policy_id_check_id_key" ON "catalog"."checks"("platform", "policy_id", "check_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_checks_test_id_check_id_key" ON "catalog"."test_checks"("test_id", "check_id");

-- CreateIndex
CREATE UNIQUE INDEX "sca_policies_sca_id_key" ON "catalog"."sca_policies"("sca_id");

-- AddForeignKey
ALTER TABLE "catalog"."test_plans" ADD CONSTRAINT "test_plans_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_tests" ADD CONSTRAINT "control_tests_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_tests" ADD CONSTRAINT "control_tests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."test_checks" ADD CONSTRAINT "test_checks_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."test_checks" ADD CONSTRAINT "test_checks_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "catalog"."checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."check_mappings" ADD CONSTRAINT "check_mappings_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "catalog"."checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
