-- D58: flujo de conexión de la nube. El tipo de ejecución (validación o evaluación) y lo que el cliente configura en su cuenta (ExternalId, ARN del rol).
-- Solo cambio de schema; la función de reclamo por tipo va en la migración siguiente.


-- CreateEnum
CREATE TYPE "tenant"."execution_kind" AS ENUM ('assessment', 'validation');

-- AlterTable
ALTER TABLE "tenant"."asset_provisionings" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "role_arn" TEXT;

-- AlterTable
ALTER TABLE "tenant"."executions" ADD COLUMN     "kind" "tenant"."execution_kind" NOT NULL DEFAULT 'assessment';

