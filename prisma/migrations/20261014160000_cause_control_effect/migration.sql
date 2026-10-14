-- MD-122 · El vínculo causa–acción lleva si el control es obligatorio y si reduce la probabilidad o el impacto (D75). Hoy solo 9 de las 209 relaciones del comité
-- traen el efecto (`P22`): el resto queda en null y no participa del riesgo residual.
CREATE TYPE "tenant"."cause_control_effect" AS ENUM ('probability', 'impact');
ALTER TABLE "tenant"."client_cause_controls" ADD COLUMN "is_mandatory" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tenant"."client_cause_controls" ADD COLUMN "effect" "tenant"."cause_control_effect";
