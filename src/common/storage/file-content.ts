import { DomainError } from '../errors/domain-error';
import type { UploadedFile } from './uploaded-file';

// Lo que comparten las subidas de archivos del cliente (evidencia, documentos): qué tipos se aceptan y cómo se comprueba el contenido (SEG-60).
export const FILE_MAX_BYTES = 25 * 1024 * 1024;
// Multer (busboy) corta el archivo en cuanto LLEGA al límite, no cuando lo pasa: con un byte más, el de 25 MB exactos entra y el de 25 MB + 1 byte se corta.
// La regla real vive en `assertFileContent`.
export const FILE_UPLOAD_LIMIT_BYTES = FILE_MAX_BYTES + 1;

export const PDF = 'application/pdf';
export const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const PNG = 'image/png';
export const JPEG = 'image/jpeg';

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
// `accepted` limita los tipos canónicos que la subida admite (por omisión, todos: PDF, DOCX, XLSX, PNG y JPG). Devuelve el tipo canónico.
export function assertFileContent(file: UploadedFile, accepted?: readonly string[]): string {
  if (file.buffer.length === 0) throw new DomainError('FILE_REQUIRED');
  if (file.buffer.length > FILE_MAX_BYTES) throw new DomainError('FILE_TOO_LARGE');
  const name = file.originalName.toLowerCase();
  const kind = KINDS.find((k) => (!accepted || accepted.includes(k.contentType)) && k.extensions.some((e) => name.endsWith(e)) && k.matches(file.buffer));
  if (!kind) throw new DomainError('UNSUPPORTED_MEDIA_TYPE');
  return kind.contentType;
}
