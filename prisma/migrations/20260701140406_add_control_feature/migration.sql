-- CreateEnum
CREATE TYPE "public"."ControlType" AS ENUM ('MANUAL', 'AUTOMATIC', 'HYBRID');

-- AlterTable
ALTER TABLE "public"."mnk_controls" ADD COLUMN     "type" "public"."ControlType" NOT NULL DEFAULT 'MANUAL',
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."mnk_controls" ADD CONSTRAINT "mnk_controls_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mnk_controls" ADD CONSTRAINT "mnk_controls_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

