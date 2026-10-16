-- MD-123 · Evaluación 5×5 de un riesgo y tratamiento con un cargo como responsable.
--
-- 1. El responsable del tratamiento es un CARGO de la organización (`organization_responsibles`, D30), no una persona con cuenta. Hasta hoy nada
--    escribía en `risk_treatments`; si un ambiente tuviera filas, la migración se detiene en vez de adivinar a qué cargo corresponden.
-- 2. Cada decisión de tratamiento guarda cuándo y quién la registró: «la vigente es la última».
-- 3. La base impone la forma de la evaluación: o está sin evaluar, o trae probabilidad e impacto de 1 a 5 con el valor y el nivel que les corresponden.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "tenant"."risk_treatments") THEN
    RAISE EXCEPTION 'risk_treatments tiene filas: su responsable era una persona y ahora es un cargo; reasignarlas a mano antes de migrar';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "tenant"."risk_treatments" DROP CONSTRAINT "risk_treatments_responsible_id_fkey";

-- DropIndex
DROP INDEX "tenant"."risk_treatments_client_risk_id_idx";

-- AlterTable
ALTER TABLE "tenant"."risk_treatments" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "risk_treatments_client_risk_id_created_at_idx" ON "tenant"."risk_treatments"("client_risk_id", "created_at");

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "tenant"."organization_responsibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_treatments" ADD CONSTRAINT "risk_treatments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- La evaluación: sin evaluar (los cuatro campos nulos) o completa y coherente. Bajo 1–4 · Moderado 5–9 · Alto 10–16 · Crítico 17–25.
ALTER TABLE "tenant"."client_risks" ADD CONSTRAINT "client_risks_evaluation_shape" CHECK (
  (likelihood IS NULL AND impact IS NULL AND inherent_risk_value IS NULL AND inherent_risk_level IS NULL)
  OR (
    likelihood BETWEEN 1 AND 5 AND impact BETWEEN 1 AND 5
    AND inherent_risk_value = likelihood * impact
    AND inherent_risk_level = CASE
      WHEN inherent_risk_value <= 4 THEN 'low'::"catalog"."risk_level"
      WHEN inherent_risk_value <= 9 THEN 'moderate'::"catalog"."risk_level"
      WHEN inherent_risk_value <= 16 THEN 'high'::"catalog"."risk_level"
      ELSE 'critical'::"catalog"."risk_level"
    END
  )
);
