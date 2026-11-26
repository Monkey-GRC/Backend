-- MD-508, D153 · El historial de cambios de los parámetros de evaluación (D149). Aditiva: tabla nueva. La escribe el PATCH de catalog-admin en su transacción; la leen las pasadas por empresa
-- para avisar `check_parameters_changed` sin leer `audit_logs` (cuyas filas de plataforma, sin tenant, no ve una sesión de empresa).
-- CreateTable
CREATE TABLE "catalog"."evaluation_parameter_changes" (
    "id" UUID NOT NULL,
    "parameter_key" TEXT NOT NULL,
    "code" TEXT,
    "previous_value" JSONB NOT NULL,
    "new_value" JSONB NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,

    CONSTRAINT "evaluation_parameter_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluation_parameter_changes_changed_at_idx" ON "catalog"."evaluation_parameter_changes"("changed_at");
