-- D96 · El equipo por dimensión: la especialidad de un funcional (user_dimensions), el responsable principal de un servicio en cada dimensión (service_dimension_owners) y la
-- dimensión en la excepción por control (user_control_assignments). Las asignaciones que ya existían eran de un control entero: cada una pasa a una fila por cada dimensión que ese control lleva (si dos personas tenían el mismo control, queda la más antigua).

-- DropIndex
DROP INDEX "platform"."user_control_assignments_user_id_client_control_id_key";

-- AlterTable
ALTER TABLE "platform"."user_control_assignments" ADD COLUMN     "dimension" "catalog"."dimension";

-- Lo que había era «el control entero»: se expande a una fila por dimensión, y de dos personas en el mismo control queda la asignada primero.
INSERT INTO "platform"."user_control_assignments" ("id", "company_id", "user_id", "client_control_id", "dimension", "assigned_by", "assigned_at")
SELECT DISTINCT ON (a."client_control_id", d."dimension") gen_random_uuid(), a."company_id", a."user_id", a."client_control_id", d."dimension", a."assigned_by", a."assigned_at"
FROM "platform"."user_control_assignments" a
JOIN "tenant"."client_control_dimensions" d ON d."client_control_id" = a."client_control_id"
WHERE a."dimension" IS NULL
ORDER BY a."client_control_id", d."dimension", a."assigned_at";
DELETE FROM "platform"."user_control_assignments" WHERE "dimension" IS NULL;
ALTER TABLE "platform"."user_control_assignments" ALTER COLUMN "dimension" SET NOT NULL;

-- CreateTable
CREATE TABLE "platform"."user_dimensions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "dimension" "catalog"."dimension" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."service_dimension_owners" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "dimension" "catalog"."dimension" NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_dimension_owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_dimensions_company_id_idx" ON "platform"."user_dimensions"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_dimensions_user_id_dimension_key" ON "platform"."user_dimensions"("user_id", "dimension");

-- CreateIndex
CREATE INDEX "service_dimension_owners_company_id_idx" ON "platform"."service_dimension_owners"("company_id");

-- CreateIndex
CREATE INDEX "service_dimension_owners_user_id_idx" ON "platform"."service_dimension_owners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_dimension_owners_service_id_dimension_key" ON "platform"."service_dimension_owners"("service_id", "dimension");

-- CreateIndex
CREATE INDEX "user_control_assignments_user_id_idx" ON "platform"."user_control_assignments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_control_assignments_client_control_id_dimension_key" ON "platform"."user_control_assignments"("client_control_id", "dimension");

-- AddForeignKey
ALTER TABLE "platform"."user_dimensions" ADD CONSTRAINT "user_dimensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_dimensions" ADD CONSTRAINT "user_dimensions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."service_dimension_owners" ADD CONSTRAINT "service_dimension_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."service_dimension_owners" ADD CONSTRAINT "service_dimension_owners_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."service_dimension_owners" ADD CONSTRAINT "service_dimension_owners_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "tenant"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."service_dimension_owners" ADD CONSTRAINT "service_dimension_owners_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
