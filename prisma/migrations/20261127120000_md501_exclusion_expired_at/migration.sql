-- MD-501 · Cuándo la tarea diaria registró el vencimiento de la excepción (aditiva: nullable, sin default).
ALTER TABLE "tenant"."exclusions" ADD COLUMN "expired_at" TIMESTAMPTZ(3);
