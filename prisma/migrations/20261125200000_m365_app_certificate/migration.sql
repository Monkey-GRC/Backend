-- D154: Microsoft 365 se conecta con una aplicación del cliente y un certificado que genera Monkey. Aditiva: un valor de enum y cuatro columnas nulas, ninguna secreta
-- (la clave privada y el PFX van cifrados en `encrypted_credentials`). El canal y la opción del asistente son datos de referencia: los carga reference:load.
ALTER TYPE "tenant"."connection_method" ADD VALUE 'app_certificate';

ALTER TABLE "tenant"."asset_provisionings"
  ADD COLUMN "app_client_id" TEXT,
  ADD COLUMN "certificate_pem" TEXT,
  ADD COLUMN "certificate_thumbprint" TEXT,
  ADD COLUMN "certificate_expires_at" TIMESTAMP(3);
