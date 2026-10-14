-- MD-157 · Asignación de consultores a empresas (modelo-datos.md §5.2, D64) en lugar de la de auditores (D63: el auditor pertenece a UNA empresa y
-- no necesita asignación), y fuera los roles personalizados (D64, DT-67).

-- Estas tablas reemplazan a otras. Si traen datos, esta migración se detiene en vez de perderlos en silencio: hay que decidir qué hacer con ellos.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "platform"."auditor_assignments") THEN
    RAISE EXCEPTION 'auditor_assignments tiene filas: el auditor ya no se asigna (D63). Revisa y vacía la tabla antes de migrar.';
  END IF;
  IF EXISTS (SELECT 1 FROM "platform"."custom_roles") OR EXISTS (SELECT 1 FROM "platform"."users" WHERE "custom_role_id" IS NOT NULL) THEN
    RAISE EXCEPTION 'Hay roles personalizados en uso: el modelo ya no los contempla (D64). Revisa antes de migrar.';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "platform"."consultant_assignment_status" AS ENUM ('active', 'suspended', 'revoked');

-- DropForeignKey
ALTER TABLE "platform"."auditor_assignments" DROP CONSTRAINT "auditor_assignments_assigned_by_fkey";
ALTER TABLE "platform"."auditor_assignments" DROP CONSTRAINT "auditor_assignments_auditor_user_id_fkey";
ALTER TABLE "platform"."auditor_assignments" DROP CONSTRAINT "auditor_assignments_company_id_fkey";
ALTER TABLE "platform"."custom_roles" DROP CONSTRAINT "custom_roles_company_id_fkey";
ALTER TABLE "platform"."users" DROP CONSTRAINT "users_custom_role_id_fkey";

-- DropIndex
DROP INDEX "platform"."users_custom_role_id_idx";

-- AlterTable
ALTER TABLE "platform"."users" DROP COLUMN "custom_role_id";

-- DropTable
DROP TABLE "platform"."auditor_assignments";
DROP TABLE "platform"."custom_roles";

-- CreateTable
CREATE TABLE "platform"."consultant_assignments" (
    "id" UUID NOT NULL,
    "consultant_user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "status" "platform"."consultant_assignment_status" NOT NULL DEFAULT 'active',
    "status_changed_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_changed_at" TIMESTAMP(3),

    CONSTRAINT "consultant_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultant_assignments_company_id_idx" ON "platform"."consultant_assignments"("company_id");
CREATE UNIQUE INDEX "consultant_assignments_consultant_user_id_company_id_key" ON "platform"."consultant_assignments"("consultant_user_id", "company_id");

-- AddForeignKey
ALTER TABLE "platform"."consultant_assignments" ADD CONSTRAINT "consultant_assignments_consultant_user_id_fkey" FOREIGN KEY ("consultant_user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "platform"."consultant_assignments" ADD CONSTRAINT "consultant_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "platform"."consultant_assignments" ADD CONSTRAINT "consultant_assignments_status_changed_by_fkey" FOREIGN KEY ("status_changed_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "platform"."consultant_assignments" ADD CONSTRAINT "consultant_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS ------------------------------------------------------------------------------------------------------------------------------------------
-- Es el único acceso entre empresas, así que su política es la excepción documentada (§5.2): la empresa ve quiénes la atienden, el consultor ve
-- SUS asignaciones sin importar el tenant activo, y admin_monkey las ve todas. Crea solo admin_monkey. Nunca se borra: el final de una asignación
-- es `revoked`, y el historial queda para el auditor (CC6.3).
ALTER TABLE "platform"."consultant_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform"."consultant_assignments" FORCE ROW LEVEL SECURITY;

CREATE POLICY consultant_assignments_select ON "platform"."consultant_assignments" FOR SELECT
  USING (
    company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR consultant_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );
CREATE POLICY consultant_assignments_insert ON "platform"."consultant_assignments" FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
-- Cambia una asignación solo el administrador de LA empresa (suspender y reactivar) o admin_monkey (retirar). Ni el consultor ni el auditor ni un
-- funcional: que su empresa activa coincida no basta.
CREATE POLICY consultant_assignments_update ON "platform"."consultant_assignments" FOR UPDATE
  USING (
    (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid AND current_setting('app.user_role', true) = 'admin_empresa')
    OR current_setting('app.user_role', true) = 'admin_monkey'
  )
  WITH CHECK (
    (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid AND current_setting('app.user_role', true) = 'admin_empresa')
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );

-- Quién puede cambiar el estado (D64). Es una regla de seguridad (CC6.3): "una suspensión de la empresa solo la reactiva la empresa; admin_monkey no
-- puede, porque anularía el control de la empresa sobre sus propios datos". Por eso la hace cumplir la base y no solo el caso de uso.
--  · suspender → solo admin_empresa, de SU empresa (lo garantiza la política de arriba)
--  · reactivar una suspendida → solo admin_empresa
--  · revocar → solo admin_monkey
-- También sella quién y cuándo cambió el estado, para que no dependa de que la aplicación lo recuerde.
CREATE FUNCTION "platform".consultant_assignment_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  actor_role text := current_setting('app.user_role', true);
BEGIN
  IF NEW.consultant_user_id <> OLD.consultant_user_id OR NEW.company_id <> OLD.company_id OR NEW.assigned_by <> OLD.assigned_by THEN
    RAISE EXCEPTION 'Una asignación no cambia de consultor, de empresa ni de quien la hizo' USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'suspended' AND actor_role IS DISTINCT FROM 'admin_empresa' THEN
      RAISE EXCEPTION 'Solo la empresa puede suspender a un consultor' USING ERRCODE = '42501';
    ELSIF OLD.status = 'suspended' AND NEW.status = 'active' AND actor_role IS DISTINCT FROM 'admin_empresa' THEN
      RAISE EXCEPTION 'Una suspensión de la empresa solo la reactiva la empresa' USING ERRCODE = '42501';
    ELSIF NEW.status = 'revoked' AND actor_role IS DISTINCT FROM 'admin_monkey' THEN
      RAISE EXCEPTION 'Solo admin_monkey retira una asignación' USING ERRCODE = '42501';
    END IF;
    NEW.status_changed_by := NULLIF(current_setting('app.user_id', true), '')::uuid;
    NEW.status_changed_at := now();
  ELSE
    NEW.status_changed_by := OLD.status_changed_by;
    NEW.status_changed_at := OLD.status_changed_at;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER consultant_assignment_guard BEFORE UPDATE ON "platform"."consultant_assignments"
  FOR EACH ROW EXECUTE FUNCTION "platform".consultant_assignment_guard();
