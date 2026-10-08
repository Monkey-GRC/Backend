-- D57: ciclo de vida de una ejecución (en cola → en curso → completada o fallida). Solo cambio de schema; la función de reclamo va en la migración siguiente.

-- AlterTable
ALTER TABLE "tenant"."executions" ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "started_at" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "executions_status_queued_at_idx" ON "tenant"."executions"("status", "queued_at");

