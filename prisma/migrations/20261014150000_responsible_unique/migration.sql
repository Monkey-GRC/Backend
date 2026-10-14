-- MD-133 · Un mismo cargo con la misma persona no se repite en la organización (puede haber varios propietarios de activo, con nombres distintos).
CREATE UNIQUE INDEX "organization_responsibles_organization_id_type_person_name_key" ON "tenant"."organization_responsibles"("organization_id", "type", "person_name");
