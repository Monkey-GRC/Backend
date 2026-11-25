-- MD-499 · El tipo de las dimensiones network, endpoint, physical y process sale de las FUENTES (`tests.primary_source`) de las pruebas del control en esa dimensión:
-- todas document/manual → manual; todas automáticas (probe, cloud_engine, probe_and_cloud_engine, integration) → automated; mezcla → hybrid.
-- Corrige lo que dejó `20261124110000_test_dimensions_complete` (que las puso todas en manual). Solo UPDATE de datos de esas cuatro dimensiones; las cinco de siempre no se tocan,
-- no hay cambios de estructura ni se borra nada. Una prueba sin fuente cuenta como manual (el valor por defecto del catálogo).

-- 1. Catálogo.
WITH by_source AS (
  SELECT ct."control_id", t."dimension",
         CASE
           WHEN bool_and(coalesce(t."primary_source"::text, 'manual') IN ('document', 'manual')) THEN 'manual'
           WHEN bool_and(coalesce(t."primary_source"::text, 'manual') NOT IN ('document', 'manual')) THEN 'automated'
           ELSE 'hybrid'
         END::"catalog"."control_dimension_type" AS "new_type"
  FROM "catalog"."control_tests" ct
  JOIN "catalog"."tests" t ON t."id" = ct."test_id"
  WHERE t."dimension" IN ('network', 'endpoint', 'physical', 'process')
  GROUP BY ct."control_id", t."dimension"
)
UPDATE "catalog"."control_dimensions" d
SET "type" = s."new_type"
FROM by_source s
WHERE d."control_id" = s."control_id" AND d."dimension" = s."dimension" AND d."type" <> s."new_type";

-- 2. Copias de las empresas.
WITH by_source AS (
  SELECT cct."client_control_id", t."dimension",
         CASE
           WHEN bool_and(coalesce(t."primary_source"::text, 'manual') IN ('document', 'manual')) THEN 'manual'
           WHEN bool_and(coalesce(t."primary_source"::text, 'manual') NOT IN ('document', 'manual')) THEN 'automated'
           ELSE 'hybrid'
         END::"catalog"."control_dimension_type" AS "new_type"
  FROM "tenant"."client_control_tests" cct
  JOIN "catalog"."tests" t ON t."id" = cct."test_id"
  WHERE t."dimension" IN ('network', 'endpoint', 'physical', 'process')
  GROUP BY cct."client_control_id", t."dimension"
)
UPDATE "tenant"."client_control_dimensions" d
SET "type" = s."new_type"
FROM by_source s
WHERE d."client_control_id" = s."client_control_id" AND d."dimension" = s."dimension" AND d."type" <> s."new_type";
