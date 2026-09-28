-- CreateEnum
CREATE TYPE "tenant"."EvaluationResult" AS ENUM ('compliant', 'non_compliant', 'pending', 'not_applicable');

-- CreateEnum
CREATE TYPE "tenant"."RawProbeResult" AS ENUM ('ok', 'fail');

-- CreateEnum
CREATE TYPE "tenant"."FindingStatus" AS ENUM ('open', 'remediated', 'excluded');

-- CreateEnum
CREATE TYPE "tenant"."FindingOrigin" AS ENUM ('system', 'auditor');

-- CreateEnum
CREATE TYPE "tenant"."RiskTreatmentDecision" AS ENUM ('mitigate', 'accept', 'transfer', 'avoid');

-- CreateEnum
CREATE TYPE "tenant"."VulnerabilityStatus" AS ENUM ('active', 'solved', 'mitigated');

-- CreateTable
CREATE TABLE "tenant"."client_controls" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "own_code" TEXT NOT NULL,
    "client_interpretation" TEXT NOT NULL,
    "type" "catalog"."ControlDimensionType" NOT NULL,
    "source_ref" TEXT,

    CONSTRAINT "client_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."action_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "responsible_id" UUID NOT NULL,
    "action_description" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."mitigations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cause_id" UUID,
    "risk_id" UUID,
    "response_percentage" DECIMAL(5,2) NOT NULL,
    "calculated_at" DATE NOT NULL,

    CONSTRAINT "mitigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."residual_risks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "risk_id" UUID NOT NULL,
    "accepted_by" UUID NOT NULL,
    "residual_level" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "accepted_at" DATE NOT NULL,

    CONSTRAINT "residual_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."risk_treatments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "risk_id" UUID NOT NULL,
    "responsible_id" UUID NOT NULL,
    "decision" "tenant"."RiskTreatmentDecision" NOT NULL,
    "due_date" DATE NOT NULL,

    CONSTRAINT "risk_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."evidence_requirements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "responsible_id" UUID,
    "code" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dimension" "catalog"."Dimension" NOT NULL,
    "validity_within_period" TEXT NOT NULL,

    CONSTRAINT "evidence_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."evidence_submissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "evidence_requirement_id" UUID NOT NULL,
    "submitted_by" UUID NOT NULL,
    "approved_by" UUID,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_location" TEXT NOT NULL,
    "integrity_hash" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "validation_status" TEXT NOT NULL,
    "ai_verdict" TEXT,

    CONSTRAINT "evidence_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."exclusions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "proposed_by" UUID NOT NULL,
    "approved_by" UUID,
    "excluded_check_id" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "valid_until" DATE NOT NULL,

    CONSTRAINT "exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."evaluations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "catalog_version_id" UUID NOT NULL,
    "confirmed_by" UUID,
    "evaluated_at" DATE NOT NULL,
    "dimension" "catalog"."Dimension" NOT NULL,
    "result" "tenant"."EvaluationResult" NOT NULL,
    "raw_probe_result" "tenant"."RawProbeResult",
    "diagnostic_percentage" DECIMAL(5,2),
    "origin" TEXT NOT NULL,
    "client_response" TEXT,
    "consultant_assessment" TEXT,
    "closure_observation_reason" TEXT,
    "covered_period" TEXT,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."findings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "evaluation_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "reported_by" UUID,
    "dimension" "catalog"."Dimension" NOT NULL,
    "failed_test_or_check" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" "tenant"."FindingStatus" NOT NULL DEFAULT 'open',
    "origin" "tenant"."FindingOrigin" NOT NULL,
    "detected_at" DATE NOT NULL,
    "closed_at" DATE,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."vulnerabilities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "cve" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "package_version" TEXT NOT NULL,
    "cvss_score" DECIMAL(3,1) NOT NULL,
    "status" "tenant"."VulnerabilityStatus" NOT NULL DEFAULT 'active',
    "recommendation" TEXT NOT NULL,

    CONSTRAINT "vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_controls_service_id_own_code_key" ON "tenant"."client_controls"("service_id", "own_code");

-- AddForeignKey
ALTER TABLE "platform"."user_control_assignments" ADD CONSTRAINT "user_control_assignments_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_controls" ADD CONSTRAINT "client_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_controls" ADD CONSTRAINT "client_controls_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_controls" ADD CONSTRAINT "client_controls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."action_plans" ADD CONSTRAINT "action_plans_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."action_plans" ADD CONSTRAINT "action_plans_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."action_plans" ADD CONSTRAINT "action_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."mitigations" ADD CONSTRAINT "mitigations_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "catalog"."causes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."mitigations" ADD CONSTRAINT "mitigations_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."mitigations" ADD CONSTRAINT "mitigations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."residual_risks" ADD CONSTRAINT "residual_risks_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."residual_risks" ADD CONSTRAINT "residual_risks_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."residual_risks" ADD CONSTRAINT "residual_risks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_requirements" ADD CONSTRAINT "evidence_requirements_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_requirements" ADD CONSTRAINT "evidence_requirements_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "tenant"."organization_responsibles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_requirements" ADD CONSTRAINT "evidence_requirements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_evidence_requirement_id_fkey" FOREIGN KEY ("evidence_requirement_id") REFERENCES "tenant"."evidence_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "catalog"."catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."findings" ADD CONSTRAINT "findings_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "tenant"."evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."findings" ADD CONSTRAINT "findings_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."findings" ADD CONSTRAINT "findings_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."findings" ADD CONSTRAINT "findings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."vulnerabilities" ADD CONSTRAINT "vulnerabilities_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."vulnerabilities" ADD CONSTRAINT "vulnerabilities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
