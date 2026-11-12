-- D111 (MD-211): el idioma en el que cada persona usa Monkey. Con él salen sus correos. Aditiva: un enum y una columna con valor por defecto.
CREATE TYPE "platform"."language" AS ENUM ('es', 'en');

ALTER TABLE "platform"."users" ADD COLUMN "preferred_language" "platform"."language" NOT NULL DEFAULT 'es';
