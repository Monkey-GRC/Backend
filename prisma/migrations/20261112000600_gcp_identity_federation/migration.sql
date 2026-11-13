-- D112 (MD-214): GCP se conecta por federación de identidad. Aditiva: un valor de enum y una columna nullable (el número de proyecto, que no es secreto).
ALTER TYPE "tenant"."connection_method" ADD VALUE 'identity_federation';

ALTER TABLE "tenant"."asset_provisionings" ADD COLUMN "project_number" TEXT;
