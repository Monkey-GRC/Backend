-- Catálogo v2 (MD-491): una categoría de integración cita uno o varios procedimientos estándar («PE-INT-01; PE-ACC-01»), así que el FK único pasa a una tabla N:M.
CREATE TABLE "catalog"."integration_category_procedures" (
    "id" UUID NOT NULL,
    "integration_category_id" UUID NOT NULL,
    "standard_procedure_id" UUID NOT NULL,

    CONSTRAINT "integration_category_procedures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "integration_category_procedures_standard_procedure_id_idx" ON "catalog"."integration_category_procedures"("standard_procedure_id");
CREATE UNIQUE INDEX "integration_category_procedures_integration_category_id_sta_key" ON "catalog"."integration_category_procedures"("integration_category_id", "standard_procedure_id");

ALTER TABLE "catalog"."integration_category_procedures" ADD CONSTRAINT "integration_category_procedures_integration_category_id_fkey" FOREIGN KEY ("integration_category_id") REFERENCES "catalog"."integration_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "catalog"."integration_category_procedures" ADD CONSTRAINT "integration_category_procedures_standard_procedure_id_fkey" FOREIGN KEY ("standard_procedure_id") REFERENCES "catalog"."standard_procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Lo que ya estaba cargado con el FK único (el primer procedimiento de cada categoría) se conserva.
INSERT INTO "catalog"."integration_category_procedures" ("id", "integration_category_id", "standard_procedure_id")
SELECT gen_random_uuid(), c."id", p."id"
FROM "catalog"."integration_categories" c
JOIN "catalog"."standard_procedures" p ON p."code" = c."procedure_code";

ALTER TABLE "catalog"."integration_categories" DROP CONSTRAINT "integration_categories_procedure_code_fkey";
DROP INDEX "catalog"."integration_categories_procedure_code_idx";
ALTER TABLE "catalog"."integration_categories" DROP COLUMN "procedure_code";
