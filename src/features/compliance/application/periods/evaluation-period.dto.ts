import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// contracts/modules/compliance-overview.md (D87, MD-168). El formato de la fecha y el orden (inicio < fin, mínimo de SOC 2, corte dentro del período y no futuro) se validan en
// `evaluation-period.validation.ts`, que devuelve `date.invalid`, `period.invalid_range`, `period.too_short`, `cutoff.out_of_period` y `cutoff.in_future` como dice el contrato.
export class SetEvaluationPeriodDto {
  @ApiProperty({ example: '2026-01-01', description: 'Inicio del período auditado (YYYY-MM-DD).' }) @IsString() @IsNotEmpty() period_start!: string;
  @ApiProperty({ example: '2026-12-31', description: 'Fin del período auditado (YYYY-MM-DD). Posterior al inicio; en SOC 2 el período dura como mínimo 6 meses (PR-16).' }) @IsString() @IsNotEmpty() period_end!: string;
  @ApiPropertyOptional({
    nullable: true,
    example: null,
    description: 'Fecha de corte (YYYY-MM-DD) para **congelarla**: debe caer dentro del período y no estar en el futuro. Ausente o `null` = «hoy» (y borra una fecha congelada anterior).',
  })
  @IsOptional() @IsString() cutoff_date?: string | null;
}
