import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../common/swagger/shared.responses';

// Forma del `data` de contracts/modules/compliance-audit.md (MD-154), solo para la documentación (la arma observation-response.mapper.ts).

export class ObservationAuthorResponse extends PersonResponse {
  @ApiProperty({ example: 'auditor', description: 'Siempre `auditor`: solo él escribe observaciones.' }) role!: string;
}

export class ObservationResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'El control del que habla (también cuando solo se mandó la evidencia). Nulo si habla del servicio completo.' }) client_control_id!: string | null;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'La entrega de evidencia que comenta, si comenta una.' }) evidence_submission_id!: string | null;
  @ApiProperty({ enum: ['observation', 'recommendation', 'information_request'], enumName: 'AuditObservationType' }) type!: string;
  @ApiProperty({ description: 'Lo que el auditor le dice a la empresa.' }) body!: string;
  @ApiProperty({ enum: ['open', 'answered', 'closed'], enumName: 'AuditObservationStatus', description: '`open` → `answered` → `closed`. Una cerrada no se modifica ni se reabre.' }) status!: string;
  @ApiProperty({ type: ObservationAuthorResponse, description: 'Quién la escribió: el único que puede editarla, devolverla o cerrarla.' }) created_by!: ObservationAuthorResponse;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ nullable: true, description: 'Qué hizo la empresa para atenderla. Al devolverla a `open` se conserva la última respuesta hasta que la empresa dé otra.' }) answer_note!: string | null;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'La entrega de evidencia que respalda la respuesta.' }) answer_evidence_id!: string | null;
  @ApiProperty({ type: PersonResponse, nullable: true }) answered_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) answered_at!: string | null;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Siempre quien la escribió.' }) closed_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) closed_at!: string | null;
}
