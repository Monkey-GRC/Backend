import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { InlineImage } from './mailer';

// El logo de los correos (`assets/email-logo.png`, en la raíz del proyecto como `i18n/`: el Dockerfile lo copia). Se lee una sola vez y viaja incrustado en cada correo.
export const BRAND_LOGO_CID = 'monkey-logo';

let cached: InlineImage | null | undefined;

/** El logo listo para adjuntar, o `null` si el archivo no está (entonces el correo escribe el nombre en texto: nunca falla el envío por esto). */
export function loadBrandLogo(): InlineImage | null {
  if (cached !== undefined) return cached;
  try {
    cached = { cid: BRAND_LOGO_CID, filename: 'monkey-logo.png', contentType: 'image/png', contentBase64: readFileSync(join(process.cwd(), 'assets', 'email-logo.png')).toString('base64') };
  } catch {
    cached = null;
  }
  return cached;
}
