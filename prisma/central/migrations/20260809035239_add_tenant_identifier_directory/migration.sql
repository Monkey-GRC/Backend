CREATE TABLE "mnk_tenant_identifier_directory" (
    "id" UUID NOT NULL,
    "identifier" VARCHAR(150) NOT NULL,
    "client_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mnk_tenant_identifier_directory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mnk_tenant_identifier_directory_identifier_key" ON "mnk_tenant_identifier_directory"("identifier");

CREATE INDEX "mnk_tenant_identifier_directory_client_id_idx" ON "mnk_tenant_identifier_directory"("client_id");

ALTER TABLE "mnk_tenant_identifier_directory"
    ADD CONSTRAINT "mnk_tenant_identifier_directory_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "mnk_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
