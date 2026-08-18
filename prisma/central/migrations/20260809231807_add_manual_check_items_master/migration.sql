/*
  Warnings:

  - You are about to drop the column `cis_code` on the `mnk_control_checks` table. All the data in the column will be lost.
  - You are about to drop the column `pci_dss_code` on the `mnk_control_checks` table. All the data in the column will be lost.
  - You are about to drop the column `soc2_code` on the `mnk_control_checks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ManualCheckStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "mnk_control_checks" DROP COLUMN "cis_code",
DROP COLUMN "pci_dss_code",
DROP COLUMN "soc2_code";

-- CreateTable
CREATE TABLE "mnk_manual_check_items" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "remediation" TEXT,
    "seq" SERIAL NOT NULL,
    "status" "ManualCheckStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "evaluated_by" UUID,
    "evaluated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "mnk_manual_check_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_manual_check_evidence" (
    "id" UUID NOT NULL,
    "manual_check_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mnk_manual_check_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnk_manual_check_items_seq_key" ON "mnk_manual_check_items"("seq");

-- CreateIndex
CREATE INDEX "mnk_manual_check_items_control_id_idx" ON "mnk_manual_check_items"("control_id");

-- CreateIndex
CREATE INDEX "mnk_manual_check_evidence_manual_check_id_idx" ON "mnk_manual_check_evidence"("manual_check_id");

-- AddForeignKey
ALTER TABLE "mnk_manual_check_items" ADD CONSTRAINT "mnk_manual_check_items_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_manual_check_items" ADD CONSTRAINT "mnk_manual_check_items_evaluated_by_fkey" FOREIGN KEY ("evaluated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_manual_check_items" ADD CONSTRAINT "mnk_manual_check_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_manual_check_evidence" ADD CONSTRAINT "mnk_manual_check_evidence_manual_check_id_fkey" FOREIGN KEY ("manual_check_id") REFERENCES "mnk_manual_check_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_manual_check_evidence" ADD CONSTRAINT "mnk_manual_check_evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
