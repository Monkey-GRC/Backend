-- MD-499 · Dimensiones de las pruebas: cada control lleva una fila de dimensión por cada dimensión en que tiene pruebas (faltaba `process`: la hoja del comité
-- no trae su columna «Definido»). Solo datos y solo aditiva: INSERT ... WHERE NOT EXISTS, sin borrar ni renombrar nada. Las cuatro dimensiones sin fuente automática
-- (RC-05: network, endpoint, physical, process) llevan type `manual`; las otras cinco conservan el tipo que ya tenían (o el derivado del control, si la fila es nueva).

-- 1. Catálogo: control_dimensions (pruebas del control = el puente control_tests).
INSERT INTO "catalog"."control_dimensions" ("id", "control_id", "dimension", "type", "requires_probe", "requires_ai", "requires_compliance_confirmation", "reason_not_applicable")
SELECT gen_random_uuid(), x."control_id", x."dimension",
       CASE
         WHEN x."dimension" IN ('network', 'endpoint', 'physical', 'process') THEN 'manual'::"catalog"."control_dimension_type"
         WHEN x."control_type" = 'automated' THEN 'automated'::"catalog"."control_dimension_type"
         WHEN x."control_type" = 'it_dependent_manual' THEN 'hybrid'::"catalog"."control_dimension_type"
         ELSE 'manual'::"catalog"."control_dimension_type"
       END,
       false, false, false, NULL
FROM (
  SELECT DISTINCT ct."control_id", t."dimension", c."type" AS "control_type"
  FROM "catalog"."control_tests" ct
  JOIN "catalog"."tests" t ON t."id" = ct."test_id"
  JOIN "catalog"."controls" c ON c."id" = ct."control_id"
) x
WHERE NOT EXISTS (
  SELECT 1 FROM "catalog"."control_dimensions" d WHERE d."control_id" = x."control_id" AND d."dimension" = x."dimension"
);

-- 2. Copias de las empresas: client_control_dimensions (pruebas del control del cliente = client_control_tests). Una dimensión con pruebas aplica (sin motivo de «no aplica»).
INSERT INTO "tenant"."client_control_dimensions" ("id", "tenant_id", "client_control_id", "dimension", "type", "requires_probe", "requires_ai", "requires_compliance_confirmation", "reason_not_applicable")
SELECT gen_random_uuid(), x."tenant_id", x."client_control_id", x."dimension",
       CASE
         WHEN x."dimension" IN ('network', 'endpoint', 'physical', 'process') THEN 'manual'::"catalog"."control_dimension_type"
         WHEN x."control_type" = 'automated' THEN 'automated'::"catalog"."control_dimension_type"
         WHEN x."control_type" = 'it_dependent_manual' THEN 'hybrid'::"catalog"."control_dimension_type"
         ELSE 'manual'::"catalog"."control_dimension_type"
       END,
       false, false, false, NULL
FROM (
  SELECT DISTINCT cct."tenant_id", cct."client_control_id", t."dimension", c."type" AS "control_type"
  FROM "tenant"."client_control_tests" cct
  JOIN "catalog"."tests" t ON t."id" = cct."test_id"
  JOIN "tenant"."client_controls" cc ON cc."id" = cct."client_control_id"
  LEFT JOIN "catalog"."controls" c ON c."id" = cc."control_id"
) x
WHERE NOT EXISTS (
  SELECT 1 FROM "tenant"."client_control_dimensions" d WHERE d."client_control_id" = x."client_control_id" AND d."dimension" = x."dimension"
);

-- 3. Las filas que ya existían de las cuatro dimensiones sin fuente automática heredaron el tipo del control: pasan a `manual`.
UPDATE "catalog"."control_dimensions" SET "type" = 'manual' WHERE "dimension" IN ('network', 'endpoint', 'physical') AND "type" <> 'manual';
UPDATE "tenant"."client_control_dimensions" SET "type" = 'manual' WHERE "dimension" IN ('network', 'endpoint', 'physical', 'process') AND "type" <> 'manual';
