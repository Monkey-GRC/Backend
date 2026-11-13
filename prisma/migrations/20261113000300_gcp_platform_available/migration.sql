-- MD-214 (cierra DT-104): GCP ya tiene sus pantallas de conexión; pasa a disponible en el catálogo.
UPDATE "catalog"."capability_platforms" p
SET "availability" = 'available'
FROM "catalog"."automated_capabilities" c
WHERE p."automated_capability_id" = c."id" AND c."catalog_code" = 'ac_01' AND p."code" = 'gcp';
