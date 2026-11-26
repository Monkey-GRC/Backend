import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../../common/swagger/shared.responses';
import { DIMENSIONS } from '../../../../common/catalogs/dimensions';
import { ResponsibleRefResponse } from '../responsibles/responsible.responses';

// Formas del `data` de contracts/modules/compliance-evidence.md, solo para la documentación (las arma evidence-response.mapper.ts).
// D102: aportan el ejecutor, el dueño o el admin_empresa; revisan el dueño y el admin_empresa, una revisión por rol (MD-127, MD-194).

export const EVIDENCE_STATES = ['compliant', 'non_compliant', 'pending', 'in_review', 'expired', 'not_applicable'] as const;
export const EVIDENCE_STATE_DOC =
  'Se deriva, nadie lo escribe (D132): `compliant` la entrega cuenta (la cargó el delegado o el responsable y no fue devuelta) · `non_compliant` el control se devolvió por ella y dejó de contar. La vigencia la decide la ventana del motor. La IA nunca produce «cumple».';

export class AiSuggestionResponse {
  @ApiProperty({ example: true, description: 'Siempre `true`: lo que genera la IA va marcado como tal.' }) is_ai_generated!: boolean;
  @ApiProperty({ nullable: true, example: null, description: 'Confianza de la IA. Hoy no se guarda (siempre `null`).' }) ai_confidence!: number | null;
  @ApiProperty({ description: 'Sugerencia de la IA. Es una inferencia, no un hecho verificado; no aprueba nada.' }) verdict!: string;
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
  @ApiProperty({ nullable: true, example: 'Falta la firma de la dirección.', description: 'El motivo de la devolución del control que dejó esta entrega sin contar (D132), que quien subió lee para corregir. `null` si no fue devuelta.' }) review_note!: string | null;
  @ApiProperty({ type: AiSuggestionResponse, nullable: true, description: 'Sugerencia de la IA, si la hay. `null` si no.' }) ai!: AiSuggestionResponse | null;
}

export class EvidenceTestRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'T-DOC-001', description: 'Código de la prueba.' }) code!: string;
  @ApiProperty({ nullable: true, description: 'Nombre neutro de la prueba (D70); el texto del comité no sale.' }) display_name!: string | null;
}

export class EvidenceRequirementResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'DOC-001', description: 'Código del requerimiento.' }) code!: string;
  @ApiProperty({ example: 1, description: 'Posición dentro del control.' }) sequence!: number;
  @ApiProperty({ description: 'Qué evidencia se pide.' }) description!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la evidencia.' }) dimension!: string;
  @ApiProperty({ type: EvidenceTestRefResponse, nullable: true, description: 'La prueba documental de este control a la que sirve la evidencia. `null`: está **compartida** con todas las pruebas documentales del control (así llegan las plantillas del catálogo; D88).' }) test!: EvidenceTestRefResponse | null;
  @ApiProperty({ example: 'Dentro del período de evaluación', description: 'Vigencia que se le pide a la evidencia: «Dentro del período de evaluación» (traducido según `Accept-Language`) o un período concreto (`2026-Q4`).' }) validity_within_period!: string;
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` viene del catálogo clonado · `own` la creó la empresa.' }) origin!: string;
  @ApiProperty({ type: ResponsibleRefResponse, nullable: true, description: 'Cargo responsable de aportarla; `null` si no se asignó.' }) responsible!: ResponsibleRefResponse | null;
  @ApiProperty({ type: EvidenceSubmissionResponse, isArray: true, description: 'Entregas, de la versión más reciente a la más antigua.' }) submissions!: EvidenceSubmissionResponse[];
}

export class ServiceEvidenceItemResponse extends EvidenceRequirementResponse {
  @ApiProperty({ format: 'uuid', description: 'El control del servicio al que pertenece el requerimiento.' }) control_id!: string;
}

export class EvidenceControlRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código del control (D80): el del catálogo o el propio.' }) code!: string;
}

export class TestEvidenceItemResponse extends EvidenceRequirementResponse {
  @ApiProperty({ type: EvidenceControlRefResponse, description: 'El control del servicio al que pertenece este requerimiento (D85).' }) control!: EvidenceControlRefResponse;
}

export class TestEvidenceResponse {
  @ApiProperty({ format: 'uuid', description: 'La prueba cuya evidencia se lista.' }) test_id!: string;
  @ApiProperty({ type: EvidenceControlRefResponse, isArray: true, description: 'Los **otros** controles del servicio que llevan el test, para avisar «este test también aplica a…» (D85). Vacío si es solo de este control o es documental (D88); un `responsable` solo ve aquellos de los que es responsable.' }) shared_with!: EvidenceControlRefResponse[];
  @ApiProperty({ type: TestEvidenceItemResponse, isArray: true, description: 'Requerimientos que sirven al test, con sus entregas y el control de origen.' }) items!: TestEvidenceItemResponse[];
}

export class EvidenceDownloadResponse {
  @ApiProperty({ format: 'uri', description: 'Enlace firmado. **Vence en 5 minutos**; el archivo nunca es público. Cada enlace generado queda en el rastro de auditoría.' }) url!: string;
  @ApiProperty({ example: 'politica-de-accesos.pdf', description: 'Nombre del archivo.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo del archivo (tipo de contenido).' }) file_type!: string;
  @ApiProperty({ enum: ['attachment', 'inline'], enumName: 'EvidenceDisposition', description: 'Cómo se entrega: `attachment` se descarga, `inline` se muestra en pantalla. Va fijado en el enlace firmado.' }) disposition!: string;
  @ApiProperty({ example: 300, description: 'Segundos que dura el enlace.' }) expires_in!: number;
}
