-- D114: las opciones del asistente de conexión (método de conexión, alcance y método de configuración de GCP) pasan a datos de referencia,
-- con su disponibilidad y sus etiquetas. Se siembran AQUÍ (el despliegue migra solo, D42) y reference:load carga lo mismo desde prisma/seed/reference/data.ts.

-- CreateEnum
CREATE TYPE "catalog"."connection_option_tag" AS ENUM ('recommended', 'fastest', 'advanced', 'less_secure');

-- CreateTable
CREATE TABLE "catalog"."connection_options" (
    "id" UUID NOT NULL,
    "catalog" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "availability" "catalog"."framework_availability" NOT NULL DEFAULT 'coming_soon',
    "tags" "catalog"."connection_option_tag"[],
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "connection_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connection_options_catalog_code_key" ON "catalog"."connection_options"("catalog", "code");

-- RLS: todos leen, solo admin_monkey escribe (mismas cuatro políticas que el resto del catálogo, D31).
ALTER TABLE "catalog"."connection_options" ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_read ON "catalog"."connection_options" FOR SELECT USING (true);
CREATE POLICY catalog_insert_admin ON "catalog"."connection_options" FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_update_admin ON "catalog"."connection_options" FOR UPDATE
  USING (current_setting('app.user_role', true) = 'admin_monkey')
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY catalog_delete_admin ON "catalog"."connection_options" FOR DELETE
  USING (current_setting('app.user_role', true) = 'admin_monkey');

-- Datos iniciales
INSERT INTO "catalog"."connection_options" ("id", "catalog", "code", "availability", "tags", "sort_order") VALUES
  (gen_random_uuid(), 'connection_method', 'readonly_role', 'available', ARRAY['recommended']::"catalog"."connection_option_tag"[], 1),
  (gen_random_uuid(), 'connection_method', 'access_keys', 'available', ARRAY['less_secure']::"catalog"."connection_option_tag"[], 2),
  (gen_random_uuid(), 'connection_method', 'agent', 'available', ARRAY[]::"catalog"."connection_option_tag"[], 3),
  (gen_random_uuid(), 'connection_method', 'identity_federation', 'available', ARRAY['recommended']::"catalog"."connection_option_tag"[], 4),
  (gen_random_uuid(), 'gcp_connection_scope', 'project', 'available', ARRAY[]::"catalog"."connection_option_tag"[], 1),
  (gen_random_uuid(), 'gcp_connection_scope', 'organization', 'coming_soon', ARRAY[]::"catalog"."connection_option_tag"[], 2),
  (gen_random_uuid(), 'gcp_setup_method', 'cloud_shell', 'available', ARRAY['recommended', 'fastest']::"catalog"."connection_option_tag"[], 1),
  (gen_random_uuid(), 'gcp_setup_method', 'terraform', 'coming_soon', ARRAY['advanced']::"catalog"."connection_option_tag"[], 2);
