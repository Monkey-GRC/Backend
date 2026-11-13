// Plataformas `coming_soon` que se pueden declarar por la API mientras no existen sus pantallas (DT-104). Solo desarrollo.
export const PREVIEW_PLATFORMS = Symbol('PREVIEW_PLATFORMS');

// `PREVIEW_PLATFORMS=gcp,azure`. En producción el servidor se niega a arrancar si está definida: un cliente real nunca debe poder conectar algo que el catálogo
// muestra como «Próximamente» (igual que `PROBE_MODE=simulated`).
export function readPreviewPlatforms(raw: string | undefined, nodeEnv: string | undefined): string[] {
  const platforms = (raw ?? '')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (platforms.length === 0) return [];
  if (nodeEnv === 'production') throw new Error('PREVIEW_PLATFORMS no está permitido en producción.');
  if (!platforms.every((p) => /^[a-z][a-z0-9_]{0,49}$/.test(p))) throw new Error('PREVIEW_PLATFORMS debe ser una lista de códigos de plataforma separados por comas.');
  return platforms;
}
