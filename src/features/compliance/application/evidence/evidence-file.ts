import { randomUUID } from 'node:crypto';
import { assertFileContent, FILE_MAX_BYTES, FILE_UPLOAD_LIMIT_BYTES, INLINE_TYPES, zipEntryNames } from '../../../../common/storage/file-content';
import { sanitizeFileName, UploadedFile } from '../../../../common/storage/uploaded-file';

// Evidencia de un control (contracts/modules/compliance-evidence.md, MD-126, SEG-60): PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB. La validación del contenido es común a las subidas
// de archivos del cliente (`common/storage/file-content.ts`); aquí queda lo propio de la evidencia: la llave del objeto.
export const EVIDENCE_MAX_BYTES = FILE_MAX_BYTES;
export const EVIDENCE_UPLOAD_LIMIT_BYTES = FILE_UPLOAD_LIMIT_BYTES;
export { INLINE_TYPES, zipEntryNames };

/** Devuelve el tipo canónico; lanza `FILE_REQUIRED`, `FILE_TOO_LARGE` o `UNSUPPORTED_MEDIA_TYPE`. */
export const assertEvidenceFile = (file: UploadedFile): string => assertFileContent(file);

// `<empresa>/services/<servicio>/evidence/<requerimiento>/<uuid>/<nombre>`: la empresa va primero para poder aplicar una política de bucket por tenant; el uuid
// evita que dos subidas con el mismo nombre se pisen (una versión nueva nunca pisa la anterior).
export const evidenceKey = (companyId: string, serviceId: string, requirementId: string, fileName: string): string =>
  `${companyId}/services/${serviceId}/evidence/${requirementId}/${randomUUID()}/${sanitizeFileName(fileName)}`;

/** El nombre del archivo es el último tramo de la llave (ya viene limpio). */
export const fileNameOfKey = (key: string): string => key.split('/').pop() ?? 'evidencia';
