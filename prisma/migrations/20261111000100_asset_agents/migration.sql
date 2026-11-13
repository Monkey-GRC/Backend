-- El vínculo servidor ↔ agente de la sonda (D112, cierra DT-32 al construirse). Solo cambio de schema; el RLS va en la migración siguiente
-- (schema-implementacion.md §7). Aditiva: no toca ninguna tabla existente.

-- CreateEnum
CREATE TYPE "tenant"."asset_agent_status" AS ENUM ('pending', 'connected', 'disconnected', 'removed');

-- CreateTable
CREATE TABLE "tenant"."asset_agents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "sca_policy_id" UUID NOT NULL,
    "agent_id" TEXT,
    "status" "tenant"."asset_agent_status" NOT NULL DEFAULT 'pending',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_seen_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "asset_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_agents_asset_id_key" ON "tenant"."asset_agents"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_agents_agent_id_key" ON "tenant"."asset_agents"("agent_id");

-- CreateIndex
CREATE INDEX "asset_agents_tenant_id_idx" ON "tenant"."asset_agents"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_agents_sca_policy_id_idx" ON "tenant"."asset_agents"("sca_policy_id");

-- AddForeignKey
ALTER TABLE "tenant"."asset_agents" ADD CONSTRAINT "asset_agents_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tenant"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_agents" ADD CONSTRAINT "asset_agents_sca_policy_id_fkey" FOREIGN KEY ("sca_policy_id") REFERENCES "catalog"."sca_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."asset_agents" ADD CONSTRAINT "asset_agents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SQL a mano: el identificador del agente, cuando existe, tiene la forma que le da la sonda (tres o más dígitos). Una forma rara nunca debería llegar a una ruta de
-- su API. Nulo es válido: el servidor se declara antes de que Monkey cree su agente.
ALTER TABLE "tenant"."asset_agents" ADD CONSTRAINT "asset_agents_agent_id_format" CHECK ("agent_id" IS NULL OR "agent_id" ~ '^[0-9]{3,8}$');
