// La plantilla de marca de todos los correos de Monkey: el encabezado azul con el logo, el título, el cuerpo, un bloque destacado opcional (p. ej. una clave), un botón
// opcional, una lista y una nota al pie. Los clientes de correo no cargan hojas de estilo ni SVG: todo va en línea, con tablas, y el logo es un PNG que viaja incrustado en el
// propio correo (`cid:`), así se ve siempre. Quien la usa pone el texto; aquí no hay nada de ningún correo en particular.

export const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND = { primary: '#046cc4', navy: '#01264a', text: '#1d2939', muted: '#667085', soft: '#f2f4f7', line: '#e4e7ec' };

export type BrandEmailInput = {
  // El título del documento HTML y el texto que algunos clientes muestran como vista previa.
  title: string;
  preheader: string;
  heading: string;
  // HTML ya seguro: quien lo arma escapa lo que venga de afuera con `escapeHtml`.
  introHtml: string;
  // Un recuadro destacado entre el texto y el botón (la clave de acceso, por ejemplo).
  highlightHtml?: string | null;
  button?: { label: string; url: string } | null;
  // Líneas con viñeta, ya seguras.
  bulletsHtml?: string[];
  footnote: string;
  // El `cid` de la imagen incrustada del logo (`BRAND_LOGO_CID`). Sin él, se escribe el nombre en texto.
  logoCid: string | null;
};

export function renderBrandEmail(input: BrandEmailInput): string {
  const logo = input.logoCid
    ? `<img src="cid:${escapeHtml(input.logoCid)}" width="150" alt="Monkey" style="display:block;margin:0 auto;border:0;height:auto;">`
    : `<span style="font-size:26px;font-weight:700;letter-spacing:3px;color:#ffffff;">MONKEY</span>`;
  const highlight = input.highlightHtml ? `<tr><td style="padding:20px 36px;">${input.highlightHtml}</td></tr>` : '';
  const button = input.button
    ? `<tr><td style="padding:8px 36px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;"><a href="${escapeHtml(input.button.url)}" style="display:inline-block;background:${BRAND.primary};color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:13px 32px;border-radius:10px;">${escapeHtml(input.button.label)}</a></td></tr></table></td></tr>`
    : '';
  const bullets = input.bulletsHtml?.length
    ? `<tr><td style="padding:20px 36px 8px;font-size:14px;line-height:1.6;color:${BRAND.text};">${input.bulletsHtml.map((line, i, all) => `<p style="margin:0${i < all.length - 1 ? ' 0 8px' : ''};">&bull; ${line}</p>`).join('')}</td></tr>`
    : '';
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(input.title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.soft};font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.soft};"><tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.line};">
    <tr><td align="center" style="background:${BRAND.navy};padding:30px 24px;">${logo}</td></tr>
    <tr><td style="padding:36px 36px 8px;">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${BRAND.navy};">${escapeHtml(input.heading)}</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.text};">${input.introHtml}</p>
    </td></tr>
    ${highlight}
    ${button}
    ${bullets}
    <tr><td style="padding:20px 36px 32px;">
      <p style="margin:0;padding-top:16px;border-top:1px solid ${BRAND.line};font-size:12.5px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(input.footnote)}</p>
    </td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">Monkey &middot; Ciberseguridad y cumplimiento</p>
</td></tr></table>
</body></html>`;
}
