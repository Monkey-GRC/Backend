-- MD-529 · Los avisos de la corrección del nivel (R5), el plan de remediación y el «No aplica» (contracts/enums/notificaciones.md). ADITIVA: solo agrega valores al enum; ninguno existente cambia.
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'level_override_proposed';
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'level_override_decided';
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'remediation_plan_proposed';
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'remediation_plan_decided';
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'not_applicable_requested';
ALTER TYPE "platform"."notification_type" ADD VALUE IF NOT EXISTS 'not_applicable_decided';
