-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateEnum
CREATE TYPE "platform"."IsolationStrategy" AS ENUM ('dedicated', 'shared');

-- CreateEnum
CREATE TYPE "platform"."CompanyStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "platform"."AccessKeyStatus" AS ENUM ('pending', 'used', 'expired', 'revoked');

-- CreateTable
CREATE TABLE "platform"."companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "admin_email" TEXT NOT NULL,
    "isolation_strategy" "platform"."IsolationStrategy" NOT NULL DEFAULT 'shared',
    "status" "platform"."CompanyStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."access_keys" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "status" "platform"."AccessKeyStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "access_keys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform"."access_keys" ADD CONSTRAINT "access_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
