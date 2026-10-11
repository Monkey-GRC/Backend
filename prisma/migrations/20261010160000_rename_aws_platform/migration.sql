-- D67: el nombre de la plataforma AWS que ve el cliente es «Amazon Web Services». El nombre sale de la base (catalog.capability_platforms.name), no de la pantalla.
-- Solo cambia el dato ya sembrado por 20261010150000; una base nueva lo recibe de reference:load (prisma/seed/reference/data.ts) con el nombre nuevo y esto no toca nada.
UPDATE "catalog"."capability_platforms" p
   SET "name" = 'Amazon Web Services'
  FROM "catalog"."automated_capabilities" c
 WHERE c."id" = p."automated_capability_id"
   AND c."catalog_code" = 'ac_01'
   AND p."code" = 'aws'
   AND p."name" = 'AWS';
