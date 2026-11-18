-- D123 · Tipo de dispositivo (`computer`, `mobile`, `tablet`) de los dispositivos recordados (MD-217). Nullable: las filas anteriores lo deducen del `os` al leer.
-- Reversa: ALTER TABLE "platform"."trusted_devices" DROP COLUMN "device_type";

-- AlterTable
ALTER TABLE "platform"."trusted_devices" ADD COLUMN "device_type" TEXT;
