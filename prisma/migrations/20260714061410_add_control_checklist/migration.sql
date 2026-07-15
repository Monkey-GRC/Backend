-- CreateEnum
CREATE TYPE "ChecklistOs" AS ENUM ('UBUNTU', 'WINDOWS');

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

-- CreateIndex
CREATE UNIQUE INDEX "mnk_control_checks_control_id_check_id_key" ON "mnk_control_checks"("control_id", "check_id");

-- AddForeignKey
ALTER TABLE "mnk_control_checks" ADD CONSTRAINT "mnk_control_checks_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
