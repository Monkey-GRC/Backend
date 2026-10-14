-- MD-157 · El quinto rol (modelo-datos.md §5.1, D64): el consultor de Next, que prepara al cliente para la auditoría.
-- Va solo en su migración: Postgres no deja usar un valor de enum nuevo dentro de la misma transacción que lo crea.
ALTER TYPE "platform"."user_role" ADD VALUE 'consultor';
