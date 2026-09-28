/*
  Warnings:

  - The `years_in_operation` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `incorporation_countries` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `client_countries` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `industries_served` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `active_client_count` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `countries` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `data_types` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `previous_certification` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `size` on the `organizations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `industry` on the `organizations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `business_model` on the `organizations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `compliance_maturity` on the `organizations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `services` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expected_availability` on the `services` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `deployment_scenario` on the `services` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tenant"."OrganizationSize" AS ENUM ('from_10_to_50', 'from_51_to_200', 'from_201_to_500', 'from_501_to_1000', 'from_1001_to_2000', 'from_2001_to_5000', 'more_than_5000');

-- CreateEnum
CREATE TYPE "tenant"."Industry" AS ENUM ('financial_banking', 'fintech', 'healthcare', 'technology_saas', 'bpo_outsourcing', 'telecommunications', 'retail_ecommerce', 'manufacturing', 'government', 'education', 'insurance', 'logistics', 'energy_utilities', 'other');

-- CreateEnum
CREATE TYPE "tenant"."BusinessModel" AS ENUM ('bpo_kpo_ito', 'call_contact_center', 'data_center', 'ai_ml', 'service_desk', 'saas_paas_iaas', 'fintech_payments', 'banking', 'insurance', 'marketplace_ecommerce', 'software_factory', 'consulting', 'telecommunications', 'logistics', 'healthcare', 'edtech', 'manufacturing', 'government', 'other');

-- CreateEnum
CREATE TYPE "tenant"."YearsInOperation" AS ENUM ('less_than_1', 'from_1_to_3', 'from_3_to_5', 'from_5_to_10', 'more_than_10');

-- CreateEnum
CREATE TYPE "tenant"."IncorporationCountry" AS ENUM ('co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'other');

-- CreateEnum
CREATE TYPE "tenant"."ClientCountry" AS ENUM ('co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'eu', 'other');

-- CreateEnum
CREATE TYPE "tenant"."ComplianceMaturity" AS ENUM ('none', 'initial_ad_hoc', 'implementing', 'defined', 'managed_certified');

-- CreateEnum
CREATE TYPE "tenant"."ServiceType" AS ENUM ('saas', 'bpo', 'call_center', 'data_center', 'ai_services', 'specialized_with_data_intervention', 'service_desk', 'managed_services', 'consulting', 'development', 'other');

-- CreateEnum
CREATE TYPE "tenant"."ServedIndustry" AS ENUM ('financial', 'healthcare', 'retail', 'technology', 'government', 'education', 'manufacturing', 'telecommunications', 'energy', 'logistics', 'other');

-- CreateEnum
CREATE TYPE "tenant"."ActiveClientCount" AS ENUM ('from_1_to_10', 'from_11_to_50', 'from_51_to_200', 'from_201_to_1000', 'more_than_1000');

-- CreateEnum
CREATE TYPE "tenant"."ServiceCountry" AS ENUM ('co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'uy', 'py', 'bo', 've', 'cr', 'pa', 'gt', 'us', 'ca', 'es', 'pt', 'gb', 'de', 'fr', 'eu', 'latam', 'global');

-- CreateEnum
CREATE TYPE "tenant"."DataType" AS ENUM ('pii', 'payment', 'phi', 'business', 'files', 'logs', 'credentials', 'biometric');

-- CreateEnum
CREATE TYPE "tenant"."ExpectedAvailability" AS ENUM ('24x7', 'business_hours', 'on_demand', 'not_applicable');

-- CreateEnum
CREATE TYPE "tenant"."DeploymentScenario" AS ENUM ('cloud_managed_only', 'cloud_with_servers', 'on_premise', 'hybrid');

-- CreateEnum
CREATE TYPE "tenant"."PreviousCertification" AS ENUM ('soc2', 'soc1', 'iso27001', 'none');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "tenant"."SubserviceProviderType" ADD VALUE 'mobile';
ALTER TYPE "tenant"."SubserviceProviderType" ADD VALUE 'other';

-- AlterTable
ALTER TABLE "tenant"."organizations" DROP COLUMN "size",
ADD COLUMN     "size" "tenant"."OrganizationSize" NOT NULL,
DROP COLUMN "industry",
ADD COLUMN     "industry" "tenant"."Industry" NOT NULL,
DROP COLUMN "business_model",
ADD COLUMN     "business_model" "tenant"."BusinessModel" NOT NULL,
DROP COLUMN "years_in_operation",
ADD COLUMN     "years_in_operation" "tenant"."YearsInOperation",
DROP COLUMN "incorporation_countries",
ADD COLUMN     "incorporation_countries" "tenant"."IncorporationCountry"[],
DROP COLUMN "client_countries",
ADD COLUMN     "client_countries" "tenant"."ClientCountry"[],
DROP COLUMN "compliance_maturity",
ADD COLUMN     "compliance_maturity" "tenant"."ComplianceMaturity" NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."services" DROP COLUMN "type",
ADD COLUMN     "type" "tenant"."ServiceType" NOT NULL,
DROP COLUMN "industries_served",
ADD COLUMN     "industries_served" "tenant"."ServedIndustry"[],
DROP COLUMN "active_client_count",
ADD COLUMN     "active_client_count" "tenant"."ActiveClientCount",
DROP COLUMN "countries",
ADD COLUMN     "countries" "tenant"."ServiceCountry"[],
DROP COLUMN "data_types",
ADD COLUMN     "data_types" "tenant"."DataType"[],
DROP COLUMN "expected_availability",
ADD COLUMN     "expected_availability" "tenant"."ExpectedAvailability" NOT NULL,
DROP COLUMN "deployment_scenario",
ADD COLUMN     "deployment_scenario" "tenant"."DeploymentScenario" NOT NULL,
DROP COLUMN "previous_certification",
ADD COLUMN     "previous_certification" "tenant"."PreviousCertification";
