// Lo que comparten las subidas de archivos del cliente (Descripción del Sistema, evidencias): el archivo recibido y cómo se limpia su nombre.
export type UploadedFile = { buffer: Buffer; originalName: string; mimeType: string };

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
