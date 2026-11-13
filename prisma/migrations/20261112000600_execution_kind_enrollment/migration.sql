-- Crear el agente de la sonda de un servidor es un tipo de ejecución propio (D113): lo hace el trabajador en un carril corto, como la validación. Aparte de
-- la migración que la usa: un valor nuevo de un tipo enumerado no se puede usar en la misma transacción que lo agrega.

-- AlterEnum
ALTER TYPE "tenant"."execution_kind" ADD VALUE 'enrollment';
