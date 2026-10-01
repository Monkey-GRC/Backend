-- Prerrequisitos de la siembra del catálogo de SOC 2 y controles del cliente completos
-- (decisiones D35, D36 y D38). Generada con `prisma migrate diff` sobre el schema de `develop`.
--
--  Catálogo
--   * controls.domain: el dominio es del CONTROL (27 valores); en el Excel cambia dentro de un mismo
--     requisito en 41 de 61, así que no podía colgar de requirements. requirements.domain se elimina.
--   * catalog_versions.published_by opcional: la versión 1 la publica un script.
--   * tests: population_size y suggested_sample_size pasan a TEXTO (en el Excel son frases, no enteros)
--     y se agrega `exceptions` (la hoja trae EXCEPCIONES/DESVIACIONES y TRATAMIENTO DE EXCEPCIONES).
--   * evidence_templates y control_evidence_templates: de dónde se clonan las evidencias requeridas.
--
--  Escenario del cliente
--   * client_controls.control_id opcional (un control propio no tiene plantilla), is_active (baja lógica)
--     y único (service_id, control_id): el clonado es idempotente.
--   * evaluations y evidence_requirements cuelgan de client_controls, no del control del catálogo.
--   * client_control_dimensions y client_control_tests: copia por cliente de las dimensiones y del
--     vínculo control ↔ test. Los tests y control_measurements NO se clonan (D2, D36).
--   * client_causes.is_active.
--
-- ⚠️ Asume VACÍAS las tablas que altera: controls, requirements, tests, evaluations,
-- evidence_requirements, client_controls y client_causes. En dev se comprobó el 2026-09-30.

-- DropForeignKey
ALTER TABLE "tenant"."evidence_requirements" DROP CONSTRAINT "evidence_requirements_control_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."evaluations" DROP CONSTRAINT "evaluations_control_id_fkey";

-- DropIndex
DROP INDEX "tenant"."evidence_requirements_control_id_idx";

-- DropIndex
DROP INDEX "tenant"."evaluations_service_id_control_id_evaluated_at_idx";

-- DropIndex
DROP INDEX "tenant"."evaluations_control_id_idx";

-- AlterTable
ALTER TABLE "catalog"."controls" ADD COLUMN     "domain" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."requirements" DROP COLUMN "domain";

-- AlterTable
ALTER TABLE "catalog"."tests" ADD COLUMN     "exceptions" TEXT NOT NULL,
ALTER COLUMN "population_size" SET DATA TYPE TEXT,
ALTER COLUMN "suggested_sample_size" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "catalog"."catalog_versions" ALTER COLUMN "published_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."client_controls" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "control_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."evidence_requirements" DROP COLUMN "control_id",
ADD COLUMN     "client_control_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."evaluations" DROP COLUMN "control_id",
ADD COLUMN     "client_control_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."client_causes" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "catalog"."evidence_templates" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dimension" "catalog"."dimension" NOT NULL DEFAULT 'policy',

    CONSTRAINT "evidence_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."control_evidence_templates" (
    "id" UUID NOT NULL,
    "control_id" UUID NOT NULL,
    "evidence_template_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "control_evidence_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_control_dimensions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "dimension" "catalog"."dimension" NOT NULL,
    "type" "catalog"."control_dimension_type" NOT NULL,
    "requires_probe" BOOLEAN NOT NULL DEFAULT false,
    "requires_ai" BOOLEAN NOT NULL DEFAULT false,
    "requires_compliance_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "reason_not_applicable" TEXT,

    CONSTRAINT "client_control_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."client_control_tests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,

    CONSTRAINT "client_control_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evidence_templates_code_key" ON "catalog"."evidence_templates"("code");

-- CreateIndex
CREATE INDEX "control_evidence_templates_evidence_template_id_idx" ON "catalog"."control_evidence_templates"("evidence_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_evidence_templates_control_id_evidence_template_id_key" ON "catalog"."control_evidence_templates"("control_id", "evidence_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_evidence_templates_control_id_sequence_key" ON "catalog"."control_evidence_templates"("control_id", "sequence");

-- CreateIndex
CREATE INDEX "client_control_dimensions_tenant_id_idx" ON "tenant"."client_control_dimensions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_control_dimensions_client_control_id_dimension_key" ON "tenant"."client_control_dimensions"("client_control_id", "dimension");

-- CreateIndex
CREATE INDEX "client_control_tests_tenant_id_idx" ON "tenant"."client_control_tests"("tenant_id");

-- CreateIndex
CREATE INDEX "client_control_tests_test_id_idx" ON "tenant"."client_control_tests"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_control_tests_client_control_id_test_id_key" ON "tenant"."client_control_tests"("client_control_id", "test_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_controls_service_id_control_id_key" ON "tenant"."client_controls"("service_id", "control_id");

-- CreateIndex
CREATE INDEX "evidence_requirements_client_control_id_idx" ON "tenant"."evidence_requirements"("client_control_id");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_requirements_client_control_id_code_key" ON "tenant"."evidence_requirements"("client_control_id", "code");

-- CreateIndex
CREATE INDEX "evaluations_service_id_client_control_id_evaluated_at_idx" ON "tenant"."evaluations"("service_id", "client_control_id", "evaluated_at");

-- CreateIndex
CREATE INDEX "evaluations_client_control_id_idx" ON "tenant"."evaluations"("client_control_id");

-- AddForeignKey
ALTER TABLE "catalog"."control_evidence_templates" ADD CONSTRAINT "control_evidence_templates_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "catalog"."controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."control_evidence_templates" ADD CONSTRAINT "control_evidence_templates_evidence_template_id_fkey" FOREIGN KEY ("evidence_template_id") REFERENCES "catalog"."evidence_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evidence_requirements" ADD CONSTRAINT "evidence_requirements_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."evaluations" ADD CONSTRAINT "evaluations_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_dimensions" ADD CONSTRAINT "client_control_dimensions_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_dimensions" ADD CONSTRAINT "client_control_dimensions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_tests" ADD CONSTRAINT "client_control_tests_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_tests" ADD CONSTRAINT "client_control_tests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "catalog"."tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."client_control_tests" ADD CONSTRAINT "client_control_tests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
