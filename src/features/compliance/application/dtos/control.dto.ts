import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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

// PATCH /v1/controls/{id} (D96). Cambia la interpretación o las dimensiones al instante; el contenido lo valida `validateControlEdit` y los errores vuelven por campo.
export class EditClientControlDto {
  @ApiPropertyOptional({ type: Object, description: 'La interpretación nueva: `{ "text": "…" }` (máx. 4000). Queda marcada como personalizada y se conserva el texto del catálogo.' }) @IsOptional() @IsObject() interpretation?: { text?: unknown };
  @ApiPropertyOptional({ type: [Object], description: 'Las dimensiones a cambiar: `[{ "dimension": "database", "applies": false, "reason_not_applicable": "…" }]`. Una que no aplica exige el motivo.' }) @IsOptional() @IsArray() dimensions?: unknown[];
}