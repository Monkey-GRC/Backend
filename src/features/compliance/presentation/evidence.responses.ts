import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../common/swagger/shared.responses';
import { DIMENSIONS } from './control.responses';
import { ResponsibleRefResponse } from './responsible.responses';

// Formas del `data` de contracts/modules/compliance-evidence.md, solo para la documentación (las arma evidence-response.mapper.ts).
// D84: la empresa solo aporta la evidencia; la revisión es del consultor y del auditor (MD-127).

export const EVIDENCE_STATES = ['compliant', 'non_compliant', 'pending', 'in_review', 'expired', 'not_applicable'] as const;
export const EVIDENCE_STATE_DOC =
  'Se deriva de la revisión, nadie lo escribe: `pending` espera revisión · `in_review` la IA dio su sugerencia y falta la revisión humana · `compliant`/`non_compliant` los decide una persona · `expired` venció · `not_applicable`. La IA nunca produce «cumple».';

export class AiSuggestionResponse {
  @ApiProperty({ example: true, description: 'Siempre `true`: lo que genera la IA va marcado como tal.' }) is_ai_generated!: boolean;
  @ApiProperty({ nullable: true, example: null, description: 'Confianza de la IA. Hoy no se guarda (siempre `null`).' }) ai_confidence!: number | null;
  @ApiProperty({ description: 'Sugerencia de la IA. Es una inferencia, no un hecho verificado; no aprueba nada.' }) verdict!: string;
}

export class EvidenceTechnicalResponse {
  @ApiProperty({ enum: ['pending_review', 'ai_prevalidated', 'approved', 'rejected'], description: 'Revisión humana. Hasta MD-127 no hay ninguna.' }) review!: string;
  @ApiProperty({ type: Object, description: 'Atributos del test de evidencia que la revisión marca (`type_ok`, `period_ok`, `valid_ok`, `approved_ok`, `signed_ok`, `content_ok`); `null` hasta que se revise.' }) attributes!: Record<string, boolean | null>;
  @ApiProperty({ nullable: true, example: null, description: 'Quién hizo la revisión; `null` mientras no haya ninguna.' }) reviewed_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true, example: null }) reviewed_at!: string | null;
}

export class EvidenceSubmissionResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid', required: false, description: 'Requerimiento al que pertenece. Viaja al subir y al listar las entregas de un requerimiento.' }) requirement_id?: string;
  @ApiProperty({ example: 2, description: 'Versión: crece de uno en uno por requerimiento y una nueva nunca pisa la anterior.' }) version!: number;
  @ApiProperty({ example: 'politica-de-accesos.pdf', description: 'Nombre del archivo, ya limpio. La llave del objeto en el almacenamiento nunca sale.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo canónico detectado por el contenido (PDF, DOCX, XLSX, PNG o JPG).' }) file_type!: string;
  @ApiProperty({ example: 482133, description: 'Tamaño en bytes (máx. 25 MB).' }) file_size!: number;
  @ApiProperty({ example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', description: 'Huella SHA-256 del archivo, para demostrar que no cambió.' }) integrity_hash!: string;
  @ApiProperty({ type: PersonResponse, description: 'Quién la subió.' }) submitted_by!: PersonResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se subió.' }) submitted_at!: string;
  @ApiProperty({ enum: EVIDENCE_STATES, enumName: 'EvidenceState', description: EVIDENCE_STATE_DOC }) evidence_state!: string;
  @ApiProperty({ type: AiSuggestionResponse, nullable: true, description: 'Sugerencia de la IA, si la hay. `null` si no.' }) ai!: AiSuggestionResponse | null;
  @ApiProperty({ type: EvidenceTechnicalResponse, required: false, description: 'Solo en la vista técnica (`view=technical`).' }) technical?: EvidenceTechnicalResponse;
}

export class EvidenceRequirementResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'DOC-001', description: 'Código del requerimiento.' }) code!: string;
  @ApiProperty({ example: 1, description: 'Posición dentro del control.' }) sequence!: number;
  @ApiProperty({ description: 'Qué evidencia se pide.' }) description!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la evidencia.' }) dimension!: string;
  @ApiProperty({ description: 'Si la evidencia debe estar vigente dentro del período evaluado.' }) validity_within_period!: boolean;
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` viene del catálogo clonado · `own` la creó la empresa.' }) origin!: string;
  @ApiProperty({ type: ResponsibleRefResponse, nullable: true, description: 'Cargo responsable de aportarla; `null` si no se asignó.' }) responsible!: ResponsibleRefResponse | null;
  @ApiProperty({ type: EvidenceSubmissionResponse, isArray: true, description: 'Entregas, de la versión más reciente a la más antigua.' }) submissions!: EvidenceSubmissionResponse[];
}

export class EvidenceDownloadResponse {
  @ApiProperty({ format: 'uri', description: 'Enlace firmado. **Vence en 5 minutos**; el archivo nunca es público. Cada enlace generado queda en el rastro de auditoría.' }) url!: string;
  @ApiProperty({ example: 'politica-de-accesos.pdf', description: 'Nombre del archivo.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo del archivo (tipo de contenido).' }) file_type!: string;
  @ApiProperty({ example: 300, description: 'Segundos que dura el enlace.' }) expires_in!: number;
}
