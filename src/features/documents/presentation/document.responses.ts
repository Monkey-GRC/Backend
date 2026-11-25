import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../common/swagger/shared.responses';
import { DOCUMENT_ACCEPTANCES, DOCUMENT_ORIGINS, DOCUMENT_TYPES, DOCUMENT_VERSION_STATUSES, MY_DOCUMENT_STATUSES } from '../domain/document.types';

// Formas del `data` de contracts/documentos.md, solo para la documentación (las arma document-response.mapper.ts).

export class DocumentVersionSummaryResponse {
  @ApiProperty({ format: 'uuid', description: 'La versión vigente.' }) id!: string;
  @ApiProperty({ example: 2, description: 'Número de la versión: crece de uno en uno por documento.' }) number!: number;
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo se aprobó el documento (fecha, sin hora).' }) approved_at!: string;
  @ApiProperty({ example: true, description: 'Siempre `true` en esta versión de Monkey: la aprobación se importó, no se hizo dentro (D133 punto 5).' }) is_imported_approval!: boolean;
  @ApiProperty({ example: 'politica-de-seguridad.pdf', description: 'Nombre del archivo, ya limpio. La llave del objeto en el almacenamiento nunca sale.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo canónico detectado por el contenido (PDF, DOCX, PNG o JPG).' }) file_type!: string;
}

export class AssignmentCountsResponse {
  @ApiProperty({ example: 12, description: 'Personas con el documento asignado (asignaciones no quitadas).' }) total!: number;
  @ApiProperty({ example: 8, description: 'Las que aceptaron la versión vigente.' }) accepted!: number;
  @ApiProperty({ example: 3, description: 'Las que no han aceptado y siguen dentro del plazo.' }) pending!: number;
  @ApiProperty({ example: 1, description: 'Las que no han aceptado y ya pasó su plazo.' }) overdue!: number;
}

export class DocumentItemResponse {
  @ApiProperty({ format: 'uuid', description: 'El documento de la empresa.' }) id!: string;
  @ApiProperty({ example: 'POL-001', description: 'Código del catálogo; se muestra siempre.' }) code!: string;
  @ApiProperty({ example: 'Política de seguridad de la información', description: 'Nombre del documento.' }) name!: string;
  @ApiProperty({ enum: DOCUMENT_TYPES, enumName: 'DocumentType', description: 'Tipo del documento.' }) type!: string;
  @ApiProperty({ enum: DOCUMENT_ORIGINS, enumName: 'DocumentOrigin', description: '`internal` lo hace la empresa; `external` lo emite un tercero.' }) origin!: string;
  @ApiProperty({ enum: DOCUMENT_ACCEPTANCES, enumName: 'DocumentAcceptance', description: 'Quién debe aceptarlo; `not_required` no pide aceptación.' }) acceptance!: string;
  @ApiProperty({ type: DocumentVersionSummaryResponse, nullable: true, description: 'La versión vigente; `null` mientras no se publique ninguna.' }) current_version!: DocumentVersionSummaryResponse | null;
  @ApiProperty({ type: AssignmentCountsResponse, description: 'Cuántas personas lo tienen asignado y cómo van. Los porcentajes no viajan.' }) assignments!: AssignmentCountsResponse;
}

export class ImportedApproverResponse {
  @ApiProperty({ example: 'María Pérez', description: 'Nombre de quien aprobó, tal como lo escribió el administrador (puede no tener cuenta).' }) name!: string;
  @ApiProperty({ example: 'Gerente general', description: 'Cargo o rol con el que aprobó.' }) role_label!: string;
}

export class ImportedApprovalResponse {
  @ApiProperty({ type: ImportedApproverResponse, isArray: true, description: 'De 1 a 3 aprobadores.' }) approvers!: ImportedApproverResponse[];
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo se aprobó (fecha, sin hora).' }) approved_at!: string;
  @ApiProperty({ nullable: true, example: 'Acta 14 del comité', description: 'Referencia del acta; `null` si no se dio.' }) note!: string | null;
}

export class DocumentVersionResponse {
  @ApiProperty({ format: 'uuid', description: 'La versión.' }) id!: string;
  @ApiProperty({ example: 2, description: 'Número de la versión.' }) number!: number;
  @ApiProperty({ enum: DOCUMENT_VERSION_STATUSES, enumName: 'DocumentVersionStatus', description: 'En esta versión de Monkey solo `current` y `archived`.' }) status!: string;
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo se aprobó el documento (fecha, sin hora).' }) approved_at!: string;
  @ApiProperty({ example: true, description: 'Siempre `true` en esta versión de Monkey.' }) is_imported_approval!: boolean;
  @ApiProperty({ type: ImportedApprovalResponse, nullable: true, description: 'Quién lo aprobó fuera de Monkey; `null` si la aprobación se hizo dentro (aún no existe).' }) imported_approval!: ImportedApprovalResponse | null;
  @ApiProperty({ example: 'politica-de-seguridad.pdf', description: 'Nombre del archivo, ya limpio.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo canónico detectado por el contenido.' }) file_type!: string;
  @ApiProperty({ example: 482133, description: 'Tamaño en bytes (máx. 25 MB).' }) file_size!: number;
  @ApiProperty({ example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', description: 'Huella SHA-256 del archivo, para demostrar que no cambió.' }) integrity_hash!: string;
  @ApiProperty({ type: PersonResponse, description: 'Quién publicó la versión.' }) created_by!: PersonResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se publicó.' }) created_at!: string;
}

export class DocumentAssigneeUserResponse extends PersonResponse {
  @ApiProperty({ example: 'colaborador', description: 'Rol de la persona.' }) role!: string;
}

export class DocumentAssigneeResponse {
  @ApiProperty({ type: DocumentAssigneeUserResponse, description: 'La persona asignada.' }) user!: DocumentAssigneeUserResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se le asignó.' }) assigned_at!: string;
  @ApiProperty({ format: 'date-time', description: 'Su plazo para aceptar: la asignación más PR-14, fijado al asignar.' }) due_at!: string;
  @ApiProperty({ enum: MY_DOCUMENT_STATUSES, enumName: 'MyDocumentStatus', nullable: true, description: 'Se deriva, nunca se guarda: `accepted` si aceptó la versión vigente; si no, `overdue` si ya pasó su plazo; si no, `pending`. `null` si el documento no pide aceptación.' }) status!: string | null;
  @ApiProperty({ nullable: true, example: 1, description: 'El número de la última versión que aceptó (puede no ser la vigente); `null` si nunca aceptó.' }) accepted_version_number!: number | null;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo aceptó esa versión; `null` si nunca aceptó.' }) accepted_at!: string | null;
}

export class DocumentDetailResponse extends DocumentItemResponse {
  @ApiProperty({ nullable: true, description: 'Qué es el documento, según el catálogo.' }) description!: string | null;
  @ApiProperty({ nullable: true, description: 'El contenido mínimo que el catálogo exige al documento.' }) minimum_content!: string | null;
  @ApiProperty({ type: DocumentVersionResponse, isArray: true, description: 'Todas las versiones, de la más reciente a la más antigua. Ninguna se borra.' }) versions!: DocumentVersionResponse[];
  @ApiProperty({ type: DocumentAssigneeResponse, isArray: true, description: 'A quién está asignado (asignaciones no quitadas).' }) assignees!: DocumentAssigneeResponse[];
}

export class DocumentAssignedResponse {
  @ApiProperty({ example: 3, description: 'Cuántas asignaciones son nuevas: repetir una persona no cambia nada.' }) added!: number;
}

export class MyDocumentRefResponse {
  @ApiProperty({ format: 'uuid', description: 'El documento.' }) id!: string;
  @ApiProperty({ example: 'POL-001', description: 'Código del catálogo.' }) code!: string;
  @ApiProperty({ example: 'Política de seguridad de la información', description: 'Nombre del documento.' }) name!: string;
  @ApiProperty({ enum: DOCUMENT_TYPES, enumName: 'DocumentType', description: 'Tipo del documento.' }) type!: string;
}

export class MyDocumentVersionResponse {
  @ApiProperty({ format: 'uuid', description: 'La versión vigente.' }) id!: string;
  @ApiProperty({ example: 2, description: 'Número de la versión vigente.' }) number!: number;
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo se aprobó (fecha, sin hora).' }) approved_at!: string;
}

export class MyDocumentResponse {
  @ApiProperty({ type: MyDocumentRefResponse, description: 'El documento asignado.' }) document!: MyDocumentRefResponse;
  @ApiProperty({ type: MyDocumentVersionResponse, description: 'La versión vigente: la que hay que leer y aceptar.' }) version!: MyDocumentVersionResponse;
  @ApiProperty({ example: true, description: '`false` si el documento no pide aceptación (solo se lee).' }) requires_acceptance!: boolean;
  @ApiProperty({ enum: MY_DOCUMENT_STATUSES, enumName: 'MyDocumentStatus', nullable: true, description: 'Se deriva: `accepted` si aceptó la versión vigente; si no, `overdue` si ya pasó `due_at`; si no, `pending`. `null` si el documento no pide aceptación (`requires_acceptance: false`): nunca `pending` ni `overdue`.' }) status!: string | null;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se le asignó.' }) assigned_at!: string;
  @ApiProperty({ format: 'date-time', description: 'Su plazo para aceptar.' }) due_at!: string;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo aceptó la versión vigente; `null` si aún no.' }) accepted_at!: string | null;
}

export class AcceptedVersionResponse {
  @ApiProperty({ format: 'uuid', description: 'La versión aceptada.' }) id!: string;
  @ApiProperty({ example: 2, description: 'Su número.' }) number!: number;
}

export class DocumentAcceptanceResponse {
  @ApiProperty({ format: 'uuid', description: 'El registro de la aceptación; no se edita ni se borra (SEG-88).' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'El documento.' }) document_id!: string;
  @ApiProperty({ type: AcceptedVersionResponse, description: 'La versión que aceptó.' }) version!: AcceptedVersionResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo aceptó.' }) accepted_at!: string;
  @ApiProperty({ example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', description: 'La huella SHA-256 del archivo que aceptó.' }) integrity_hash!: string;
}

export class DocumentFileResponse {
  @ApiProperty({ description: 'Enlace firmado de 5 minutos para ver o descargar el archivo. Nunca es público.' }) url!: string;
  @ApiProperty({ example: 'politica-de-seguridad.pdf', description: 'Nombre con que el navegador guarda el archivo.' }) file_name!: string;
  @ApiProperty({ example: 'application/pdf', description: 'Tipo del archivo, fijado en el enlace.' }) file_type!: string;
  @ApiProperty({ enum: ['attachment', 'inline'], description: '`attachment` descarga; `inline` lo muestra en pantalla.' }) disposition!: string;
  @ApiProperty({ example: 300, description: 'Segundos que dura el enlace.' }) expires_in!: number;
}
