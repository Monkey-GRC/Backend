// Cómo se cuenta un error en el registro del trabajador: SOLO su clase y, si existe, el código de red o de sistema (ECONNREFUSED, ENOTFOUND…).
// Nunca el mensaje: el de un error ajeno puede llevar credenciales o URLs con secretos.
//
// `fetch` de Node lanza `TypeError: fetch failed` para cualquier fallo de red, con la causa real en `error.cause`: sin mirarla, el registro solo
// diría «TypeError» y no habría forma de distinguir un backend que aún arranca de un nombre que no resuelve.
const SAFE_CODE = /^[A-Z][A-Z0-9_]{2,40}$/;

export function describeError(e: unknown): string {
  const name = (e as { constructor?: { name?: string } })?.constructor?.name || 'Error';
  const cause = (e as { cause?: unknown })?.cause as { code?: unknown } | undefined;
  const code = typeof cause?.code === 'string' ? cause.code : typeof (e as { code?: unknown })?.code === 'string' ? ((e as { code: string }).code) : null;
  const safe = code && SAFE_CODE.test(code) ? code : null;
  if (name === 'TypeError' && safe) return `no se pudo conectar con el backend (${safe})`;
  return safe ? `${name}, ${safe}` : name;
}
