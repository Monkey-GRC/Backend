import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../../common/swagger/shared.responses';

// Forma del `data` de contracts/modules/compliance-audit.md, solo para la documentación (la arma exclusion-response.mapper.ts). El test sale con su nombre neutro
// (D70): nunca el texto del comité ni el proveedor de la sonda.

export class ExclusionTestResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ description: 'Nombre neutro de la prueba.' }) display_name!: string;
}

export class ExclusionAssetResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'srv-app-prod-01' }) name!: string;
}

export class ExclusionResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ type: ExclusionTestResponse, description: 'Prueba que se pide excluir.' }) test!: ExclusionTestResponse;
  @ApiProperty({ type: ExclusionAssetResponse, description: 'Activo al que se le excluye esa prueba.' }) asset!: ExclusionAssetResponse;
  @ApiProperty({ description: 'Por qué se pide la exclusión.' }) justification!: string;
  @ApiProperty({ nullable: true, description: 'Sustento técnico. Obligatorio si la prueba es automática: la evaluación automática no se sobrescribe sin él.' }) technical_justification!: string | null;
  @ApiProperty({ enum: ['pending', 'approved', 'rejected'], enumName: 'ExclusionStatus', description: 'Hoy siempre `approved`: la crea y la decide el admin_empresa en un solo acto (D96). `pending` y `rejected` quedan sin uso.' }) status!: string;
  @ApiProperty({ description: 'Una exclusión aprobada cuya vigencia ya pasó deja de excluir: el activo vuelve a contar.' }) is_expired!: boolean;
  @ApiProperty({ example: '2026-01-01', description: 'Inicio de la vigencia (la fija el período del servicio, no el cliente).' }) valid_from!: string;
  @ApiProperty({ example: '2026-12-31', description: 'Fin de la vigencia.' }) valid_until!: string;
  @ApiProperty({ type: PersonResponse, description: 'Quién la creó (el admin_empresa).' }) proposed_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) requested_at!: string;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Quién la decidió (la misma persona).' }) decided_by!: PersonResponse | null;
  @ApiProperty({ nullable: true, description: 'Nota de la decisión (sin uso por ahora).' }) decision_note!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true }) decided_at!: string | null;
}
