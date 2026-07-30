-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('E_COMMERCE', 'FINTECH', 'SAAS', 'HEALTHTECH', 'OTHER');

-- CreateEnum
CREATE TYPE "ControlType" AS ENUM ('MANUAL', 'AUTOMATIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "ChecklistOs" AS ENUM ('UBUNTU', 'WINDOWS');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT_ADMIN', 'USER', 'VIEWER', 'MONKEY_ADMIN');

-- CreateTable
CREATE TABLE "mnk_company_profile" (
    "id" UUID NOT NULL,
    "business_type" "BusinessType",
    "server_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mnk_company_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_controls" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seq" SERIAL NOT NULL,
    "type" "ControlType" NOT NULL DEFAULT 'MANUAL',
    "objective" TEXT,
    "code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_control_checks" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "check_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "os" "ChecklistOs" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mnk_control_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_reasons" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" VARCHAR(10) NOT NULL,
    "seq" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_risk_reasons" (
    "id" UUID NOT NULL,
    "risk_id" UUID NOT NULL,
    "reason_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mnk_risk_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_reason_controls" (
    "id" UUID NOT NULL,
    "reason_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mnk_reason_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_risks" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seq" SERIAL NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "impact" INTEGER NOT NULL,
    "probability" INTEGER NOT NULL,
    "level" "RiskLevel" NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "template_id" UUID,

    CONSTRAINT "mnk_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "scope" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seq" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "source_template_id" UUID,
    "adopted_at" TIMESTAMP(3),

    CONSTRAINT "mnk_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "last_name" TEXT,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "seq" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "refresh_token_hash" TEXT,
    "refresh_token_expires_at" TIMESTAMP(3),

    CONSTRAINT "mnk_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnk_controls_seq_key" ON "mnk_controls"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_controls_code_key" ON "mnk_controls"("code");

-- CreateIndex
CREATE INDEX "mnk_controls_seq_idx" ON "mnk_controls"("seq");

-- CreateIndex
CREATE INDEX "mnk_controls_code_idx" ON "mnk_controls"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_control_checks_control_id_check_id_key" ON "mnk_control_checks"("control_id", "check_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reasons_code_key" ON "mnk_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reasons_seq_key" ON "mnk_reasons"("seq");

-- CreateIndex
CREATE INDEX "mnk_reasons_seq_idx" ON "mnk_reasons"("seq");

-- CreateIndex
CREATE INDEX "mnk_reasons_code_idx" ON "mnk_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risk_reasons_risk_id_reason_id_key" ON "mnk_risk_reasons"("risk_id", "reason_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reason_controls_reason_id_control_id_key" ON "mnk_reason_controls"("reason_id", "control_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risks_seq_key" ON "mnk_risks"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risks_code_key" ON "mnk_risks"("code");

-- CreateIndex
CREATE INDEX "mnk_risks_seq_idx" ON "mnk_risks"("seq");

-- CreateIndex
CREATE INDEX "mnk_risks_code_idx" ON "mnk_risks"("code");

-- CreateIndex
CREATE INDEX "mnk_risks_template_id_idx" ON "mnk_risks"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_slug_key" ON "mnk_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_seq_key" ON "mnk_templates"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_code_key" ON "mnk_templates"("code");

-- CreateIndex
CREATE INDEX "mnk_templates_seq_idx" ON "mnk_templates"("seq");

-- CreateIndex
CREATE INDEX "mnk_templates_code_idx" ON "mnk_templates"("code");

-- CreateIndex
CREATE INDEX "mnk_templates_source_template_id_idx" ON "mnk_templates"("source_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_email_key" ON "mnk_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_username_key" ON "mnk_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_seq_key" ON "mnk_users"("seq");

-- CreateIndex
CREATE INDEX "mnk_users_email_idx" ON "mnk_users"("email");

-- CreateIndex
CREATE INDEX "mnk_users_username_idx" ON "mnk_users"("username");

-- CreateIndex
CREATE INDEX "mnk_users_seq_idx" ON "mnk_users"("seq");

-- AddForeignKey
ALTER TABLE "mnk_controls" ADD CONSTRAINT "mnk_controls_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_controls" ADD CONSTRAINT "mnk_controls_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_control_checks" ADD CONSTRAINT "mnk_control_checks_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reasons" ADD CONSTRAINT "mnk_reasons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reasons" ADD CONSTRAINT "mnk_reasons_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risk_reasons" ADD CONSTRAINT "mnk_risk_reasons_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "mnk_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risk_reasons" ADD CONSTRAINT "mnk_risk_reasons_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "mnk_reasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reason_controls" ADD CONSTRAINT "mnk_reason_controls_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "mnk_reasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reason_controls" ADD CONSTRAINT "mnk_reason_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "mnk_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_templates" ADD CONSTRAINT "mnk_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_templates" ADD CONSTRAINT "mnk_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
