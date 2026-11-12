-- MD-211 · El nombre neutro de una prueba también en inglés (D70). Nullable: sin él, la API muestra `display_name`. Aditiva.
ALTER TABLE "catalog"."tests" ADD COLUMN "display_name_en" TEXT;

-- Las 11 pruebas T-CLD (nube) ya traducidas. Idempotente: solo llena lo que está vacío. En una base nueva las pruebas aún no existen aquí y las llena
-- `catalog:load` (prisma/seed/soc2/display-names.ts, el mismo dato).
UPDATE "catalog"."tests" t SET "display_name_en" = v.name_en
FROM (VALUES
  ('T-CLD-001', 'Assessment of IAM, MFA and privileged accounts at the cloud provider'),
  ('T-CLD-002', 'Assessment of encryption, network, public exposure and storage in the cloud'),
  ('T-CLD-003', 'Assessment of logging, monitoring and backups/replication in the cloud'),
  ('T-CLD-004', 'Verification of capacity and performance monitoring in the cloud (Azure) with threshold alerts'),
  ('T-CLD-005', 'Operational verification of log ingestion, retention and review (SIEM/log management)'),
  ('T-CLD-006', 'Operational verification of infrastructure performance monitoring with threshold alerts (Azure)'),
  ('T-CLD-007', 'Verification of replication failure alerts to administrators'),
  ('T-CLD-008', 'Operational verification of production backups, separate location and restore tests'),
  ('T-CLD-009', 'Verification of the multi-availability-zone architecture in production'),
  ('T-CLD-010', 'Intrusion detection and network threat monitoring in the cloud'),
  ('T-CLD-011', 'Validation of the password and authentication policy at the cloud provider (IAM/Entra ID)')
) AS v(code, name_en)
WHERE t."code" = v.code AND t."display_name_en" IS NULL;
