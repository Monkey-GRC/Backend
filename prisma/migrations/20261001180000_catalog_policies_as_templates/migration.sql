-- Siembra de control_dimensions y policies (D39, cierra P10).
--
--  * policies pasa a ser una plantilla: solo `name` (único). approval_status, valid_until y version eran
--    estado del CLIENTE (aprobar una política, hasta cuándo vale, qué versión), no de una plantilla
--    global; viven en la evidencia que el cliente entrega. Se elimina el enum policy_approval_status.
--  * control_policies.requires_employee_acceptance: el Excel distingue "depende de la aprobación de la
--    política" de "... y la aceptación del empleado".
--
-- ⚠️ Asume VACÍAS policies y control_policies (nunca se sembraron). Las columnas que se eliminan eran
-- NOT NULL sin default, así que la tabla solo podía estar vacía.

-- AlterTable
ALTER TABLE "catalog"."policies" DROP COLUMN "approval_status",
DROP COLUMN "valid_until",
DROP COLUMN "version";

-- DropEnum
DROP TYPE "catalog"."policy_approval_status";

-- CreateIndex
CREATE UNIQUE INDEX "policies_name_key" ON "catalog"."policies"("name");

-- AlterTable
ALTER TABLE "catalog"."control_policies" ADD COLUMN "requires_employee_acceptance" BOOLEAN NOT NULL DEFAULT false;
