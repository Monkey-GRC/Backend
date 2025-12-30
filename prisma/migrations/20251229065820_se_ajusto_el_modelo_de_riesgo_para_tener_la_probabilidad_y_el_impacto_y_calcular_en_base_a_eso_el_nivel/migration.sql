/*
  Warnings:

  - Added the required column `impact` to the `mnk_risks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `mnk_risks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `probability` to the `mnk_risks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "mnk_risks" ADD COLUMN     "impact" INTEGER NOT NULL,
ADD COLUMN     "level" "RiskLevel" NOT NULL,
ADD COLUMN     "probability" INTEGER NOT NULL;
