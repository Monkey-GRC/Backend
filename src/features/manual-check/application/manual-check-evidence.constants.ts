/** Whitelist deliberada: evidencia real en GRC es heterogénea (capturas, configs exportadas, políticas firmadas, logs). */
export const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv',
    'text/plain',
    'application/json',
    'application/zip',
    'application/x-zip-compressed',
]);

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
