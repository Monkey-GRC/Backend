-- Componente 3 del onboarding (Control Técnico): el paso "programar" (PUT /assets/{id}/schedule)
-- no tenía dónde guardar la frecuencia. Columna nueva y nullable: una conexión recién creada no
-- está programada (D42). La tabla ya tiene RLS por tenant_id; no cambia nada de eso.

CREATE TYPE "tenant"."schedule_frequency" AS ENUM ('continuous', 'every_6h', 'every_24h');

ALTER TABLE "tenant"."asset_provisionings" ADD COLUMN "schedule_frequency" "tenant"."schedule_frequency";
