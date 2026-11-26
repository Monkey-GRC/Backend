// Lo que relee el servicio entero dentro de la transacción (D91, D132): con la base lejos (desarrollo contra una base remota) los 5 s por defecto de Prisma no alcanzan.
export const STATE_TRANSACTION = { timeoutMs: 30_000 };
