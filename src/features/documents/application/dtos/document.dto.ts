import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { DOCUMENT_TYPES, MY_DOCUMENT_STATUSES } from '../../domain/document.types';
import type { DocumentType, MyDocumentStatus } from '../../domain/document.types';
import type { DocumentSort } from '../../domain/repositories/document.repository';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const toBoolean = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

export const DOCUMENT_SORTS = ['code', 'name', '-updated_at'] as const;

// GET /v1/documents
export class ListDocumentsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: DOCUMENT_SORTS, enumName: 'DocumentSort', default: 'code', description: 'Orden; el guion inicial es descendente. `-updated_at`: lo último publicado primero.' })
  @IsOptional() @IsIn([...DOCUMENT_SORTS]) sort: DocumentSort = 'code';
  @ApiPropertyOptional({ enum: DOCUMENT_TYPES, enumName: 'DocumentType', description: 'Solo los documentos de este tipo.' }) @IsOptional() @IsIn([...DOCUMENT_TYPES]) type?: DocumentType;
  @ApiPropertyOptional({ description: 'Solo los que ya tienen (`true`) o aún no tienen (`false`) una versión vigente.' }) @IsOptional() @Transform(toBoolean) @IsBoolean() has_current_version?: boolean;
  @ApiPropertyOptional({ description: 'Busca por código o nombre, sin distinguir mayúsculas ni acentos (máx. 100).' }) @IsOptional() @Transform(trim) @IsString() @MaxLength(100) q?: string;
}

// GET /v1/me/documents
export class ListMyDocumentsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: MY_DOCUMENT_STATUSES, enumName: 'MyDocumentStatus', description: 'Solo los documentos en este estado: `pending` por aceptar dentro del plazo, `accepted`, `overdue` por aceptar y fuera de plazo.' })
  @IsOptional() @IsIn([...MY_DOCUMENT_STATUSES]) status?: MyDocumentStatus;
}

// GET /v1/documents/{id}/versions/{version_id}/file
export class DocumentFileQuery {
  @ApiPropertyOptional({ enum: ['attachment', 'inline'], default: 'attachment', description: '`attachment`: el navegador descarga el archivo. `inline`: la pantalla lo muestra sin descargarlo; solo PDF, PNG y JPG (con DOCX responde `422 disposition.not_inline`).' })
  @IsOptional() @IsIn(['attachment', 'inline']) disposition?: 'attachment' | 'inline';
}

export class ApproverDto {
  @ApiProperty({ example: 'María Pérez', description: 'Nombre de quien aprobó el documento fuera de Monkey (máx. 100). Es texto: puede no tener cuenta.' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'Gerente general', description: 'Cargo o rol con el que aprobó (máx. 100).' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) role_label!: string;
}

// Un multipart no trae objetos: `approvers` llega como texto JSON. Se convierte aquí (a instancias, para que se validen y se limpien sus campos); si no es JSON válido se deja tal cual y la validación lo rechaza (`array.invalid`).
const approversFromJson = ({ value }: { value: unknown }): unknown => {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return Array.isArray(parsed) ? plainToInstance(ApproverDto, parsed) : parsed;
};

// POST /v1/documents/{id}/versions (multipart: `file` + estos campos)
export class ImportDocumentVersionDto {
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo se aprobó el documento (AAAA-MM-DD). No puede ser futura.' }) @IsISO8601({ strict: true }) approved_at!: string;
  @ApiProperty({ type: () => [ApproverDto], description: 'Quién lo aprobó, de 1 a 3 personas. En multipart se manda como **texto JSON**: `[{"name":"…","role_label":"…"}]`.' })
  @Transform(approversFromJson) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(3) @ValidateNested({ each: true }) @Type(() => ApproverDto) approvers!: ApproverDto[];
  @ApiPropertyOptional({ description: 'Referencia del acta o de la aprobación (máx. 500).' }) @IsOptional() @Transform(trim) @IsString() @MaxLength(500) note?: string;
}

// POST /v1/documents/{id}/assignments
export class AssignDocumentDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Las personas a quienes se asigna (1 a 200, sin repetir): cuentas `active` o `pending` de rol `admin_empresa`, `responsable`, `delegado` o `colaborador`. Todo o nada.' })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(200) @ArrayUnique() @IsUUID('all', { each: true }) user_ids!: string[];
}

// POST /v1/documents/{id}/acceptance
export class AcceptDocumentDto {
  @ApiProperty({ format: 'uuid', description: 'La versión que la persona vio, para no aceptar una que cambió mientras leía.' }) @IsUUID('all') version_id!: string;
}
