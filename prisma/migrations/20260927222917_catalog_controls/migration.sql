-- CreateEnum
CREATE TYPE "catalog"."Dimension" AS ENUM ('policy', 'server', 'database', 'app', 'cloud');

-- CreateEnum
CREATE TYPE "catalog"."ControlDimensionType" AS ENUM ('manual', 'automated', 'hybrid', 'technical_manual');

-- CreateTable
CREATE TABLE "catalog"."controls" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source_ref" TEXT,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."point_of_focus_controls" (
    "id" UUID NOT NULL,
    "point_of_focus_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,

    CONSTRAINT "point_of_focus_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_dimensions" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "dimension" "catalog"."Dimension" NOT NULL,
    "type" "catalog"."ControlDimensionType" NOT NULL,
    "requires_probe" BOOLEAN NOT NULL DEFAULT false,
    "requires_ai" BOOLEAN NOT NULL DEFAULT false,
    "requires_compliance_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "reason_not_applicable" TEXT,

    CONSTRAINT "control_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_measurements" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "dimension" "catalog"."Dimension" NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "formula" TEXT NOT NULL,

    CONSTRAINT "control_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."policies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "approval_status" TEXT NOT NULL,
    "valid_until" DATE NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_policies" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,

    CONSTRAINT "control_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "point_of_focus_controls_point_of_focus_id_control_id_key" ON "catalog"."point_of_focus_controls"("point_of_focus_id", "control_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_dimensions_control_id_dimension_key" ON "catalog"."control_dimensions"("control_id", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "control_measurements_control_id_dimension_key" ON "catalog"."control_measurements"("control_id", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "control_policies_control_id_policy_id_key" ON "catalog"."control_policies"("control_id", "policy_id");

-- AddForeignKey
ALTER TABLE "catalog"."point_of_focus_controls" ADD CONSTRAINT "point_of_focus_controls_point_of_focus_id_fkey" FOREIGN KEY ("point_of_focus_id") REFERENCES "catalog"."points_of_focus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."point_of_focus_controls" ADD CONSTRAINT "point_of_focus_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_dimensions" ADD CONSTRAINT "control_dimensions_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_measurements" ADD CONSTRAINT "control_measurements_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_policies" ADD CONSTRAINT "control_policies_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_policies" ADD CONSTRAINT "control_policies_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "catalog"."policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
