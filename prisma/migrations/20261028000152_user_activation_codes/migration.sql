-- D95, D96 · Cuentas que crea el administrador de la empresa (funcional y auditor): nacen `pending` y se activan con un código de un solo uso.

-- AlterEnum
ALTER TYPE "platform"."user_status" ADD VALUE 'pending';

-- CreateTable
CREATE TABLE "platform"."user_activation_codes" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "status" "platform"."access_key_status" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activation_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_activation_codes_code_hash_key" ON "platform"."user_activation_codes"("code_hash");

-- CreateIndex
CREATE INDEX "user_activation_codes_company_id_idx" ON "platform"."user_activation_codes"("company_id");

-- CreateIndex
CREATE INDEX "user_activation_codes_user_id_idx" ON "platform"."user_activation_codes"("user_id");

-- AddForeignKey
ALTER TABLE "platform"."user_activation_codes" ADD CONSTRAINT "user_activation_codes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_activation_codes" ADD CONSTRAINT "user_activation_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_activation_codes" ADD CONSTRAINT "user_activation_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;