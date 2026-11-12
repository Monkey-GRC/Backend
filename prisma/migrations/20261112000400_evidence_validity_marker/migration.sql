-- MD-211 · `validity_within_period` guardaba el texto en español «Dentro del período de evaluación»; ahora guarda el marcador neutro `within_evaluation_period` y la API
-- traduce la etiqueta al responder. Solo cambian las filas con ese texto exacto (un período concreto como `2026-Q4` es un dato). Idempotente.
UPDATE "tenant"."evidence_requirements" SET "validity_within_period" = 'within_evaluation_period' WHERE "validity_within_period" = 'Dentro del período de evaluación';
