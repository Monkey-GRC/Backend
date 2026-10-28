-- D95 · Archivar una empresa y borrarla definitivamente al vencer un plazo.
--
-- `deactivated` es el estado de una empresa archivada: sin acceso ni motores, con sus datos intactos hasta `archive_until`.
-- Los cuatro campos del archivado se vacían al reactivar. `company_purge_log` es lo único que sobrevive al borrado definitivo:
-- nombre, cuándo y quién, sin datos del cliente y sin clave foránea (la fila de la empresa ya no existe).
--
-- Solo el esquema; las funciones que usan el valor nuevo van en la migración siguiente (un valor de enum no se puede
-- usar en la misma transacción que lo agrega).

CREATE TYPE "platform"."company_deactivation_reason" AS ENUM ('non_payment', 'client_request', 'other');

ALTER TYPE "platform"."company_status" ADD VALUE 'deactivated';

ALTER TABLE "platform"."companies"
  ADD COLUMN "deactivated_at" TIMESTAMP(3),
  ADD COLUMN "archive_until" TIMESTAMP(3),
  ADD COLUMN "deactivation_reason_code" "platform"."company_deactivation_reason",
  ADD COLUMN "deactivation_reason" TEXT,
  ADD COLUMN "deactivated_by" UUID,
  ADD COLUMN "archive_snapshot_key" TEXT;

CREATE TABLE "platform"."company_purge_log" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "purged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_by" UUID,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "company_purge_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_purge_log_purged_at_idx" ON "platform"."company_purge_log"("purged_at");

-- RLS: solo admin_monkey lo lee, y nadie lo escribe desde la app: lo escribe `platform.purge_company` (SECURITY DEFINER).
ALTER TABLE "platform"."company_purge_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform"."company_purge_log" FORCE ROW LEVEL SECURITY;

CREATE POLICY company_purge_log_read_admin ON "platform"."company_purge_log" FOR SELECT
  USING (current_setting('app.user_role', true) = 'admin_monkey');

GRANT SELECT ON "platform"."company_purge_log" TO monkey_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON "platform"."company_purge_log" FROM monkey_app;
