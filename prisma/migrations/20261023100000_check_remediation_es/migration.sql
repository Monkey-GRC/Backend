-- D90 · La guía de corrección de una comprobación en español (`remediation_es`) y de quién es (`translation_origin`: `machine` = traducción automática sin revisar, `reviewed` = revisada por una persona).
-- `title_es` ya existía. Aditiva y nula: lo que no está traducido sigue saliendo en el original.
-- CreateEnum
CREATE TYPE "catalog"."check_translation_origin" AS ENUM ('machine', 'reviewed');

-- AlterTable
ALTER TABLE "catalog"."checks" ADD COLUMN     "remediation_es" TEXT,
ADD COLUMN     "translation_origin" "catalog"."check_translation_origin";
