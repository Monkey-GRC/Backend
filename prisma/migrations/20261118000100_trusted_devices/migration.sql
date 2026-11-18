-- D123 · Dispositivos recordados (MD-217, SEG-84): `platform.trusted_devices`. Solo el schema; RLS va aparte (20261118000200_rls_trusted_devices).
-- Reversa: DROP TABLE platform.trusted_devices (la gente vuelve a ver su código en cada ingreso).

-- CreateTable
CREATE TABLE "platform"."trusted_devices" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "ip_address" TEXT NOT NULL,
    "country" CHAR(2),
    "city" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trusted_devices_token_hash_key" ON "platform"."trusted_devices"("token_hash");

-- CreateIndex
CREATE INDEX "trusted_devices_company_id_idx" ON "platform"."trusted_devices"("company_id");

-- CreateIndex
CREATE INDEX "trusted_devices_user_id_idx" ON "platform"."trusted_devices"("user_id");

-- AddForeignKey
ALTER TABLE "platform"."trusted_devices" ADD CONSTRAINT "trusted_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."trusted_devices" ADD CONSTRAINT "trusted_devices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
