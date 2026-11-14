-- D117 · Cuentas de administrador de Monkey (MD-215): desactivar da 7 días de gracia y luego la cuenta se borra por completo.
--
--   1. `users.purge_at`: cuándo se borra la cuenta de un admin_monkey en gracia (nulo en el resto).
--   2. `audit.admin_tombstones`: el sello de quien ya no existe (id, nombre, rol). Sin clave foránea: esa fila de `users` ya no está.
--   3. Fuera la clave foránea (queda la columna uuid, sin perder ningún dato) de toda columna que atribuye algo a un admin_monkey: el audit trail no se reescribe
--      y la cuenta se borra, así que la atribución no puede impedir el borrado. Revisadas todas las claves hacia `platform.users`; el resto es de roles de una empresa
--      cliente (admin_empresa, responsable, delegado, auditor), que nunca se purgan, o de las filas propias de la cuenta, que se borran con ella.
--
-- Reversa (sin pérdida de datos mientras no se haya purgado a nadie): ADD COLUMN/ADD CONSTRAINT inversos; las seis claves foráneas se vuelven a crear con
--   ALTER TABLE <t> ADD CONSTRAINT <mismo nombre> FOREIGN KEY (<col>) REFERENCES platform.users(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- y fallan si una cuenta ya se purgó (su atribución quedó sin fila): por eso la reversa se hace antes de la primera purga o con respaldo (D42).
-- Solo el cambio de schema; los triggers, permisos y RLS van aparte (20261113000600_rls_admin_accounts).

-- DropForeignKey
ALTER TABLE "audit"."audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "audit"."compliance_events" DROP CONSTRAINT "compliance_events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog"."catalog_versions" DROP CONSTRAINT "catalog_versions_published_by_fkey";

-- DropForeignKey
ALTER TABLE "platform"."access_keys" DROP CONSTRAINT "access_keys_created_by_fkey";

-- DropForeignKey
ALTER TABLE "platform"."company_frameworks" DROP CONSTRAINT "company_frameworks_contracted_by_fkey";

-- DropForeignKey
ALTER TABLE "platform"."user_activation_codes" DROP CONSTRAINT "user_activation_codes_created_by_fkey";

-- AlterTable
ALTER TABLE "platform"."users" ADD COLUMN     "purge_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "audit"."admin_tombstones" (
    "user_id" UUID NOT NULL,
    "name" TEXT,
    "last_name" TEXT,
    "role" "platform"."user_role" NOT NULL,
    "purged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_tombstones_pkey" PRIMARY KEY ("user_id")
);
