-- MD-498 · El requisito del control del cliente (modelo-datos.md §7.0). Migración aditiva: no toca ninguna tabla existente.

-- CreateTable
CREATE TABLE "tenant"."client_control_requirements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "control_requirement_id" UUID NOT NULL,
    "periodicity" "catalog"."periodicity",
    "is_applicable" BOOLEAN NOT NULL DEFAULT true,
    "not_applicable_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_control_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_control_requirements_tenant_id_idx" ON "tenant"."client_control_requirements"("tenant_id");

-- CreateIndex
CREATE INDEX "client_control_requirements_control_requirement_id_idx" ON "tenant"."client_control_requirements"("control_requirement_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_control_requirements_client_control_id_control_requi_key" ON "tenant"."client_control_requirements"("client_control_id", "control_requirement_id");

-- AddForeignKey
ALTER TABLE "tenant"."client_control_requirements" ADD CONSTRAINT "client_control_requirements_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_requirements" ADD CONSTRAINT "client_control_requirements_control_requirement_id_fkey" FOREIGN KEY ("control_requirement_id") REFERENCES "catalog"."control_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_requirements" ADD CONSTRAINT "client_control_requirements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Los servicios que ya clonaron sus controles reciben una fila por cada requisito de cada control del catálogo (los nuevos la reciben al clonar).
INSERT INTO "tenant"."client_control_requirements" ("id", "tenant_id", "client_control_id", "control_requirement_id", "periodicity", "is_applicable")
SELECT gen_random_uuid(), cc."tenant_id", cc."id", cr."id", cr."periodicity", true
  FROM "tenant"."client_controls" cc
  JOIN "catalog"."control_requirements" cr ON cr."control_id" = cc."control_id"
ON CONFLICT DO NOTHING;
