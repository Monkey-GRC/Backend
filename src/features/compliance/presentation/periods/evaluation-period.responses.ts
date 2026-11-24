import { ApiProperty } from '@nestjs/swagger';

// Forma del `data` de `PUT …/evaluation-period` (contracts/modules/compliance-overview.md, D87), solo para la documentación (la arma evaluation-period-response.mapper.ts).
export class EvaluationPeriodResponse {
  @ApiProperty({ example: 'soc2', description: 'Código del marco.' }) framework_code!: string;
  @ApiProperty({ example: '3', description: 'Versión del catálogo con la que se evalúa.' }) catalog_version!: string;
  @ApiProperty({ example: '2026-01-01', description: 'Inicio del período auditado (YYYY-MM-DD).' }) period_start!: string;
  @ApiProperty({ example: '2026-12-31', description: 'Fin del período auditado (YYYY-MM-DD).' }) period_end!: string;
  @ApiProperty({ example: '2026-10-20', description: 'Fecha de corte con la que se evalúa: hoy (sin salirse del período) si no está congelada, o la fecha congelada.' }) cutoff_date!: string;
  @ApiProperty({ example: false, description: '`true` si la fecha de corte está congelada; `false` si es «hoy».' }) cutoff_frozen!: boolean;
}

// Un período del histórico (`GET …/evaluation-periods`, D145, D148, MD-500): solo para la documentación (la arma `toEvaluationPeriodItem`).
export class EvaluationPeriodItemResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del período.' }) id!: string;
  @ApiProperty({ enum: ['open', 'closed'], example: 'open', description: 'Estado del período (`evaluation_period_status`): abierto (como mucho uno) o cerrado (histórico, no cambia).' }) status!: string;
  @ApiProperty({ example: '2026-07-01', description: 'Inicio del período auditado (YYYY-MM-DD).' }) period_start!: string;
  @ApiProperty({ example: '2026-12-31', description: 'Fin del período auditado (YYYY-MM-DD).' }) period_end!: string;
  @ApiProperty({ nullable: true, example: null, description: 'Fecha de corte congelada (YYYY-MM-DD); `null` = «hoy».' }) cutoff_date!: string | null;
  @ApiProperty({ enum: ['user', 'system'], example: 'system', description: 'Quién lo abrió (`evaluation_period_origin`): `user` lo declaró el `admin_empresa`; `system` lo abrió la tarea diaria.' }) opened_by!: string;
  @ApiProperty({ nullable: true, example: null, description: 'Cuándo se cerró (ISO 8601 UTC); `null` si está abierto.' }) closed_at!: string | null;
}
