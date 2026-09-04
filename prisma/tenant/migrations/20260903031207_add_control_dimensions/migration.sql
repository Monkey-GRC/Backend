-- CreateEnum
CREATE TYPE "ControlDimension" AS ENUM ('POLICY', 'SERVER', 'DATABASE', 'CLOUD', 'APP');

-- AlterTable
ALTER TABLE "mnk_assets" ADD COLUMN     "wazuh_policy_id" TEXT;

-- AlterTable
ALTER TABLE "mnk_control_checks" ADD COLUMN     "dimension" "ControlDimension" NOT NULL DEFAULT 'SERVER';

-- AlterTable
ALTER TABLE "mnk_manual_check_items" ADD COLUMN     "dimension" "ControlDimension" NOT NULL DEFAULT 'POLICY';

-- CreateTable
CREATE TABLE "mnk_control_dimension_requirements" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "dimension" "ControlDimension" NOT NULL,
    "type" "ControlType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mnk_control_dimension_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnk_control_dimension_requirements_control_id_dimension_key" ON "mnk_control_dimension_requirements"("control_id", "dimension");

-- AddForeignKey
ALTER TABLE "mnk_control_dimension_requirements" ADD CONSTRAINT "mnk_control_dimension_requirements_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
