import { randomUUID } from 'node:crypto';
import { DomainError } from '../../../common/errors/domain-error';

// Descripción del Sistema como archivo (contrato del Componente 2): máximo 25 MB, PDF o .docx.
export const SYSTEM_DESCRIPTION_MAX_BYTES = 25 * 1024 * 1024;

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export type UploadedFile = { buffer: Buffer; originalName: string; mimeType: string };

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

// Solo letras, números, punto, guion y guion bajo: el nombre queda legible y no puede salirse de la
// ruta (sin «/», «..» ni caracteres de control). Acentos fuera: el objeto no es para mostrar.
export function sanitizeFileName(original: string): string {
  // Los navegadores a veces mandan el nombre como latin1 aunque sea UTF-8: se normaliza antes de limpiar.
  const decoded = Buffer.from(original, 'latin1').toString('utf8');
  const base = (decoded.includes('�') ? original : decoded).split(/[\\/]/).pop() ?? 'documento';
  const clean = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^\.+/, '')
    .slice(-120);
  return clean || 'documento';
}

// `<empresa>/services/<servicio>/system-description/<uuid>/<nombre>`: la empresa va primero para
// poder aplicar una política de bucket por tenant; el uuid evita que un reemplazo pise el anterior.
export const systemDescriptionKey = (companyId: string, serviceId: string, fileName: string): string =>
  `${companyId}/services/${serviceId}/system-description/${randomUUID()}/${sanitizeFileName(fileName)}`;
