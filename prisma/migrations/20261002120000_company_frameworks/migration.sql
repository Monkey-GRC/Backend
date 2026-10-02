-- Marcos contratados por empresa (D43). Monkey Admin contrata el marco al registrar la empresa
-- (hoy solo SOC 2, D37) y, al declarar un servicio, el cliente solo puede elegir entre los que su
-- empresa tiene contratados. Revierte el veto de modelo-datos.md §6.1 («los marcos se contratan
-- por servicio»): el servicio sigue guardando cuál persigue (service_frameworks), pero la
-- contratación comercial vive aquí.

CREATE TABLE "platform"."company_frameworks" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "contracted_by" UUID NOT NULL,
    "contracted_at" DATE NOT NULL,

    CONSTRAINT "company_frameworks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "company_frameworks_company_id_framework_id_key" ON "platform"."company_frameworks"("company_id", "framework_id");
CREATE INDEX "company_frameworks_framework_id_idx" ON "platform"."company_frameworks"("framework_id");
CREATE INDEX "company_frameworks_contracted_by_idx" ON "platform"."company_frameworks"("contracted_by");

ALTER TABLE "platform"."company_frameworks" ADD CONSTRAINT "company_frameworks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "platform"."company_frameworks" ADD CONSTRAINT "company_frameworks_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "catalog"."frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "platform"."company_frameworks" ADD CONSTRAINT "company_frameworks_contracted_by_fkey" FOREIGN KEY ("contracted_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: la empresa LEE lo suyo (y admin_monkey todo); SOLO admin_monkey escribe. Un cliente no puede
-- contratarse un marco por su cuenta, ni siquiera con acceso directo a la base como monkey_app.
ALTER TABLE "platform"."company_frameworks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform"."company_frameworks" FORCE ROW LEVEL SECURITY;

CREATE POLICY company_frameworks_read ON "platform"."company_frameworks" FOR SELECT
  USING (
    company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    OR current_setting('app.user_role', true) = 'admin_monkey'
  );
CREATE POLICY company_frameworks_insert_admin ON "platform"."company_frameworks" FOR INSERT
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY company_frameworks_update_admin ON "platform"."company_frameworks" FOR UPDATE
  USING (current_setting('app.user_role', true) = 'admin_monkey')
  WITH CHECK (current_setting('app.user_role', true) = 'admin_monkey');
CREATE POLICY company_frameworks_delete_admin ON "platform"."company_frameworks" FOR DELETE
  USING (current_setting('app.user_role', true) = 'admin_monkey');
