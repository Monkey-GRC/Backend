import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// POST /v1/services/{service_id}/controls (contracts/modules/compliance-controls.md, MD-150)
export class CreateControlDto {
  @ApiProperty({ description: 'Nombre del control propio (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty({ description: 'Cómo aplica el control al servicio (máx. 4000).' }) @IsString() @IsNotEmpty() @MaxLength(4000) interpretation!: string;
  @ApiProperty({ enum: ['security', 'availability', 'confidentiality', 'integrity', 'privacy'], enumName: 'TrustCriterion', description: 'Categoría (criterio de confianza) del control propio.' })
  @IsIn(['security', 'availability', 'confidentiality', 'integrity', 'privacy'])
  trust_criterion!: string;
  // Opcional: un control propio es solo documental. Que sea `policy` lo comprueba la validación, con su propio código de campo.
  @ApiPropertyOptional({ type: [Object], description: 'Opcional. Un control propio es solo documental: si se envía, solo se acepta la dimensión `policy`.' }) @IsOptional() @IsArray() dimensions?: unknown[];
}

// POST /v1/controls/{id}/changes (MD-118). `create` no se acepta aquí: nace con POST …/controls.
export class ProposeChangeDto {
  @ApiProperty({ enum: ['retire', 'edit_dimensions', 'edit_interpretation'], enumName: 'ProposedChangeType', description: 'Qué se propone. `create` no se acepta aquí: un control nuevo nace con `POST /v1/services/{serviceId}/controls`.' })
  @IsIn(['retire', 'edit_dimensions', 'edit_interpretation'])
  change_type!: 'retire' | 'edit_dimensions' | 'edit_interpretation';
  // El contenido depende del tipo: lo valida `validateProposal`, que devuelve los errores por campo del contrato.
  @ApiPropertyOptional({ type: Object, description: 'Contenido de la propuesta; depende de `change_type` (por ejemplo `dimensions` o `interpretation`). Se valida y los errores vuelven por campo (`proposed_values.dimensions`…).' }) @IsOptional() @IsObject() proposed_values?: Record<string, unknown>;
}

// GET /v1/controls/{id}/changes
export class ListChangesQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'], enumName: 'Approval', description: 'Solo las propuestas en este estado.' }) @IsOptional() @IsIn(['pending', 'approved', 'rejected']) status?: 'pending' | 'approved' | 'rejected';
}
