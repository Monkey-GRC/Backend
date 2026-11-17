-- Linux y Windows pasan a `available` en servidores on-premise (ac_04): su flujo (declarar, instalar el agente, leer, corregir) ya está construido (D113).
-- Solo datos. Va como migración porque el cargador de referencia (`reference:load`) no cambia una fila que ya existe: se detiene si la base difiere de su fuente
-- (`prisma/seed/reference/data.ts`), así que la base y la fuente tienen que cambiar juntas. Idempotente.
UPDATE catalog.capability_platforms cp
   SET availability = 'available'
  FROM catalog.automated_capabilities ac
 WHERE cp.automated_capability_id = ac.id
   AND ac.catalog_code = 'ac_04'
   AND cp.code IN ('linux', 'windows')
   AND cp.availability <> 'available';
