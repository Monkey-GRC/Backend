-- D157: «Conectar Microsoft 365» probado de punta a punta con un tenant real; pasa a disponible en el catálogo.
UPDATE "catalog"."capability_platforms" p
SET "availability" = 'available'
FROM "catalog"."automated_capabilities" c
WHERE p."automated_capability_id" = c."id" AND c."catalog_code" = 'ac_01' AND p."code" = 'microsoft_365';
