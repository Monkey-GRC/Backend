-- CreateEnum
CREATE TYPE "tenant"."ExecutionOrigin" AS ENUM ('scheduled', 'manual');

-- CreateEnum
CREATE TYPE "tenant"."CheckResultStatus" AS ENUM ('passed', 'failed', 'invalid', 'not_applicable', 'not_run');

-- CreateEnum
CREATE TYPE "tenant"."ExecutionLogLevel" AS ENUM ('info', 'warn', 'error');

-- CreateTable
CREATE TABLE "tenant"."schedule_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rule" TEXT NOT NULL,
    "applies_to" TEXT NOT NULL,
    "affected_asset_count" INTEGER NOT NULL,
    "next_run_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."executions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "schedule_rule_id" UUID,
    "retry_of_id" UUID,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "origin" "tenant"."ExecutionOrigin" NOT NULL,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."check_results" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "execution_id" UUID NOT NULL,
    "check_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "raw_check_id" TEXT NOT NULL,
    "result" "tenant"."CheckResultStatus" NOT NULL,
    "evaluated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."execution_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "execution_id" UUID NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "level" "tenant"."ExecutionLogLevel" NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "executions_asset_id_started_at_idx" ON "tenant"."executions"("asset_id", "started_at");

-- CreateIndex
CREATE INDEX "check_results_execution_id_idx" ON "tenant"."check_results"("execution_id");

-- CreateIndex
CREATE INDEX "check_results_check_id_idx" ON "tenant"."check_results"("check_id");

-- CreateIndex
CREATE INDEX "execution_logs_execution_id_logged_at_idx" ON "tenant"."execution_logs"("execution_id", "logged_at");

-- AddForeignKey
ALTER TABLE "tenant"."schedule_rules" ADD CONSTRAINT "schedule_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."executions" ADD CONSTRAINT "executions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."executions" ADD CONSTRAINT "executions_schedule_rule_id_fkey" FOREIGN KEY ("schedule_rule_id") REFERENCES "tenant"."schedule_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."executions" ADD CONSTRAINT "executions_retry_of_id_fkey" FOREIGN KEY ("retry_of_id") REFERENCES "tenant"."executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."executions" ADD CONSTRAINT "executions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."check_results" ADD CONSTRAINT "check_results_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "tenant"."executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."check_results" ADD CONSTRAINT "check_results_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "catalog"."checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."check_results" ADD CONSTRAINT "check_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."execution_logs" ADD CONSTRAINT "execution_logs_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "tenant"."executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."execution_logs" ADD CONSTRAINT "execution_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
