-- Revisión de las migraciones contra modelo-datos.md (D26 a D32). Generada con
-- `prisma migrate diff` sobre el schema anterior.
--
-- ⚠️ Asume tablas VACÍAS: agrega columnas NOT NULL (evaluations.test_id, client_*_id,
-- users.email único global…) y reemplaza service_risks y las FK de riesgo de mitigations /
-- residual_risks / risk_treatments. Si un ambiente ya tiene filas, falla sin dejar nada a medias:
-- hay que vaciarlas o escribir un backfill antes.

-- CreateEnum
CREATE TYPE "catalog"."policy_approval_status" AS ENUM ('draft', 'pending_approval', 'approved');

-- CreateEnum
CREATE TYPE "catalog"."framework_type" AS ENUM ('attestation', 'certification', 'standard', 'regulation');

-- CreateEnum
CREATE TYPE "catalog"."risk_criterion" AS ENUM ('confidentiality', 'integrity', 'availability', 'privacy', 'compliance', 'security', 'continuity', 'third_parties', 'fraud', 'reputation', 'operations');

-- CreateEnum
CREATE TYPE "catalog"."risk_level" AS ENUM ('low', 'moderate', 'high', 'critical');

-- CreateEnum
CREATE TYPE "catalog"."mapping_confidence" AS ENUM ('confirmed', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "tenant"."action_plan_status" AS ENUM ('open', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "tenant"."evidence_validation_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "tenant"."evaluation_origin" AS ENUM ('automated', 'manual', 'ai_assisted');

-- CreateEnum
CREATE TYPE "tenant"."severity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "tenant"."service_framework_status" AS ENUM ('active', 'paused', 'finished');

-- CreateEnum
CREATE TYPE "tenant"."asset_type" AS ENUM ('server', 'database', 'cloud_service', 'application', 'endpoint', 'network_device', 'documentation');

-- CreateEnum
CREATE TYPE "tenant"."asset_criticality" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "tenant"."asset_origin" AS ENUM ('declared', 'discovered');

-- CreateEnum
CREATE TYPE "tenant"."asset_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "tenant"."provisioning_status" AS ENUM ('pending', 'validated', 'active', 'scheduled', 'failed');

-- CreateEnum
CREATE TYPE "tenant"."execution_status" AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "catalog"."failure_category" ADD VALUE 'processes';
ALTER TYPE "catalog"."failure_category" ADD VALUE 'information_technology';
ALTER TYPE "catalog"."failure_category" ADD VALUE 'external';
ALTER TYPE "catalog"."failure_category" ADD VALUE 'governance';

-- DropForeignKey
ALTER TABLE "catalog"."automated_capabilities" DROP CONSTRAINT "automated_capabilities_monitoring_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."mitigations" DROP CONSTRAINT "mitigations_cause_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."mitigations" DROP CONSTRAINT "mitigations_risk_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."residual_risks" DROP CONSTRAINT "residual_risks_risk_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."risk_treatments" DROP CONSTRAINT "risk_treatments_risk_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."evidence_submissions" DROP CONSTRAINT "evidence_submissions_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."exclusions" DROP CONSTRAINT "exclusions_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."evaluations" DROP CONSTRAINT "evaluations_confirmed_by_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."findings" DROP CONSTRAINT "findings_reported_by_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."service_risks" DROP CONSTRAINT "service_risks_service_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."service_risks" DROP CONSTRAINT "service_risks_risk_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."service_risks" DROP CONSTRAINT "service_risks_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_MonitoringDomainToRequirement" DROP CONSTRAINT "_MonitoringDomainToRequirement_A_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."_MonitoringDomainToRequirement" DROP CONSTRAINT "_MonitoringDomainToRequirement_B_fkey";

-- DropIndex
DROP INDEX "platform"."users_company_id_email_key";

-- AlterTable
ALTER TABLE "audit"."audit_logs" ADD COLUMN     "attempted_email" TEXT,
ADD COLUMN     "user_agent" TEXT NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."policies" DROP COLUMN "approval_status",
ADD COLUMN     "approval_status" "catalog"."policy_approval_status" NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."frameworks" DROP COLUMN "type",
ADD COLUMN     "type" "catalog"."framework_type" NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."risks" DROP COLUMN "trust_criterion",
ADD COLUMN     "trust_criterion" "catalog"."risk_criterion" NOT NULL,
ALTER COLUMN "likelihood" DROP NOT NULL,
ALTER COLUMN "impact" DROP NOT NULL,
ALTER COLUMN "inherent_risk_value" DROP NOT NULL,
DROP COLUMN "inherent_risk_level",
ADD COLUMN     "inherent_risk_level" "catalog"."risk_level";

-- AlterTable
ALTER TABLE "catalog"."automated_capabilities" DROP COLUMN "monitoring_domain_id";

-- AlterTable
ALTER TABLE "catalog"."checks" ADD COLUMN     "sca_policy_id" UUID,
DROP COLUMN "mapping_confidence",
ADD COLUMN     "mapping_confidence" "catalog"."mapping_confidence" NOT NULL;

-- AlterTable
ALTER TABLE "platform"."users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "mfa_secret_encrypted" TEXT,
ADD COLUMN     "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tenant"."action_plans" DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."action_plan_status" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."mitigations" DROP COLUMN "cause_id",
DROP COLUMN "risk_id",
ADD COLUMN     "client_cause_id" UUID,
ADD COLUMN     "client_risk_id" UUID;

-- AlterTable
ALTER TABLE "tenant"."residual_risks" DROP COLUMN "risk_id",
ADD COLUMN     "client_risk_id" UUID NOT NULL,
DROP COLUMN "residual_level",
ADD COLUMN     "residual_level" "catalog"."risk_level" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."risk_treatments" DROP COLUMN "risk_id",
ADD COLUMN     "client_risk_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."evidence_requirements" ADD COLUMN     "source_ref" TEXT;

-- AlterTable
ALTER TABLE "tenant"."evidence_submissions" DROP COLUMN "validation_status",
ADD COLUMN     "validation_status" "tenant"."evidence_validation_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "tenant"."evaluations" ADD COLUMN     "check_id" UUID,
ADD COLUMN     "test_id" UUID NOT NULL,
ALTER COLUMN "evaluated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "evaluated_at" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "origin",
ADD COLUMN     "origin" "tenant"."evaluation_origin" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."findings" DROP COLUMN "severity",
ADD COLUMN     "severity" "tenant"."severity" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."vulnerabilities" DROP COLUMN "severity",
ADD COLUMN     "severity" "tenant"."severity" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."service_frameworks" DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."service_framework_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "tenant"."assets" DROP COLUMN "type",
ADD COLUMN     "type" "tenant"."asset_type" NOT NULL,
DROP COLUMN "criticality",
ADD COLUMN     "criticality" "tenant"."asset_criticality" NOT NULL,
DROP COLUMN "origin",
ADD COLUMN     "origin" "tenant"."asset_origin" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."asset_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "tenant"."asset_provisionings" DROP COLUMN "connection_status",
ADD COLUMN     "connection_status" "tenant"."provisioning_status" NOT NULL DEFAULT 'pending',
ALTER COLUMN "encrypted_credentials" DROP NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT false;

-- AlterTable
ALTER TABLE "tenant"."executions" DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."execution_status" NOT NULL;

-- DropTable
DROP TABLE "tenant"."service_risks";

-- DropTable
DROP TABLE "catalog"."_MonitoringDomainToRequirement";

-- CreateTable
CREATE TABLE "catalog"."monitoring_domain_requirements" (
    "id" UUID NOT NULL,
    "monitoring_domain_id" UUID NOT NULL,
    "requirement_id" UUID NOT NULL,

    CONSTRAINT "monitoring_domain_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."monitoring_domain_capabilities" (
    "id" UUID NOT NULL,
    "monitoring_domain_id" UUID NOT NULL,
    "automated_capability_id" UUID NOT NULL,

    CONSTRAINT "monitoring_domain_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_risks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "risk_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trust_criterion" "catalog"."risk_criterion" NOT NULL,
    "potential_impact" JSONB NOT NULL,
    "likelihood" INTEGER,
    "impact" INTEGER,
    "inherent_risk_value" INTEGER,
    "inherent_risk_level" "catalog"."risk_level",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_causes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "cause_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "failure_category" "catalog"."failure_category" NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_risk_causes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_risk_id" UUID NOT NULL,
    "client_cause_id" UUID NOT NULL,

    CONSTRAINT "client_risk_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_cause_controls" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_cause_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,

    CONSTRAINT "client_cause_controls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monitoring_domain_requirements_requirement_id_idx" ON "catalog"."monitoring_domain_requirements"("requirement_id");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_domain_requirements_monitoring_domain_id_require_key" ON "catalog"."monitoring_domain_requirements"("monitoring_domain_id", "requirement_id");

-- CreateIndex
CREATE INDEX "monitoring_domain_capabilities_automated_capability_id_idx" ON "catalog"."monitoring_domain_capabilities"("automated_capability_id");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_domain_capabilities_monitoring_domain_id_automat_key" ON "catalog"."monitoring_domain_capabilities"("monitoring_domain_id", "automated_capability_id");

-- CreateIndex
CREATE INDEX "client_risks_tenant_id_idx" ON "tenant"."client_risks"("tenant_id");

-- CreateIndex
CREATE INDEX "client_risks_risk_id_idx" ON "tenant"."client_risks"("risk_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_risks_service_id_code_key" ON "tenant"."client_risks"("service_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "client_risks_service_id_risk_id_key" ON "tenant"."client_risks"("service_id", "risk_id");

-- CreateIndex
CREATE INDEX "client_causes_tenant_id_idx" ON "tenant"."client_causes"("tenant_id");

-- CreateIndex
CREATE INDEX "client_causes_cause_id_idx" ON "tenant"."client_causes"("cause_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_causes_service_id_code_key" ON "tenant"."client_causes"("service_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "client_causes_service_id_cause_id_key" ON "tenant"."client_causes"("service_id", "cause_id");

-- CreateIndex
CREATE INDEX "client_risk_causes_tenant_id_idx" ON "tenant"."client_risk_causes"("tenant_id");

-- CreateIndex
CREATE INDEX "client_risk_causes_client_cause_id_idx" ON "tenant"."client_risk_causes"("client_cause_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_risk_causes_client_risk_id_client_cause_id_key" ON "tenant"."client_risk_causes"("client_risk_id", "client_cause_id");

-- CreateIndex
CREATE INDEX "client_cause_controls_tenant_id_idx" ON "tenant"."client_cause_controls"("tenant_id");

-- CreateIndex
CREATE INDEX "client_cause_controls_client_control_id_idx" ON "tenant"."client_cause_controls"("client_control_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_cause_controls_client_cause_id_client_control_id_key" ON "tenant"."client_cause_controls"("client_cause_id", "client_control_id");

-- CreateIndex
CREATE INDEX "compliance_events_user_id_idx" ON "audit"."compliance_events"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "controls_code_key" ON "catalog"."controls"("code");

-- CreateIndex
CREATE INDEX "point_of_focus_controls_control_id_idx" ON "catalog"."point_of_focus_controls"("control_id");

-- CreateIndex
CREATE INDEX "control_policies_policy_id_idx" ON "catalog"."control_policies"("policy_id");

-- CreateIndex
CREATE UNIQUE INDEX "frameworks_code_version_key" ON "catalog"."frameworks"("code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "trust_criteria_criterion_key" ON "catalog"."trust_criteria"("criterion");

-- CreateIndex
CREATE INDEX "requirements_trust_criterion_id_idx" ON "catalog"."requirements"("trust_criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "requirements_framework_id_code_key" ON "catalog"."requirements"("framework_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "points_of_focus_requirement_id_number_key" ON "catalog"."points_of_focus"("requirement_id", "number");

-- CreateIndex
CREATE INDEX "requirement_relations_related_requirement_id_idx" ON "catalog"."requirement_relations"("related_requirement_id");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_relations_source_requirement_id_related_require_key" ON "catalog"."requirement_relations"("source_requirement_id", "related_requirement_id");

-- CreateIndex
CREATE INDEX "risk_causes_cause_id_idx" ON "catalog"."risk_causes"("cause_id");

-- CreateIndex
CREATE INDEX "cause_controls_control_id_idx" ON "catalog"."cause_controls"("control_id");

-- CreateIndex
CREATE INDEX "test_plans_control_id_idx" ON "catalog"."test_plans"("control_id");

-- CreateIndex
CREATE INDEX "control_tests_test_id_idx" ON "catalog"."control_tests"("test_id");

-- CreateIndex
CREATE INDEX "checks_sca_policy_id_idx" ON "catalog"."checks"("sca_policy_id");

-- CreateIndex
CREATE INDEX "test_checks_check_id_idx" ON "catalog"."test_checks"("check_id");

-- CreateIndex
CREATE INDEX "check_mappings_check_id_idx" ON "catalog"."check_mappings"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_keys_code_hash_key" ON "platform"."access_keys"("code_hash");

-- CreateIndex
CREATE INDEX "access_keys_company_id_idx" ON "platform"."access_keys"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "platform"."users"("email");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "platform"."users"("company_id");

-- CreateIndex
CREATE INDEX "users_custom_role_id_idx" ON "platform"."users"("custom_role_id");

-- CreateIndex
CREATE INDEX "custom_roles_company_id_idx" ON "platform"."custom_roles"("company_id");

-- CreateIndex
CREATE INDEX "user_control_assignments_company_id_idx" ON "platform"."user_control_assignments"("company_id");

-- CreateIndex
CREATE INDEX "user_control_assignments_client_control_id_idx" ON "platform"."user_control_assignments"("client_control_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_control_assignments_user_id_client_control_id_key" ON "platform"."user_control_assignments"("user_id", "client_control_id");

-- CreateIndex
CREATE INDEX "auditor_assignments_company_id_idx" ON "platform"."auditor_assignments"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "auditor_assignments_auditor_user_id_company_id_key" ON "platform"."auditor_assignments"("auditor_user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "platform"."sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "sessions_company_id_idx" ON "platform"."sessions"("company_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "platform"."sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "platform"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_company_id_idx" ON "platform"."api_keys"("company_id");

-- CreateIndex
CREATE INDEX "client_controls_tenant_id_idx" ON "tenant"."client_controls"("tenant_id");

-- CreateIndex
CREATE INDEX "client_controls_control_id_idx" ON "tenant"."client_controls"("control_id");

-- CreateIndex
CREATE INDEX "action_plans_tenant_id_idx" ON "tenant"."action_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "action_plans_client_control_id_idx" ON "tenant"."action_plans"("client_control_id");

-- CreateIndex
CREATE INDEX "action_plans_responsible_id_idx" ON "tenant"."action_plans"("responsible_id");

-- CreateIndex
CREATE INDEX "mitigations_tenant_id_idx" ON "tenant"."mitigations"("tenant_id");

-- CreateIndex
CREATE INDEX "mitigations_client_cause_id_idx" ON "tenant"."mitigations"("client_cause_id");

-- CreateIndex
CREATE INDEX "mitigations_client_risk_id_idx" ON "tenant"."mitigations"("client_risk_id");

-- CreateIndex
CREATE INDEX "residual_risks_tenant_id_idx" ON "tenant"."residual_risks"("tenant_id");

-- CreateIndex
CREATE INDEX "residual_risks_client_risk_id_idx" ON "tenant"."residual_risks"("client_risk_id");

-- CreateIndex
CREATE INDEX "risk_treatments_tenant_id_idx" ON "tenant"."risk_treatments"("tenant_id");

-- CreateIndex
CREATE INDEX "risk_treatments_client_risk_id_idx" ON "tenant"."risk_treatments"("client_risk_id");

-- CreateIndex
CREATE INDEX "risk_treatments_responsible_id_idx" ON "tenant"."risk_treatments"("responsible_id");

-- CreateIndex
CREATE INDEX "evidence_requirements_tenant_id_idx" ON "tenant"."evidence_requirements"("tenant_id");

-- CreateIndex
CREATE INDEX "evidence_requirements_control_id_idx" ON "tenant"."evidence_requirements"("control_id");

-- CreateIndex
CREATE INDEX "evidence_requirements_responsible_id_idx" ON "tenant"."evidence_requirements"("responsible_id");

-- CreateIndex
CREATE INDEX "evidence_submissions_tenant_id_idx" ON "tenant"."evidence_submissions"("tenant_id");

-- CreateIndex
CREATE INDEX "evidence_submissions_evidence_requirement_id_idx" ON "tenant"."evidence_submissions"("evidence_requirement_id");

-- CreateIndex
CREATE INDEX "exclusions_tenant_id_idx" ON "tenant"."exclusions"("tenant_id");

-- CreateIndex
CREATE INDEX "exclusions_test_id_idx" ON "tenant"."exclusions"("test_id");

-- CreateIndex
CREATE INDEX "evaluations_service_id_control_id_evaluated_at_idx" ON "tenant"."evaluations"("service_id", "control_id", "evaluated_at");

-- CreateIndex
CREATE INDEX "evaluations_asset_id_idx" ON "tenant"."evaluations"("asset_id");

-- CreateIndex
CREATE INDEX "evaluations_tenant_id_idx" ON "tenant"."evaluations"("tenant_id");

-- CreateIndex
CREATE INDEX "evaluations_catalog_version_id_idx" ON "tenant"."evaluations"("catalog_version_id");

-- CreateIndex
CREATE INDEX "evaluations_check_id_idx" ON "tenant"."evaluations"("check_id");

-- CreateIndex
CREATE INDEX "evaluations_control_id_idx" ON "tenant"."evaluations"("control_id");

-- CreateIndex
CREATE INDEX "evaluations_test_id_idx" ON "tenant"."evaluations"("test_id");

-- CreateIndex
CREATE INDEX "findings_evaluation_id_idx" ON "tenant"."findings"("evaluation_id");

-- CreateIndex
CREATE INDEX "findings_asset_id_idx" ON "tenant"."findings"("asset_id");

-- CreateIndex
CREATE INDEX "findings_tenant_id_idx" ON "tenant"."findings"("tenant_id");

-- CreateIndex
CREATE INDEX "vulnerabilities_tenant_id_idx" ON "tenant"."vulnerabilities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "vulnerabilities_asset_id_cve_package_name_key" ON "tenant"."vulnerabilities"("asset_id", "cve", "package_name");

-- CreateIndex
CREATE INDEX "organization_regulations_tenant_id_idx" ON "tenant"."organization_regulations"("tenant_id");

-- CreateIndex
CREATE INDEX "organization_regulations_regulation_id_idx" ON "tenant"."organization_regulations"("regulation_id");

-- CreateIndex
CREATE INDEX "organization_responsibles_tenant_id_idx" ON "tenant"."organization_responsibles"("tenant_id");

-- CreateIndex
CREATE INDEX "organization_responsibles_organization_id_idx" ON "tenant"."organization_responsibles"("organization_id");

-- CreateIndex
CREATE INDEX "services_tenant_id_idx" ON "tenant"."services"("tenant_id");

-- CreateIndex
CREATE INDEX "services_organization_id_idx" ON "tenant"."services"("organization_id");

-- CreateIndex
CREATE INDEX "service_trust_criteria_tenant_id_idx" ON "tenant"."service_trust_criteria"("tenant_id");

-- CreateIndex
CREATE INDEX "service_trust_criteria_trust_criterion_id_idx" ON "tenant"."service_trust_criteria"("trust_criterion_id");

-- CreateIndex
CREATE INDEX "service_frameworks_tenant_id_idx" ON "tenant"."service_frameworks"("tenant_id");

-- CreateIndex
CREATE INDEX "service_frameworks_catalog_version_id_idx" ON "tenant"."service_frameworks"("catalog_version_id");

-- CreateIndex
CREATE INDEX "service_frameworks_framework_id_idx" ON "tenant"."service_frameworks"("framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_frameworks_service_id_framework_id_key" ON "tenant"."service_frameworks"("service_id", "framework_id");

-- CreateIndex
CREATE INDEX "subservice_organizations_tenant_id_idx" ON "tenant"."subservice_organizations"("tenant_id");

-- CreateIndex
CREATE INDEX "subservice_organizations_service_id_idx" ON "tenant"."subservice_organizations"("service_id");

-- CreateIndex
CREATE INDEX "csocs_tenant_id_idx" ON "tenant"."csocs"("tenant_id");

-- CreateIndex
CREATE INDEX "csocs_subservice_organization_id_idx" ON "tenant"."csocs"("subservice_organization_id");

-- CreateIndex
CREATE INDEX "cuecs_tenant_id_idx" ON "tenant"."cuecs"("tenant_id");

-- CreateIndex
CREATE INDEX "cuecs_service_id_idx" ON "tenant"."cuecs"("service_id");

-- CreateIndex
CREATE INDEX "system_descriptions_tenant_id_idx" ON "tenant"."system_descriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "scopes_tenant_id_idx" ON "tenant"."scopes"("tenant_id");

-- CreateIndex
CREATE INDEX "assets_tenant_id_idx" ON "tenant"."assets"("tenant_id");

-- CreateIndex
CREATE INDEX "assets_responsible_id_idx" ON "tenant"."assets"("responsible_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_organization_id_code_key" ON "tenant"."assets"("organization_id", "code");

-- CreateIndex
CREATE INDEX "service_assets_tenant_id_idx" ON "tenant"."service_assets"("tenant_id");

-- CreateIndex
CREATE INDEX "service_assets_service_id_idx" ON "tenant"."service_assets"("service_id");

-- CreateIndex
CREATE INDEX "asset_provisionings_tenant_id_idx" ON "tenant"."asset_provisionings"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_provisionings_asset_id_idx" ON "tenant"."asset_provisionings"("asset_id");

-- CreateIndex
CREATE INDEX "asset_provisionings_automated_capability_id_idx" ON "tenant"."asset_provisionings"("automated_capability_id");

-- CreateIndex
CREATE INDEX "schedule_rules_tenant_id_idx" ON "tenant"."schedule_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "executions_tenant_id_idx" ON "tenant"."executions"("tenant_id");

-- CreateIndex
CREATE INDEX "executions_retry_of_id_idx" ON "tenant"."executions"("retry_of_id");

-- CreateIndex
CREATE INDEX "executions_schedule_rule_id_idx" ON "tenant"."executions"("schedule_rule_id");

-- CreateIndex
CREATE INDEX "check_results_tenant_id_idx" ON "tenant"."check_results"("tenant_id");

-- CreateIndex
CREATE INDEX "execution_logs_tenant_id_idx" ON "tenant"."execution_logs"("tenant_id");

-- AddForeignKey
ALTER TABLE "catalog"."monitoring_domain_requirements" ADD CONSTRAINT "monitoring_domain_requirements_monitoring_domain_id_fkey" FOREIGN KEY ("monitoring_domain_id") REFERENCES "catalog"."monitoring_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."monitoring_domain_requirements" ADD CONSTRAINT "monitoring_domain_requirements_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "catalog"."requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."monitoring_domain_capabilities" ADD CONSTRAINT "monitoring_domain_capabilities_monitoring_domain_id_fkey" FOREIGN KEY ("monitoring_domain_id") REFERENCES "catalog"."monitoring_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."monitoring_domain_capabilities" ADD CONSTRAINT "monitoring_domain_capabilities_automated_capability_id_fkey" FOREIGN KEY ("automated_capability_id") REFERENCES "catalog"."automated_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."checks" ADD CONSTRAINT "checks_sca_policy_id_fkey" FOREIGN KEY ("sca_policy_id") REFERENCES "catalog"."sca_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."mitigations" ADD CONSTRAINT "mitigations_client_cause_id_fkey" FOREIGN KEY ("client_cause_id") REFERENCES "tenant"."client_causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."mitigations" ADD CONSTRAINT "mitigations_client_risk_id_fkey" FOREIGN KEY ("client_risk_id") REFERENCES "tenant"."client_risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."residual_risks" ADD CONSTRAINT "residual_risks_client_risk_id_fkey" FOREIGN KEY ("client_risk_id") REFERENCES "tenant"."client_risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_client_risk_id_fkey" FOREIGN KEY ("client_risk_id") REFERENCES "tenant"."client_risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_submissions" ADD CONSTRAINT "evidence_submissions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."exclusions" ADD CONSTRAINT "exclusions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "catalog"."checks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."findings" ADD CONSTRAINT "findings_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risks" ADD CONSTRAINT "client_risks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risks" ADD CONSTRAINT "client_risks_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risks" ADD CONSTRAINT "client_risks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_causes" ADD CONSTRAINT "client_causes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_causes" ADD CONSTRAINT "client_causes_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "catalog"."causes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_causes" ADD CONSTRAINT "client_causes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risk_causes" ADD CONSTRAINT "client_risk_causes_client_risk_id_fkey" FOREIGN KEY ("client_risk_id") REFERENCES "tenant"."client_risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risk_causes" ADD CONSTRAINT "client_risk_causes_client_cause_id_fkey" FOREIGN KEY ("client_cause_id") REFERENCES "tenant"."client_causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_risk_causes" ADD CONSTRAINT "client_risk_causes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_cause_controls" ADD CONSTRAINT "client_cause_controls_client_cause_id_fkey" FOREIGN KEY ("client_cause_id") REFERENCES "tenant"."client_causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_cause_controls" ADD CONSTRAINT "client_cause_controls_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_cause_controls" ADD CONSTRAINT "client_cause_controls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
