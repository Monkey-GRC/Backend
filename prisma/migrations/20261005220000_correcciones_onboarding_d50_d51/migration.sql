-- Correcciones del comité al onboarding (D50, D51).
--
--   1. catalog.frameworks.availability: Monkey ofrece varios marcos como gancho comercial, pero hoy
--      solo SOC 2 tiene catálogo; el resto es `coming_soon` y no se puede contratar ni elegir (D50).
--   2. tenant.service_regulations se retira: la regulación se declara solo a nivel de empresa
--      (organization_regulations); aplica a la empresa, no al servicio (D51, revierte D45).
--   3. platform.users.name / last_name pasan a ser opcionales: el admin de la empresa se
--      identifica por su correo y la activación solo pide contraseña (D51).
--   4. previous_certification: más certificaciones y evaluaciones comunes (D51).
--   6. system_descriptions: `file_path` pasa a `link_url` + `file_key` (enlace y/o archivo, D51).
--   5. catalog.regulations: PCI DSS no es una norma de protección de datos (es un estándar de la
--      industria de tarjetas y ya es un marco): se retira del catálogo y de las empresas que lo marcaron.

-- 1. Disponibilidad de los marcos --------------------------------------------------------------
CREATE TYPE "catalog"."framework_availability" AS ENUM ('available', 'coming_soon');

ALTER TABLE "catalog"."frameworks"
  ADD COLUMN "availability" "catalog"."framework_availability" NOT NULL DEFAULT 'coming_soon';

-- El único marco con catálogo hoy (D37).
UPDATE "catalog"."frameworks" SET "availability" = 'available' WHERE "code" = 'soc2';

-- 2. Fuera la regulación por servicio ----------------------------------------------------------
DROP TABLE "tenant"."service_regulations";

-- 3. Nombre y apellido opcionales --------------------------------------------------------------
ALTER TABLE "platform"."users" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "platform"."users" ALTER COLUMN "last_name" DROP NOT NULL;

-- 4. Certificación previa: más opciones --------------------------------------------------------
ALTER TYPE "tenant"."previous_certification" ADD VALUE 'pci_dss';
ALTER TYPE "tenant"."previous_certification" ADD VALUE 'hipaa';
ALTER TYPE "tenant"."previous_certification" ADD VALUE 'nist_csf';
ALTER TYPE "tenant"."previous_certification" ADD VALUE 'gdpr';

-- 6. Descripción del Sistema: enlace y/o archivo -----------------------------------------------
-- Antes una sola columna `file_path` (un enlace o, en teoría, una ruta). Ahora el cliente puede dar el
-- enlace, subir un archivo, o las dos cosas; al menos una es obligatoria.
ALTER TABLE "tenant"."system_descriptions" ADD COLUMN "link_url" TEXT;
ALTER TABLE "tenant"."system_descriptions" ADD COLUMN "file_key" TEXT;

UPDATE "tenant"."system_descriptions" SET "link_url" = "file_path" WHERE "file_path" ~* '^https?://';
UPDATE "tenant"."system_descriptions" SET "file_key" = "file_path" WHERE "link_url" IS NULL;

ALTER TABLE "tenant"."system_descriptions" DROP COLUMN "file_path";
ALTER TABLE "tenant"."system_descriptions"
  ADD CONSTRAINT "system_descriptions_source_check" CHECK ("link_url" IS NOT NULL OR "file_key" IS NOT NULL);

-- 5. PCI DSS deja de ser una «regulación» -------------------------------------------------------
DELETE FROM "tenant"."organization_regulations"
  WHERE "regulation_id" IN (SELECT "id" FROM "catalog"."regulations" WHERE "code" = 'pci_dss');
DELETE FROM "catalog"."regulations" WHERE "code" = 'pci_dss';
