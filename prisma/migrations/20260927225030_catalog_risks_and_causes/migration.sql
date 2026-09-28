-- CreateEnum
CREATE TYPE "catalog"."FailureCategory" AS ENUM ('human_resource', 'infrastructure');

-- CreateTable
CREATE TABLE "catalog"."risks" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trust_criterion" TEXT NOT NULL,
    "potential_impact" JSONB NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "inherent_risk_value" INTEGER NOT NULL,
    "inherent_risk_level" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."causes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "failure_category" "catalog"."FailureCategory" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."risk_causes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "risk_id" UUID NOT NULL,
    "cause_id" UUID NOT NULL,

    CONSTRAINT "risk_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."cause_controls" (
    "id" UUID NOT NULL,
    "cause_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,

    CONSTRAINT "cause_controls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "risks_code_key" ON "catalog"."risks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "causes_code_key" ON "catalog"."causes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "risk_causes_code_key" ON "catalog"."risk_causes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "risk_causes_risk_id_cause_id_key" ON "catalog"."risk_causes"("risk_id", "cause_id");

-- CreateIndex
CREATE UNIQUE INDEX "cause_controls_cause_id_control_id_key" ON "catalog"."cause_controls"("cause_id", "control_id");

-- AddForeignKey
ALTER TABLE "catalog"."risk_causes" ADD CONSTRAINT "risk_causes_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "catalog"."risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."risk_causes" ADD CONSTRAINT "risk_causes_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "catalog"."causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."cause_controls" ADD CONSTRAINT "cause_controls_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "catalog"."causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."cause_controls" ADD CONSTRAINT "cause_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
