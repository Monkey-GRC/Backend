-- MD-515, D138, D143, D151 · Los avisos de cada persona, sus resúmenes diarios y la preferencia de correo. ADITIVA: dos tablas y tres enums nuevos y una columna con valor por omisión (todas las cuentas nacen con el resumen encendido).
-- CreateEnum
CREATE TYPE "platform"."notification_type" AS ENUM ('window_due_soon', 'window_expired', 'control_assigned', 'evidence_approved', 'evidence_rejected', 'observation_created', 'direct_check_failed', 'check_parameters_changed', 'automatic_evidence_stale', 'control_pending_approval', 'control_owner_approved', 'control_returned', 'document_assigned', 'document_acceptance_reminder', 'document_approval_requested', 'document_renewal_due', 'company_purge_upcoming');

-- CreateEnum
CREATE TYPE "platform"."notification_target_kind" AS ENUM ('control', 'service', 'document', 'company');

-- CreateEnum
CREATE TYPE "platform"."notification_digest_status" AS ENUM ('sending', 'sent', 'failed', 'skipped');

-- AlterTable
ALTER TABLE "platform"."users" ADD COLUMN     "is_email_digest_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "platform"."notifications" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "platform"."notification_type" NOT NULL,
    "target_kind" "platform"."notification_target_kind" NOT NULL,
    "target_id" UUID NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',
    "due_at" DATE,
    "dedupe_key" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."notification_digests" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "digest_date" DATE NOT NULL,
    "status" "platform"."notification_digest_status" NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_digests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_id_idx" ON "platform"."notifications"("user_id", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "notifications_company_id_created_at_idx" ON "platform"."notifications"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_dedupe_key_key" ON "platform"."notifications"("user_id", "dedupe_key");

-- CreateIndex
CREATE INDEX "notification_digests_company_id_idx" ON "platform"."notification_digests"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_digests_user_id_digest_date_key" ON "platform"."notification_digests"("user_id", "digest_date");

-- AddForeignKey
ALTER TABLE "platform"."notifications" ADD CONSTRAINT "notifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."notification_digests" ADD CONSTRAINT "notification_digests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."notification_digests" ADD CONSTRAINT "notification_digests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

