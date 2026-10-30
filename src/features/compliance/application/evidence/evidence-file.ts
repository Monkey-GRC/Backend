import { randomUUID } from 'node:crypto';
import { DomainError } from '../../../../common/errors/domain-error';
import { sanitizeFileName, UploadedFile } from '../../../../common/storage/uploaded-file';

// Evidencia de un control (contracts/modules/compliance-evidence.md, MD-126, SEG-60): PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB.
export const EVIDENCE_MAX_BYTES = 25 * 1024 * 1024;
// Multer (busboy) corta el archivo en cuanto LLEGA al límite, no cuando lo pasa: con un byte más, el de 25 MB exactos entra y el de 25 MB + 1 byte se corta.
// La regla real vive en `assertEvidenceFile`.
export const EVIDENCE_UPLOAD_LIMIT_BYTES = EVIDENCE_MAX_BYTES + 1;

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PNG = 'image/png';
const JPEG = 'image/jpeg';

/** Los tipos que el navegador puede mostrar sin descargarlos (`disposition=inline`): PDF, PNG y JPG. DOCX y XLSX solo se descargan. */
export const INLINE_TYPES: readonly string[] = [PDF, PNG, JPEG];

const startsWith = (b: Buffer, bytes: number[]): boolean => b.length >= bytes.length && bytes.every((x, i) => b[i] === x);

// Nombres de las entradas de un zip leídos del directorio central, SIN descomprimir nada (un .docx y un .xlsx son zips: «PK» no basta para distinguirlos de
// cualquier otro zip renombrado). Devuelve null si el zip está truncado o mal formado.
export function zipEntryNames(b: Buffer): string[] | null {
  const EOCD = 22;
  const from = Math.max(0, b.length - (0xffff + EOCD));
  let eocd = -1;
  for (let i = b.length - EOCD; i >= from; i--) {
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x05 && b[i + 3] === 0x06) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const total = b.readUInt16LE(eocd + 10);
  const size = b.readUInt32LE(eocd + 12);
  let offset = b.readUInt32LE(eocd + 16);
  if (offset + size > b.length) return null;
  const names: string[] = [];
  for (let n = 0; n < total && n < 10_000; n++) {
    if (offset + 46 > b.length || b.readUInt32LE(offset) !== 0x02014b50) return null;
    const nameLength = b.readUInt16LE(offset + 28);
    const extraLength = b.readUInt16LE(offset + 30);
    const commentLength = b.readUInt16LE(offset + 32);
    if (offset + 46 + nameLength > b.length) return null;
    names.push(b.toString('utf8', offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return names;
}

// Un documento de Office abierto (OOXML) lleva `[Content_Types].xml` y una carpeta propia: `word/` el .docx, `xl/` el .xlsx.
const isOffice = (b: Buffer, folder: 'word/' | 'xl/'): boolean => {
  const names = zipEntryNames(b);
  return !!names && names.includes('[Content_Types].xml') && names.some((n) => n.startsWith(folder));
};

type Kind = { extensions: string[]; contentType: string; matches: (b: Buffer) => boolean };
const KINDS: Kind[] = [
  { extensions: ['.pdf'], contentType: PDF, matches: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  { extensions: ['.docx'], contentType: DOCX, matches: (b) => isOffice(b, 'word/') },
  { extensions: ['.xlsx'], contentType: XLSX, matches: (b) => isOffice(b, 'xl/') },
  { extensions: ['.png'], contentType: PNG, matches: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { extensions: ['.jpg', '.jpeg'], contentType: JPEG, matches: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
];

// No se confía en el tipo que declara el navegador ni solo en la extensión: el CONTENIDO tiene que coincidir con el tipo que dice el nombre (SEG-60).
// Devuelve el tipo canónico.
export function assertEvidenceFile(file: UploadedFile): string {
  if (file.buffer.length === 0) throw new DomainError('FILE_REQUIRED');
  if (file.buffer.length > EVIDENCE_MAX_BYTES) throw new DomainError('FILE_TOO_LARGE');
  const name = file.originalName.toLowerCase();
  const kind = KINDS.find((k) => k.extensions.some((e) => name.endsWith(e)) && k.matches(file.buffer));
  if (!kind) throw new DomainError('UNSUPPORTED_MEDIA_TYPE');
  return kind.contentType;
}

// `<empresa>/services/<servicio>/evidence/<requerimiento>/<uuid>/<nombre>`: la empresa va primero para poder aplicar una política de bucket por tenant; el uuid
// evita que dos subidas con el mismo nombre se pisen (una versión nueva nunca pisa la anterior).
export const evidenceKey = (companyId: string, serviceId: string, requirementId: string, fileName: string): string =>
  `${companyId}/services/${serviceId}/evidence/${requirementId}/${randomUUID()}/${sanitizeFileName(fileName)}`;

/** El nombre del archivo es el último tramo de la llave (ya viene limpio). */
export const fileNameOfKey = (key: string): string => key.split('/').pop() ?? 'evidencia';
