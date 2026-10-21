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
