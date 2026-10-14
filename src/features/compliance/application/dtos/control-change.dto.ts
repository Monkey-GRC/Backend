import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// POST /v1/services/{service_id}/controls (contracts/modules/compliance-controls.md, MD-150)
export class CreateControlDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(4000) interpretation!: string;
  @ApiProperty({ enum: ['security', 'availability', 'confidentiality', 'integrity', 'privacy'] })
  @IsIn(['security', 'availability', 'confidentiality', 'integrity', 'privacy'])
  trust_criterion!: string;
  // Opcional: un control propio es solo documental. Que sea `policy` lo comprueba la validación, con su propio código de campo.
  @ApiPropertyOptional() @IsOptional() @IsArray() dimensions?: unknown[];
}

// POST /v1/controls/{id}/changes (MD-118). `create` no se acepta aquí: nace con POST …/controls.
export class ProposeChangeDto {
  @ApiProperty({ enum: ['retire', 'edit_dimensions', 'edit_interpretation'] })
  @IsIn(['retire', 'edit_dimensions', 'edit_interpretation'])
  change_type!: 'retire' | 'edit_dimensions' | 'edit_interpretation';
  // El contenido depende del tipo: lo valida `validateProposal`, que devuelve los errores por campo del contrato.
  @ApiPropertyOptional() @IsOptional() @IsObject() proposed_values?: Record<string, unknown>;
}

// GET /v1/controls/{id}/changes
export class ListChangesQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'] }) @IsOptional() @IsIn(['pending', 'approved', 'rejected']) status?: 'pending' | 'approved' | 'rejected';
}
