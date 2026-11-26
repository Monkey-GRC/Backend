-- MD-504 · DESTRUCTIVA. Borra lo que la aprobación del control (D132) y el resultado manual (D140) dejaron sin uso: `test_verdict_reviews`, `test_verdicts` (D85, D121), `evidence_reviews` (D102)
-- y `action_plans` (v1, sin ninguna escritura; el plan de remediación nuevo es de MD-529), con sus tipos y la función de inmutabilidad de los veredictos.
-- Va aparte de la aditiva (20261126130000) y NO se aplica en la base dev compartida antes del merge: la aplica el despliegue. Los datos de esas tablas se pierden (no hay clientes reales, 2026-11-25).
-- Reversa: no hay; habría que restaurar el respaldo (D42).

DROP TABLE "tenant"."test_verdict_reviews";
DROP TABLE "tenant"."test_verdicts";
DROP TABLE "tenant"."evidence_reviews";
DROP TABLE "tenant"."action_plans";

DROP FUNCTION IF EXISTS tenant.reject_verdict_mutation();

DROP TYPE "tenant"."verdict_review_decision";
DROP TYPE "tenant"."verdict_result";
DROP TYPE "tenant"."evidence_reviewer_role";
DROP TYPE "tenant"."evidence_review";
DROP TYPE "tenant"."action_plan_status";
