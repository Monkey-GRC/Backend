-- Componente 2 del onboarding (Contexto del Servicio). Tres ajustes para que el schema diga lo
-- mismo que contracts/modules/onboarding-service-context.md (D41):
--   1. services.deployment_scenario pasa a nullable: se captura en el Componente 3, después de
--      declarar el servicio, así que no puede ser obligatorio al crearlo.
--   2. subservice_organizations: provider / service_provided / responsibility pasan a nullable; el
--      "detalle" del Excel es opcional y solo el tipo es obligatorio.
--   3. service_regulations: regulaciones por servicio (el contrato las pide en el request).

ALTER TABLE "tenant"."services" ALTER COLUMN "deployment_scenario" DROP NOT NULL;

ALTER TABLE "tenant"."subservice_organizations"
  ALTER COLUMN "provider" DROP NOT NULL,
  ALTER COLUMN "service_provided" DROP NOT NULL,
  ALTER COLUMN "responsibility" DROP NOT NULL;

CREATE TABLE "tenant"."service_regulations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "regulation_id" UUID NOT NULL,

    CONSTRAINT "service_regulations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "service_regulations_tenant_id_idx" ON "tenant"."service_regulations"("tenant_id");
CREATE INDEX "service_regulations_regulation_id_idx" ON "tenant"."service_regulations"("regulation_id");
CREATE UNIQUE INDEX "service_regulations_service_id_regulation_id_key" ON "tenant"."service_regulations"("service_id", "regulation_id");

ALTER TABLE "tenant"."service_regulations" ADD CONSTRAINT "service_regulations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."service_regulations" ADD CONSTRAINT "service_regulations_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "catalog"."regulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."service_regulations" ADD CONSTRAINT "service_regulations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: mismo aislamiento por tenant_id que el resto de tablas del cliente (falla cerrado).
ALTER TABLE "tenant"."service_regulations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant"."service_regulations" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tenant"."service_regulations"
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
