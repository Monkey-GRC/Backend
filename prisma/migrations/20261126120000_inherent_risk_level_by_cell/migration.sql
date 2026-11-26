-- MD-496 · D134: el nivel inherente sale de la casilla de la matriz (probabilidad, impacto), no de rangos del valor.
-- Filas = probabilidad 1..5; columnas = impacto 1..5.
--   P5: high, high, critical, critical, critical
--   P4: moderate, high, high, critical, critical
--   P3: low, moderate, high, critical, critical
--   P2: low, low, moderate, high, critical
--   P1: low, low, moderate, high, high

-- Se quita el CHECK viejo para poder recalcular las filas ya evaluadas (decisión de Rod: recalcular). El historial de evaluaciones no se toca.
ALTER TABLE "tenant"."client_risks" DROP CONSTRAINT "client_risks_evaluation_shape";

UPDATE "tenant"."client_risks" SET "inherent_risk_level" = (CASE
  WHEN likelihood = 5 THEN CASE WHEN impact <= 2 THEN 'high' ELSE 'critical' END
  WHEN likelihood = 4 THEN CASE WHEN impact = 1 THEN 'moderate' WHEN impact <= 3 THEN 'high' ELSE 'critical' END
  WHEN likelihood = 3 THEN CASE WHEN impact = 1 THEN 'low' WHEN impact = 2 THEN 'moderate' WHEN impact = 3 THEN 'high' ELSE 'critical' END
  WHEN likelihood = 2 THEN CASE WHEN impact <= 2 THEN 'low' WHEN impact = 3 THEN 'moderate' WHEN impact = 4 THEN 'high' ELSE 'critical' END
  ELSE CASE WHEN impact <= 2 THEN 'low' WHEN impact = 3 THEN 'moderate' ELSE 'high' END
END)::"catalog"."risk_level"
WHERE likelihood IS NOT NULL AND impact IS NOT NULL;

ALTER TABLE "tenant"."client_risks" ADD CONSTRAINT "client_risks_evaluation_shape" CHECK (
  (likelihood IS NULL AND impact IS NULL AND inherent_risk_value IS NULL AND inherent_risk_level IS NULL)
  OR (
    likelihood BETWEEN 1 AND 5 AND impact BETWEEN 1 AND 5
    AND inherent_risk_value = likelihood * impact
    AND inherent_risk_level = (CASE
      WHEN likelihood = 5 THEN CASE WHEN impact <= 2 THEN 'high' ELSE 'critical' END
      WHEN likelihood = 4 THEN CASE WHEN impact = 1 THEN 'moderate' WHEN impact <= 3 THEN 'high' ELSE 'critical' END
      WHEN likelihood = 3 THEN CASE WHEN impact = 1 THEN 'low' WHEN impact = 2 THEN 'moderate' WHEN impact = 3 THEN 'high' ELSE 'critical' END
      WHEN likelihood = 2 THEN CASE WHEN impact <= 2 THEN 'low' WHEN impact = 3 THEN 'moderate' WHEN impact = 4 THEN 'high' ELSE 'critical' END
      ELSE CASE WHEN impact <= 2 THEN 'low' WHEN impact = 3 THEN 'moderate' ELSE 'high' END
    END)::"catalog"."risk_level"
  )
);
