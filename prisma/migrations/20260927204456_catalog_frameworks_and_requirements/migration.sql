-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateEnum
CREATE TYPE "catalog"."TrustCriterionCode" AS ENUM ('security', 'availability', 'confidentiality', 'integrity', 'privacy');

-- CreateTable
CREATE TABLE "catalog"."frameworks" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scope_description" TEXT NOT NULL,

    CONSTRAINT "frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."trust_criteria" (
    "id" UUID NOT NULL,
    "criterion" "catalog"."TrustCriterionCode" NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL,

    CONSTRAINT "trust_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."requirements" (
    "id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "trust_criterion_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "tsc_category" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "criterion" TEXT NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."points_of_focus" (
    "id" UUID NOT NULL,
    "requirement_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "points_of_focus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."requirement_relations" (
    "id" UUID NOT NULL,
    "source_requirement_id" UUID NOT NULL,
    "related_requirement_id" UUID NOT NULL,

    CONSTRAINT "requirement_relations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "catalog"."requirements" ADD CONSTRAINT "requirements_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "catalog"."frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requirements" ADD CONSTRAINT "requirements_trust_criterion_id_fkey" FOREIGN KEY ("trust_criterion_id") REFERENCES "catalog"."trust_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."points_of_focus" ADD CONSTRAINT "points_of_focus_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "catalog"."requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requirement_relations" ADD CONSTRAINT "requirement_relations_source_requirement_id_fkey" FOREIGN KEY ("source_requirement_id") REFERENCES "catalog"."requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."requirement_relations" ADD CONSTRAINT "requirement_relations_related_requirement_id_fkey" FOREIGN KEY ("related_requirement_id") REFERENCES "catalog"."requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
