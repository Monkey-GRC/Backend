import { randomUUID } from 'node:crypto';
import { DomainError } from '../../../common/errors/domain-error';
import { sanitizeFileName, UploadedFile } from '../../../common/storage/uploaded-file';

// Se re-exportan para quien ya los importaba de aquí.
export { sanitizeFileName };
export type { UploadedFile };

// Descripción del Sistema como archivo (contrato del Componente 2): máximo 25 MB, PDF o .docx.
export const SYSTEM_DESCRIPTION_MAX_BYTES = 25 * 1024 * 1024;
// Multer (busboy) corta el archivo en cuanto LLEGA al límite, no cuando lo pasa: con `fileSize` igual al máximo, un archivo de exactamente 25 MB se rechazaba
// con 413 aunque el caso de uso lo acepta. Con un byte más, el de 25 MB entra y el de 25 MB + 1 byte se corta. La regla real vive en `assertSystemDescriptionFile`.
export const SYSTEM_DESCRIPTION_UPLOAD_LIMIT_BYTES = SYSTEM_DESCRIPTION_MAX_BYTES + 1;

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// No se confía en el tipo que declara el navegador: se comprueba también la firma del archivo
// (un PDF empieza por «%PDF-»; un .docx es un zip, «PK»). Devuelve el tipo canónico.
export function assertSystemDescriptionFile(file: UploadedFile): string {
  if (file.buffer.length === 0) throw new DomainError('FILE_REQUIRED');
  if (file.buffer.length > SYSTEM_DESCRIPTION_MAX_BYTES) throw new DomainError('FILE_TOO_LARGE');

  const isPdf = file.buffer.subarray(0, 5).toString('latin1') === '%PDF-';
  const isZip = file.buffer[0] === 0x50 && file.buffer[1] === 0x4b;
  const name = file.originalName.toLowerCase();

  if (isPdf && name.endsWith('.pdf')) return PDF;
  if (isZip && name.endsWith('.docx')) return DOCX;
  throw new DomainError('UNSUPPORTED_MEDIA_TYPE');
}

// `<empresa>/services/<servicio>/system-description/<uuid>/<nombre>`: la empresa va primero para
// poder aplicar una política de bucket por tenant; el uuid evita que un reemplazo pise el anterior.
export const systemDescriptionKey = (companyId: string, serviceId: string, fileName: string): string =>
  `${companyId}/services/${serviceId}/system-description/${randomUUID()}/${sanitizeFileName(fileName)}`;
