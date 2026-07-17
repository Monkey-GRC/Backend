-- AlterTable
ALTER TABLE "mnk_risks" ADD COLUMN     "template_id" UUID;

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

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risk_reasons_risk_id_reason_id_key" ON "mnk_risk_reasons"("risk_id", "reason_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reason_controls_reason_id_control_id_key" ON "mnk_reason_controls"("reason_id", "control_id");

-- CreateIndex
CREATE INDEX "mnk_risks_template_id_idx" ON "mnk_risks"("template_id");

-- AddForeignKey
ALTER TABLE "mnk_risk_reasons" ADD CONSTRAINT "mnk_risk_reasons_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "mnk_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risk_reasons" ADD CONSTRAINT "mnk_risk_reasons_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "mnk_reasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reason_controls" ADD CONSTRAINT "mnk_reason_controls_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "mnk_reasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reason_controls" ADD CONSTRAINT "mnk_reason_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "mnk_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "mnk_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
