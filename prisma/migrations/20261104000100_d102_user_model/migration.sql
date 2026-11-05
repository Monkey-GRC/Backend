-- D102 y D103 · De `funcional` con especialidad por dimensión a la cadena responsable → delegado: roles nuevos, grupos, dueño y ejecutor por control del cliente
-- (`client_control_assignments`), cupo de usuarios (`companies.max_users`) y revisión de evidencia por dos roles. Se eliminan `user_dimensions`,
-- `service_dimension_owners` y `user_control_assignments` (las asignaciones por dimensión no se traducen: el reparto se rehace con MD-192). RLS y CHECK van en 20261104000200.

-- AlterEnum · La función de login devuelve el tipo, así que se suelta y se vuelve a crear igual (como en 20261030000100).
BEGIN;
DROP FUNCTION platform.find_login_candidates(text);
CREATE TYPE "platform"."user_role_new" AS ENUM ('admin_monkey', 'admin_empresa', 'responsable', 'delegado', 'auditor');
-- No hay entornos con datos reales: cualquier cuenta `funcional` que quede pasa a `responsable` (sin acceso extra) para no perder la cuenta ni romper sus referencias.
ALTER TABLE "platform"."users" ALTER COLUMN "role" TYPE "platform"."user_role_new"
  USING ((CASE WHEN "role"::text = 'funcional' THEN 'responsable' ELSE "role"::text END)::"platform"."user_role_new");
ALTER TYPE "platform"."user_role" RENAME TO "user_role_old";
ALTER TYPE "platform"."user_role_new" RENAME TO "user_role";
DROP TYPE "platform"."user_role_old";

CREATE FUNCTION platform.find_login_candidates(p_email text)
 RETURNS TABLE(id uuid, company_id uuid, password_hash text, role platform.user_role, status platform.user_status, is_mfa_enabled boolean, failed_login_attempts integer, locked_until timestamp without time zone, password_changed_at timestamp without time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'platform', 'pg_temp'
AS $function$
  SELECT u.id, u.company_id, u.password_hash, u.role,
         CASE WHEN c.status = 'deactivated' THEN 'inactive'::platform.user_status ELSE u.status END,
         u.is_mfa_enabled, u.failed_login_attempts, u.locked_until, u.password_changed_at
  FROM platform.users u
  JOIN platform.companies c ON c.id = u.company_id
  WHERE u.email = lower(p_email);
$function$;

REVOKE ALL ON FUNCTION platform.find_login_candidates(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_login_candidates(text) TO monkey_app;
COMMIT;

-- AlterEnum
ALTER TYPE "tenant"."evidence_reviewer_role" ADD VALUE 'responsable';

-- DropForeignKey
ALTER TABLE "platform"."user_control_assignments" DROP CONSTRAINT "user_control_assignments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_control_assignments" DROP CONSTRAINT "user_control_assignments_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_control_assignments" DROP CONSTRAINT "user_control_assignments_client_control_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_control_assignments" DROP CONSTRAINT "user_control_assignments_company_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_dimensions" DROP CONSTRAINT "user_dimensions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_dimensions" DROP CONSTRAINT "user_dimensions_company_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."service_dimension_owners" DROP CONSTRAINT "service_dimension_owners_user_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."service_dimension_owners" DROP CONSTRAINT "service_dimension_owners_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "platform"."service_dimension_owners" DROP CONSTRAINT "service_dimension_owners_service_id_fkey";

-- DropForeignKey
ALTER TABLE "platform"."service_dimension_owners" DROP CONSTRAINT "service_dimension_owners_company_id_fkey";

-- AlterTable
ALTER TABLE "platform"."companies" ADD COLUMN     "max_users" INTEGER;

-- AlterTable
ALTER TABLE "platform"."users" ADD COLUMN     "group_id" UUID,
ADD COLUMN     "is_internal" BOOLEAN;

-- DropTable
DROP TABLE "platform"."user_control_assignments";

-- DropTable
DROP TABLE "platform"."user_dimensions";

-- DropTable
DROP TABLE "platform"."service_dimension_owners";

-- CreateTable
CREATE TABLE "platform"."user_groups" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "leader_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."client_control_assignments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "executor_id" UUID,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_control_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_groups_company_id_idx" ON "platform"."user_groups"("company_id");

-- CreateIndex
CREATE INDEX "user_groups_leader_id_idx" ON "platform"."user_groups"("leader_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_control_assignments_client_control_id_key" ON "platform"."client_control_assignments"("client_control_id");

-- CreateIndex
CREATE INDEX "client_control_assignments_company_id_idx" ON "platform"."client_control_assignments"("company_id");

-- CreateIndex
CREATE INDEX "client_control_assignments_owner_id_idx" ON "platform"."client_control_assignments"("owner_id");

-- CreateIndex
CREATE INDEX "client_control_assignments_executor_id_idx" ON "platform"."client_control_assignments"("executor_id");

-- CreateIndex
CREATE INDEX "users_group_id_idx" ON "platform"."users"("group_id");

-- AddForeignKey
ALTER TABLE "platform"."users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "platform"."user_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_groups" ADD CONSTRAINT "user_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_groups" ADD CONSTRAINT "user_groups_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."client_control_assignments" ADD CONSTRAINT "client_control_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."client_control_assignments" ADD CONSTRAINT "client_control_assignments_client_control_id_fkey" FOREIGN KEY ("client_control_id") REFERENCES "tenant"."client_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."client_control_assignments" ADD CONSTRAINT "client_control_assignments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."client_control_assignments" ADD CONSTRAINT "client_control_assignments_executor_id_fkey" FOREIGN KEY ("executor_id") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."client_control_assignments" ADD CONSTRAINT "client_control_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

