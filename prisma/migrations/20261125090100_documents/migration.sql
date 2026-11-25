-- MD-503 (D152, corte mínimo de MD-506/MD-507) · Documentos de la empresa (modelo-datos.md §11.2): `company_documents` (uno por documento del catálogo y por empresa), `document_versions`
-- (el archivo va en la fila), `document_assignments` (con el plazo de PR-14) y `document_acceptances` (inmutable). Aditiva: tablas nuevas.
-- Al final se rellena `company_documents` para las empresas que ya clonaron un marco (los documentos vinculados a sus controles vigentes), sin versión y con la aceptación sugerida.
-- Reversa: borrar las cuatro tablas (empezando por `document_acceptances`) y el tipo `document_version_status`; los documentos y las aceptaciones guardados se pierden.
-- RLS, inmutabilidad, versión vigente única y permisos van aparte (20261125090200_rls_documents).

-- CreateEnum
CREATE TYPE "tenant"."document_version_status" AS ENUM ('draft', 'in_approval', 'rejected', 'approved', 'current', 'renewal_due', 'expired', 'archived');

-- CreateTable
CREATE TABLE "tenant"."company_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID,
    "origin" "catalog"."document_origin" NOT NULL,
    "acceptance" "catalog"."document_acceptance" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."document_versions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "company_document_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "tenant"."document_version_status" NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "integrity_hash" TEXT NOT NULL,
    "is_imported_approval" BOOLEAN NOT NULL DEFAULT true,
    "approvers" JSONB NOT NULL,
    "approved_at" DATE NOT NULL,
    "approval_note" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."document_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "company_document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "document_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."document_acceptances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_version_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrity_hash" TEXT NOT NULL,
    "was_overdue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "document_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_documents_document_id_idx" ON "tenant"."company_documents"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_documents_tenant_id_document_id_key" ON "tenant"."company_documents"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "document_versions_tenant_id_idx" ON "tenant"."document_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "document_versions_created_by_idx" ON "tenant"."document_versions"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_company_document_id_number_key" ON "tenant"."document_versions"("company_document_id", "number");

-- CreateIndex
CREATE INDEX "document_assignments_tenant_id_idx" ON "tenant"."document_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "document_assignments_user_id_idx" ON "tenant"."document_assignments"("user_id");

-- CreateIndex
CREATE INDEX "document_assignments_assigned_by_idx" ON "tenant"."document_assignments"("assigned_by");

-- CreateIndex
CREATE UNIQUE INDEX "document_assignments_company_document_id_user_id_key" ON "tenant"."document_assignments"("company_document_id", "user_id");

-- CreateIndex
CREATE INDEX "document_acceptances_tenant_id_idx" ON "tenant"."document_acceptances"("tenant_id");

-- CreateIndex
CREATE INDEX "document_acceptances_user_id_idx" ON "tenant"."document_acceptances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_acceptances_document_version_id_user_id_key" ON "tenant"."document_acceptances"("document_version_id", "user_id");

-- AddForeignKey
ALTER TABLE "tenant"."company_documents" ADD CONSTRAINT "company_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."company_documents" ADD CONSTRAINT "company_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "catalog"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_versions" ADD CONSTRAINT "document_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_versions" ADD CONSTRAINT "document_versions_company_document_id_fkey" FOREIGN KEY ("company_document_id") REFERENCES "tenant"."company_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_versions" ADD CONSTRAINT "document_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_assignments" ADD CONSTRAINT "document_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_assignments" ADD CONSTRAINT "document_assignments_company_document_id_fkey" FOREIGN KEY ("company_document_id") REFERENCES "tenant"."company_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_assignments" ADD CONSTRAINT "document_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_assignments" ADD CONSTRAINT "document_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_acceptances" ADD CONSTRAINT "document_acceptances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_acceptances" ADD CONSTRAINT "document_acceptances_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "tenant"."document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."document_acceptances" ADD CONSTRAINT "document_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relleno aditivo: los documentos del catálogo vinculados a los controles vigentes que cada empresa ya clonó. Idempotente (el único `(tenant_id, document_id)` ignora lo que ya existe).
INSERT INTO "tenant"."company_documents" ("id", "tenant_id", "document_id", "origin", "acceptance")
SELECT gen_random_uuid(), cc."tenant_id", d."id", d."origin", d."suggested_acceptance"
  FROM "tenant"."client_controls" cc
  JOIN "catalog"."control_documents" cd ON cd."control_id" = cc."control_id"
  JOIN "catalog"."documents" d ON d."id" = cd."document_id"
 WHERE cc."is_active" AND cc."control_id" IS NOT NULL
 GROUP BY cc."tenant_id", d."id", d."origin", d."suggested_acceptance"
ON CONFLICT ("tenant_id", "document_id") DO NOTHING;
