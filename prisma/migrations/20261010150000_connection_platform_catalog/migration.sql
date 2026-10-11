-- D67: el catálogo de conexiones pasa de constantes de código a la base de datos (modelo-datos.md §6.3).
--
--  * Tablas nuevas en `catalog`: capability_platforms (lo que el cliente elige: AWS, Linux, PostgreSQL…), platform_connection_methods,
--    platform_regions, capability_frequencies y deployment_scenario_capabilities (qué conexiones ofrece cada escenario).
--  * automated_capabilities gana `asset_type` y pierde `supported_platforms` (los nombres sueltos pasan a ser filas de capability_platforms).
--  * assets gana `platform_id`: la plataforma que el cliente eligió al conectar.
--
-- Los datos iniciales se siembran AQUÍ y no solo en `npm run reference:load`: ese comando es manual y el despliegue migra solo (D42), así que
-- sin esto la app quedaría sin conexiones que ofrecer hasta que alguien lo corriera. Se siembran solo si ya existen las capacidades (una base
-- nueva las recibe de reference:load, que carga lo mismo desde prisma/seed/reference/data.ts, la fuente). Si ambos difieren, reference:verify avisa.
-- El RLS de las tablas nuevas va en la migración siguiente (schema-implementacion.md §7).

-- AlterTable (asset_type nace nulo, se rellena y recién entonces es obligatorio: ya hay conexiones sembradas)
ALTER TABLE "catalog"."automated_capabilities" ADD COLUMN     "asset_type" "tenant"."asset_type";
-- AlterTable
ALTER TABLE "tenant"."assets" ADD COLUMN     "platform_id" UUID;
-- CreateTable
CREATE TABLE "catalog"."capability_platforms" (
    "id" UUID NOT NULL,
    "automated_capability_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_key" TEXT NOT NULL,
    "availability" "catalog"."framework_availability" NOT NULL DEFAULT 'coming_soon',
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "capability_platforms_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "catalog"."platform_connection_methods" (
    "id" UUID NOT NULL,
    "platform_id" UUID NOT NULL,
    "connection_method" "tenant"."connection_method" NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "platform_connection_methods_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "catalog"."platform_regions" (
    "id" UUID NOT NULL,
    "platform_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "platform_regions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "catalog"."capability_frequencies" (
    "id" UUID NOT NULL,
    "automated_capability_id" UUID NOT NULL,
    "schedule_frequency" "tenant"."schedule_frequency" NOT NULL,
    CONSTRAINT "capability_frequencies_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "catalog"."deployment_scenario_capabilities" (
    "id" UUID NOT NULL,
    "deployment_scenario" "tenant"."deployment_scenario" NOT NULL,
    "automated_capability_id" UUID NOT NULL,
    CONSTRAINT "deployment_scenario_capabilities_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "capability_platforms_automated_capability_id_code_key" ON "catalog"."capability_platforms"("automated_capability_id", "code");
-- CreateIndex
CREATE UNIQUE INDEX "platform_connection_methods_platform_id_connection_method_key" ON "catalog"."platform_connection_methods"("platform_id", "connection_method");
-- CreateIndex
CREATE UNIQUE INDEX "platform_regions_platform_id_code_key" ON "catalog"."platform_regions"("platform_id", "code");
-- CreateIndex
CREATE UNIQUE INDEX "capability_frequencies_automated_capability_id_schedule_fre_key" ON "catalog"."capability_frequencies"("automated_capability_id", "schedule_frequency");
-- CreateIndex
CREATE INDEX "deployment_scenario_capabilities_automated_capability_id_idx" ON "catalog"."deployment_scenario_capabilities"("automated_capability_id");
-- CreateIndex
CREATE UNIQUE INDEX "deployment_scenario_capabilities_deployment_scenario_automa_key" ON "catalog"."deployment_scenario_capabilities"("deployment_scenario", "automated_capability_id");
-- CreateIndex
CREATE INDEX "assets_platform_id_idx" ON "tenant"."assets"("platform_id");
-- AddForeignKey
ALTER TABLE "catalog"."capability_platforms" ADD CONSTRAINT "capability_platforms_automated_capability_id_fkey" FOREIGN KEY ("automated_capability_id") REFERENCES "catalog"."automated_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "catalog"."platform_connection_methods" ADD CONSTRAINT "platform_connection_methods_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "catalog"."capability_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "catalog"."platform_regions" ADD CONSTRAINT "platform_regions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "catalog"."capability_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "catalog"."capability_frequencies" ADD CONSTRAINT "capability_frequencies_automated_capability_id_fkey" FOREIGN KEY ("automated_capability_id") REFERENCES "catalog"."automated_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "catalog"."deployment_scenario_capabilities" ADD CONSTRAINT "deployment_scenario_capabilities_automated_capability_id_fkey" FOREIGN KEY ("automated_capability_id") REFERENCES "catalog"."automated_capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "tenant"."assets" ADD CONSTRAINT "assets_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "catalog"."capability_platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Datos iniciales (D67)
UPDATE "catalog"."automated_capabilities" SET "asset_type" = CASE "catalog_code"
  WHEN 'ac_01' THEN 'cloud_service'
  WHEN 'ac_02' THEN 'server'
  WHEN 'ac_03' THEN 'database'
  WHEN 'ac_04' THEN 'server'
  WHEN 'ac_05' THEN 'database'
  WHEN 'ac_06' THEN 'endpoint'
END::"tenant"."asset_type";

INSERT INTO "catalog"."capability_platforms" ("id", "automated_capability_id", "code", "name", "logo_key", "availability", "sort_order")
SELECT gen_random_uuid(), c."id", v.code, v.name, v.logo_key, v.availability::"catalog"."framework_availability", v.sort_order
FROM (VALUES
  ('ac_01', 'aws', 'AWS', 'aws', 'available', 1),
  ('ac_01', 'azure', 'Azure', 'azure', 'coming_soon', 2),
  ('ac_01', 'gcp', 'GCP', 'gcp', 'coming_soon', 3),
  ('ac_01', 'microsoft_365', 'Microsoft 365', 'microsoft_365', 'coming_soon', 4),
  ('ac_01', 'google_workspace', 'Google Workspace', 'google_workspace', 'coming_soon', 5),
  ('ac_02', 'linux', 'Linux', 'linux', 'coming_soon', 1),
  ('ac_02', 'windows', 'Windows', 'windows', 'coming_soon', 2),
  ('ac_02', 'hp_ux', 'HP-UX', 'hp_ux', 'coming_soon', 3),
  ('ac_02', 'aix', 'AIX', 'aix', 'coming_soon', 4),
  ('ac_02', 'solaris', 'Solaris', 'solaris', 'coming_soon', 5),
  ('ac_03', 'postgresql', 'PostgreSQL', 'postgresql', 'coming_soon', 1),
  ('ac_03', 'mysql', 'MySQL', 'mysql', 'coming_soon', 2),
  ('ac_03', 'sql_server', 'SQL Server', 'sql_server', 'coming_soon', 3),
  ('ac_03', 'oracle', 'Oracle', 'oracle', 'coming_soon', 4),
  ('ac_03', 'mongodb', 'MongoDB', 'mongodb', 'coming_soon', 5),
  ('ac_04', 'linux', 'Linux', 'linux', 'coming_soon', 1),
  ('ac_04', 'windows', 'Windows', 'windows', 'coming_soon', 2),
  ('ac_04', 'hp_ux', 'HP-UX', 'hp_ux', 'coming_soon', 3),
  ('ac_04', 'aix', 'AIX', 'aix', 'coming_soon', 4),
  ('ac_04', 'solaris', 'Solaris', 'solaris', 'coming_soon', 5),
  ('ac_05', 'postgresql', 'PostgreSQL', 'postgresql', 'coming_soon', 1),
  ('ac_05', 'mysql_mariadb', 'MySQL / MariaDB', 'mysql', 'coming_soon', 2),
  ('ac_05', 'sql_server', 'SQL Server', 'sql_server', 'coming_soon', 3),
  ('ac_05', 'oracle', 'Oracle', 'oracle', 'coming_soon', 4),
  ('ac_05', 'mongodb', 'MongoDB', 'mongodb', 'coming_soon', 5),
  ('ac_06', 'windows', 'Windows', 'windows', 'coming_soon', 1),
  ('ac_06', 'macos', 'macOS', 'macos', 'coming_soon', 2),
  ('ac_06', 'linux', 'Linux', 'linux', 'coming_soon', 3)
) AS v(capability, code, name, logo_key, availability, sort_order)
JOIN "catalog"."automated_capabilities" c ON c."catalog_code" = v.capability
ON CONFLICT DO NOTHING;

INSERT INTO "catalog"."platform_connection_methods" ("id", "platform_id", "connection_method", "is_recommended", "sort_order")
SELECT gen_random_uuid(), p."id", v.method::"tenant"."connection_method", v.is_recommended, v.sort_order
FROM (VALUES
  ('ac_01', 'aws', 'readonly_role', true, 1),
  ('ac_01', 'aws', 'access_keys', false, 2),
  ('ac_02', 'linux', 'agent', true, 1),
  ('ac_02', 'windows', 'agent', true, 1),
  ('ac_02', 'hp_ux', 'agent', true, 1),
  ('ac_02', 'aix', 'agent', true, 1),
  ('ac_02', 'solaris', 'agent', true, 1),
  ('ac_03', 'postgresql', 'agent', true, 1),
  ('ac_03', 'mysql', 'agent', true, 1),
  ('ac_03', 'sql_server', 'agent', true, 1),
  ('ac_03', 'oracle', 'agent', true, 1),
  ('ac_03', 'mongodb', 'agent', true, 1),
  ('ac_04', 'linux', 'agent', true, 1),
  ('ac_04', 'windows', 'agent', true, 1),
  ('ac_04', 'hp_ux', 'agent', true, 1),
  ('ac_04', 'aix', 'agent', true, 1),
  ('ac_04', 'solaris', 'agent', true, 1),
  ('ac_05', 'postgresql', 'agent', true, 1),
  ('ac_05', 'mysql_mariadb', 'agent', true, 1),
  ('ac_05', 'sql_server', 'agent', true, 1),
  ('ac_05', 'oracle', 'agent', true, 1),
  ('ac_05', 'mongodb', 'agent', true, 1),
  ('ac_06', 'windows', 'agent', true, 1),
  ('ac_06', 'macos', 'agent', true, 1),
  ('ac_06', 'linux', 'agent', true, 1)
) AS v(capability, code, method, is_recommended, sort_order)
JOIN "catalog"."automated_capabilities" c ON c."catalog_code" = v.capability
JOIN "catalog"."capability_platforms" p ON p."automated_capability_id" = c."id" AND p."code" = v.code
ON CONFLICT DO NOTHING;

INSERT INTO "catalog"."platform_regions" ("id", "platform_id", "code", "name", "sort_order")
SELECT gen_random_uuid(), p."id", v.region, v.name, v.sort_order
FROM (VALUES
  ('ac_01', 'aws', 'us-east-1', 'N. Virginia', 1),
  ('ac_01', 'aws', 'us-east-2', 'Ohio', 2),
  ('ac_01', 'aws', 'us-west-1', 'N. California', 3),
  ('ac_01', 'aws', 'us-west-2', 'Oregon', 4),
  ('ac_01', 'aws', 'ca-central-1', 'Canada Central', 5),
  ('ac_01', 'aws', 'mx-central-1', 'Mexico Central', 6),
  ('ac_01', 'aws', 'sa-east-1', 'São Paulo', 7),
  ('ac_01', 'aws', 'eu-west-1', 'Ireland', 8),
  ('ac_01', 'aws', 'eu-west-2', 'London', 9),
  ('ac_01', 'aws', 'eu-west-3', 'Paris', 10),
  ('ac_01', 'aws', 'eu-central-1', 'Frankfurt', 11),
  ('ac_01', 'aws', 'eu-north-1', 'Stockholm', 12),
  ('ac_01', 'aws', 'eu-south-1', 'Milan', 13),
  ('ac_01', 'aws', 'ap-south-1', 'Mumbai', 14),
  ('ac_01', 'aws', 'ap-northeast-1', 'Tokyo', 15),
  ('ac_01', 'aws', 'ap-northeast-2', 'Seoul', 16),
  ('ac_01', 'aws', 'ap-southeast-1', 'Singapore', 17),
  ('ac_01', 'aws', 'ap-southeast-2', 'Sydney', 18)
) AS v(capability, code, region, name, sort_order)
JOIN "catalog"."automated_capabilities" c ON c."catalog_code" = v.capability
JOIN "catalog"."capability_platforms" p ON p."automated_capability_id" = c."id" AND p."code" = v.code
ON CONFLICT DO NOTHING;

INSERT INTO "catalog"."capability_frequencies" ("id", "automated_capability_id", "schedule_frequency")
SELECT gen_random_uuid(), c."id", v.frequency::"tenant"."schedule_frequency"
FROM (VALUES
  ('ac_01', 'every_6h'),
  ('ac_01', 'every_24h'),
  ('ac_02', 'continuous'),
  ('ac_03', 'continuous'),
  ('ac_04', 'continuous'),
  ('ac_05', 'continuous'),
  ('ac_06', 'continuous')
) AS v(capability, frequency)
JOIN "catalog"."automated_capabilities" c ON c."catalog_code" = v.capability
ON CONFLICT DO NOTHING;

INSERT INTO "catalog"."deployment_scenario_capabilities" ("id", "deployment_scenario", "automated_capability_id")
SELECT gen_random_uuid(), v.scenario::"tenant"."deployment_scenario", c."id"
FROM (VALUES
  ('cloud_managed_only', 'ac_01'),
  ('cloud_with_servers', 'ac_01'),
  ('cloud_with_servers', 'ac_02'),
  ('cloud_with_servers', 'ac_03'),
  ('on_premise', 'ac_04'),
  ('on_premise', 'ac_05'),
  ('on_premise', 'ac_06'),
  ('hybrid', 'ac_01'),
  ('hybrid', 'ac_02'),
  ('hybrid', 'ac_03'),
  ('hybrid', 'ac_04'),
  ('hybrid', 'ac_05'),
  ('hybrid', 'ac_06')
) AS v(scenario, capability)
JOIN "catalog"."automated_capabilities" c ON c."catalog_code" = v.capability
ON CONFLICT DO NOTHING;

-- Cerrar asset_type: ya está relleno (en una base nueva no hay filas y reference:load lo trae).
ALTER TABLE "catalog"."automated_capabilities" ALTER COLUMN "asset_type" SET NOT NULL;
ALTER TABLE "catalog"."automated_capabilities" DROP COLUMN "supported_platforms";

-- Las conexiones que ya existen apuntan a su plataforma (AWS lleva `aws` en `platform`). Las del formulario provisional de servidores y bases
-- no la tienen (su `platform` es texto libre): quedan nulas y se leen por esa etiqueta. Un rol sin BYPASSRLS no vería filas aquí; las migraciones corren como dueño.
UPDATE "tenant"."assets" a
   SET "platform_id" = p."id"
  FROM "catalog"."capability_platforms" p
  JOIN "catalog"."automated_capabilities" c ON c."id" = p."automated_capability_id"
 WHERE a."platform_id" IS NULL
   AND a."parent_asset_id" IS NULL
   AND a."connection_category"::text = c."catalog_code"
   AND p."code" = lower(a."platform");
