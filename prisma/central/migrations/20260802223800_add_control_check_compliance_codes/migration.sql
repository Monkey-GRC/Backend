-- Migración de catch-up: estas columnas ya existían físicamente en la base
-- central (aplicadas fuera del historial de Prisma en algún momento previo)
-- pero nunca quedaron registradas como migración. Se registra tal cual está
-- hoy la base real, sin modelarlas todavía en schema.prisma (no están en uso).
ALTER TABLE "mnk_control_checks" ADD COLUMN IF NOT EXISTS "cis_code" TEXT;
ALTER TABLE "mnk_control_checks" ADD COLUMN IF NOT EXISTS "pci_dss_code" TEXT;
ALTER TABLE "mnk_control_checks" ADD COLUMN IF NOT EXISTS "soc2_code" TEXT;
