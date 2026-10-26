-- La referencia de origen de un control decía "vanta:CODIGO" (el nombre de la hoja del Excel de la que salió). Ningún texto que ve una persona nombra a un
-- tercero ni a un proveedor de las sondas: el prefijo pasa a ser "comite:" (el origen real es el comité). Solo cambia el prefijo; el código no se toca.
UPDATE "catalog"."controls" SET "source_ref" = 'comite:' || substr("source_ref", 7) WHERE "source_ref" LIKE 'vanta:%';
UPDATE "tenant"."client_controls" SET "source_ref" = 'comite:' || substr("source_ref", 7) WHERE "source_ref" LIKE 'vanta:%';