-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant";

-- CreateEnum
CREATE TYPE "tenant"."OrganizationResponsibleType" AS ENUM ('coo', 'it', 'compliance', 'process', 'ciso', 'asset_owner');

-- CreateEnum
CREATE TYPE "tenant"."SubserviceProviderType" AS ENUM ('aws', 'azure', 'gcp', 'on_premise', 'hybrid');

-- CreateEnum
CREATE TYPE "tenant"."AssetConnectionCategory" AS ENUM ('ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06');

-- CreateEnum
CREATE TYPE "tenant"."AssetOperationalStatus" AS ENUM ('operational', 'warning', 'error', 'not_monitored');

-- CreateTable
CREATE TABLE "tenant"."organizations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "business_model" TEXT NOT NULL,
    "years_in_operation" TEXT,
    "incorporation_countries" JSONB NOT NULL,
    "client_countries" JSONB NOT NULL,
    "compliance_maturity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."regulations" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,

    CONSTRAINT "regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."organization_regulations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "regulation_id" UUID NOT NULL,

    CONSTRAINT "organization_regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."organization_responsibles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "tenant"."OrganizationResponsibleType" NOT NULL,
    "person_name" TEXT NOT NULL,

    CONSTRAINT "organization_responsibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."services" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope_statement" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industries_served" JSONB NOT NULL,
    "active_client_count" TEXT,
    "countries" JSONB NOT NULL,
    "data_types" JSONB NOT NULL,
    "expected_availability" TEXT NOT NULL,
    "deployment_scenario" TEXT NOT NULL,
    "previous_certification" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."service_trust_criteria" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "trust_criterion_id" UUID NOT NULL,

    CONSTRAINT "service_trust_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."service_frameworks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "catalog_version_id" UUID NOT NULL,
    "contracted_at" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "evaluation_period" TEXT NOT NULL,

    CONSTRAINT "service_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."subservice_organizations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "service_provided" TEXT NOT NULL,
    "responsibility" TEXT NOT NULL,
    "type" "tenant"."SubserviceProviderType" NOT NULL,

    CONSTRAINT "subservice_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."csocs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subservice_organization_id" UUID NOT NULL,
    "expected_control" TEXT NOT NULL,

    CONSTRAINT "csocs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."cuecs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "expected_control" TEXT NOT NULL,

    CONSTRAINT "cuecs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."system_descriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "file_path" TEXT NOT NULL,
    "sections" JSONB NOT NULL,

    CONSTRAINT "system_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."service_risks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "risk_id" UUID NOT NULL,

    CONSTRAINT "service_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."scopes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "server_count" INTEGER NOT NULL,
    "cloud_count" INTEGER NOT NULL,
    "app_count" INTEGER NOT NULL,
    "database_count" INTEGER NOT NULL,
    "endpoint_count" INTEGER NOT NULL,

    CONSTRAINT "scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."assets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "responsible_id" UUID,
    "code" TEXT NOT NULL,
    "connection_category" "tenant"."AssetConnectionCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "ip_address" TEXT,
    "location" TEXT,
    "criticality" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "origin" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "operational_status" "tenant"."AssetOperationalStatus" NOT NULL DEFAULT 'not_monitored',
    "technical_coverage" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."service_assets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "service_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."asset_provisionings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "automated_capability_id" UUID NOT NULL,
    "connection_status" TEXT NOT NULL,
    "last_validated_at" TIMESTAMP(3),
    "technical_coverage" TEXT NOT NULL,
    "encrypted_credentials" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "asset_provisionings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_company_id_key" ON "tenant"."organizations"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "regulations_code_key" ON "catalog"."regulations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_regulations_organization_id_regulation_id_key" ON "tenant"."organization_regulations"("organization_id", "regulation_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_trust_criteria_service_id_trust_criterion_id_key" ON "tenant"."service_trust_criteria"("service_id", "trust_criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_descriptions_service_id_key" ON "tenant"."system_descriptions"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_risks_service_id_risk_id_key" ON "tenant"."service_risks"("service_id", "risk_id");

-- CreateIndex
CREATE UNIQUE INDEX "scopes_service_id_key" ON "tenant"."scopes"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_assets_asset_id_service_id_key" ON "tenant"."service_assets"("asset_id", "service_id");

-- AddForeignKey
ALTER TABLE "tenant"."organizations" ADD CONSTRAINT "organizations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."organization_regulations" ADD CONSTRAINT "organization_regulations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tenant"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."organization_regulations" ADD CONSTRAINT "organization_regulations_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "catalog"."regulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."organization_regulations" ADD CONSTRAINT "organization_regulations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."organization_responsibles" ADD CONSTRAINT "organization_responsibles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tenant"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."organization_responsibles" ADD CONSTRAINT "organization_responsibles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."services" ADD CONSTRAINT "services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tenant"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_trust_criteria" ADD CONSTRAINT "service_trust_criteria_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_trust_criteria" ADD CONSTRAINT "service_trust_criteria_trust_criterion_id_fkey" FOREIGN KEY ("trust_criterion_id") REFERENCES "catalog"."trust_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_trust_criteria" ADD CONSTRAINT "service_trust_criteria_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_frameworks" ADD CONSTRAINT "service_frameworks_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "catalog"."frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_frameworks" ADD CONSTRAINT "service_frameworks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_frameworks" ADD CONSTRAINT "service_frameworks_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "catalog"."catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_frameworks" ADD CONSTRAINT "service_frameworks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."subservice_organizations" ADD CONSTRAINT "subservice_organizations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."subservice_organizations" ADD CONSTRAINT "subservice_organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."csocs" ADD CONSTRAINT "csocs_subservice_organization_id_fkey" FOREIGN KEY ("subservice_organization_id") REFERENCES "tenant"."subservice_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."csocs" ADD CONSTRAINT "csocs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."cuecs" ADD CONSTRAINT "cuecs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."cuecs" ADD CONSTRAINT "cuecs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."system_descriptions" ADD CONSTRAINT "system_descriptions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."system_descriptions" ADD CONSTRAINT "system_descriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_risks" ADD CONSTRAINT "service_risks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_risks" ADD CONSTRAINT "service_risks_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_risks" ADD CONSTRAINT "service_risks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."scopes" ADD CONSTRAINT "scopes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."scopes" ADD CONSTRAINT "scopes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tenant"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "tenant"."organization_responsibles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_assets" ADD CONSTRAINT "service_assets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_assets" ADD CONSTRAINT "service_assets_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."service_assets" ADD CONSTRAINT "service_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_provisionings" ADD CONSTRAINT "asset_provisionings_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_provisionings" ADD CONSTRAINT "asset_provisionings_automated_capability_id_fkey" FOREIGN KEY ("automated_capability_id") REFERENCES "catalog"."automated_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_provisionings" ADD CONSTRAINT "asset_provisionings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
