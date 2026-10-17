-- Monkey Admin · catálogo maestro (contracts/modules/monkey-admin-catalog.md). Cada fila dice de dónde viene (`origin`) y, salvo los riesgos que ya lo tenían,
-- si está activa (`is_active`): dar de baja no borra, porque las copias de cada empresa (D28) y las evaluaciones apuntan al catálogo. Todo lo que existe hoy
-- viene del comité y está activo, así que los valores por defecto describen exactamente lo ya cargado.
CREATE TYPE "catalog"."catalog_origin" AS ENUM ('committee', 'monkey_admin');

ALTER TABLE "catalog"."controls"           ADD COLUMN "origin" "catalog"."catalog_origin" NOT NULL DEFAULT 'committee', ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "catalog"."causes"             ADD COLUMN "origin" "catalog"."catalog_origin" NOT NULL DEFAULT 'committee', ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "catalog"."tests"              ADD COLUMN "origin" "catalog"."catalog_origin" NOT NULL DEFAULT 'committee', ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "catalog"."evidence_templates" ADD COLUMN "origin" "catalog"."catalog_origin" NOT NULL DEFAULT 'committee', ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "catalog"."risks"              ADD COLUMN "origin" "catalog"."catalog_origin" NOT NULL DEFAULT 'committee';