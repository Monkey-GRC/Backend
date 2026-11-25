import { randomUUID } from 'node:crypto';
import { DOCX, JPEG, PDF, PNG } from '../../../common/storage/file-content';
import { sanitizeFileName } from '../../../common/storage/uploaded-file';

// contracts/documentos.md: PDF, DOCX, PNG o JPG, hasta 25 MB (SEG-60). No admite XLSX (sí lo admite la evidencia): un documento que se acepta es de lectura.
export const DOCUMENT_FILE_TYPES: readonly string[] = [PDF, DOCX, PNG, JPEG];

// `<empresa>/documents/<documento>/<versión>/<nombre>`: la empresa va primero para poder aplicar una política de bucket por tenant; el id de la versión evita que dos subidas con el mismo nombre se pisen.
export const documentKey = (companyId: string, documentId: string, versionId: string, fileName: string): string =>
  `${companyId}/documents/${documentId}/${versionId}/${sanitizeFileName(fileName)}`;

export const newVersionId = (): string => randomUUID();

/** El nombre con que se muestra el archivo: el último tramo de la llave (ya viene limpio). */
export const fileNameOfDocumentKey = (key: string): string => key.split('/').pop() ?? 'documento';
