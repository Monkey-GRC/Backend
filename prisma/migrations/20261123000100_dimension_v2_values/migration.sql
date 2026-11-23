-- Catálogo v2 (MD-491): cuatro dimensiones nuevas. Migración aparte: un valor de enum nuevo no se puede usar en la misma transacción que lo añade.
ALTER TYPE "catalog"."dimension" ADD VALUE IF NOT EXISTS 'network';
ALTER TYPE "catalog"."dimension" ADD VALUE IF NOT EXISTS 'endpoint';
ALTER TYPE "catalog"."dimension" ADD VALUE IF NOT EXISTS 'physical';
ALTER TYPE "catalog"."dimension" ADD VALUE IF NOT EXISTS 'process';
