-- D94 · Segundo factor (TOTP) para los 5 roles. Las columnas is_mfa_enabled y mfa_secret_encrypted ya existían; esto añade el último paso de 30 s aceptado
-- (para no aceptar dos veces un mismo código), los desafíos que van entre la contraseña y la sesión, y los códigos de recuperación.

-- CreateEnum
CREATE TYPE "platform"."mfa_challenge_purpose" AS ENUM ('verify', 'setup');

-- AlterTable
ALTER TABLE "platform"."users" ADD COLUMN     "mfa_last_used_step" INTEGER;

-- CreateTable
CREATE TABLE "platform"."mfa_challenges" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "purpose" "platform"."mfa_challenge_purpose" NOT NULL,
    "pending_secret_encrypted" TEXT,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "ip_address" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."user_recovery_codes" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mfa_challenges_token_hash_key" ON "platform"."mfa_challenges"("token_hash");

-- CreateIndex
CREATE INDEX "mfa_challenges_company_id_idx" ON "platform"."mfa_challenges"("company_id");

-- CreateIndex
CREATE INDEX "mfa_challenges_user_id_idx" ON "platform"."mfa_challenges"("user_id");

-- CreateIndex
CREATE INDEX "user_recovery_codes_user_id_idx" ON "platform"."user_recovery_codes"("user_id");

-- AddForeignKey
ALTER TABLE "platform"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_recovery_codes" ADD CONSTRAINT "user_recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;