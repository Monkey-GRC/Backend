/*
  Warnings:

  - Added the required column `company_id` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `user_control_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platform"."sessions" ADD COLUMN     "company_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "platform"."user_control_assignments" ADD COLUMN     "company_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "platform"."user_control_assignments" ADD CONSTRAINT "user_control_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."sessions" ADD CONSTRAINT "sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
