-- MD-220 · Índices para «el último resultado» con DISTINCT ON: el cálculo de cumplimiento deja de leer y ordenar todo el histórico de evaluaciones y veredictos.
-- Reversa: DROP INDEX "tenant"."evaluations_latest_idx"; DROP INDEX "tenant"."test_verdicts_service_id_test_id_registered_at_id_idx";
--          CREATE INDEX "test_verdicts_service_id_test_id_registered_at_idx" ON "tenant"."test_verdicts"("service_id", "test_id", "registered_at");

-- Parcial en `origin <> 'manual'`: es el WHERE literal de la consulta (las manuales son las anteriores a D121, ya migradas a test_verdicts) y deja el índice sin esas filas. El orden y
-- las columnas son los del DISTINCT ON; `result` va incluida para poder leerlo sin ir a la tabla. No lo declara el schema de Prisma (no soporta índices parciales, como los demás de este tipo).
-- Se conserva evaluations(service_id, client_control_id, evaluated_at): lo usan otras lecturas y este no incluye las manuales.
CREATE INDEX "evaluations_latest_idx" ON "tenant"."evaluations"("service_id", "client_control_id", "test_id", "asset_id", "evaluated_at" DESC, "id" DESC) INCLUDE ("result") WHERE "origin" <> 'manual';

-- Sirve al DISTINCT ON (service_id, test_id) con el desempate por id. Contiene como prefijo al anterior (service_id, test_id, registered_at), que queda redundante y se elimina.
CREATE INDEX "test_verdicts_service_id_test_id_registered_at_id_idx" ON "tenant"."test_verdicts"("service_id", "test_id", "registered_at" DESC, "id" DESC);
DROP INDEX "tenant"."test_verdicts_service_id_test_id_registered_at_idx";
