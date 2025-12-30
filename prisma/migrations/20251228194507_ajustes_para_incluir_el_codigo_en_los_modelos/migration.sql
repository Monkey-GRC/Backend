/*
  Warnings:

  - A unique constraint covering the columns `[seq]` on the table `mnk_clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seq]` on the table `mnk_controls` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seq]` on the table `mnk_reasons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seq]` on the table `mnk_risks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seq]` on the table `mnk_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `mnk_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seq]` on the table `mnk_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `mnk_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mnk_clients" ADD COLUMN     "seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "mnk_controls" ADD COLUMN     "seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "mnk_reasons" ADD COLUMN     "seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "mnk_risks" ADD COLUMN     "seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "mnk_templates" ADD COLUMN     "code" VARCHAR(10) NOT NULL,
ADD COLUMN     "seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "mnk_users" ADD COLUMN     "seq" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "mnk_clients_seq_key" ON "mnk_clients"("seq");

-- CreateIndex
CREATE INDEX "mnk_clients_tax_id_idx" ON "mnk_clients"("tax_id");

-- CreateIndex
CREATE INDEX "mnk_clients_seq_idx" ON "mnk_clients"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_controls_seq_key" ON "mnk_controls"("seq");

-- CreateIndex
CREATE INDEX "mnk_controls_seq_idx" ON "mnk_controls"("seq");

-- CreateIndex
CREATE INDEX "mnk_controls_code_idx" ON "mnk_controls"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reasons_seq_key" ON "mnk_reasons"("seq");

-- CreateIndex
CREATE INDEX "mnk_reasons_seq_idx" ON "mnk_reasons"("seq");

-- CreateIndex
CREATE INDEX "mnk_reasons_code_idx" ON "mnk_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risks_seq_key" ON "mnk_risks"("seq");

-- CreateIndex
CREATE INDEX "mnk_risks_seq_idx" ON "mnk_risks"("seq");

-- CreateIndex
CREATE INDEX "mnk_risks_code_idx" ON "mnk_risks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_seq_key" ON "mnk_templates"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_code_key" ON "mnk_templates"("code");

-- CreateIndex
CREATE INDEX "mnk_templates_seq_idx" ON "mnk_templates"("seq");

-- CreateIndex
CREATE INDEX "mnk_templates_code_idx" ON "mnk_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_seq_key" ON "mnk_users"("seq");

-- CreateIndex
CREATE INDEX "mnk_users_email_idx" ON "mnk_users"("email");

-- CreateIndex
CREATE INDEX "mnk_users_username_idx" ON "mnk_users"("username");

-- CreateIndex
CREATE INDEX "mnk_users_seq_idx" ON "mnk_users"("seq");
