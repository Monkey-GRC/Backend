-- MD-503 (D136, D150) · El sexto rol: el `colaborador` lee y acepta los documentos que le asignan (contracts/documentos.md).
-- Va solo en su migración: Postgres no deja usar un valor de enum nuevo dentro de la misma transacción que lo crea. Es aditiva: ninguna fila ni
-- restricción cambia (los CHECK de `users` ya dejan sin grupo ni `is_internal` a todo rol que no sea `responsable` o `delegado`).
ALTER TYPE "platform"."user_role" ADD VALUE IF NOT EXISTS 'colaborador';
