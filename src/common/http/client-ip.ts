import type { Request } from 'express';

const MAPPED_V4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;

// MD-485 (DT-37 / I9) · Normaliza una IP: quita el prefijo IPv4-mapeado (`::ffff:1.2.3.4`) y pasa `::1` a `127.0.0.1`.
export function normalizeIp(ip: string | null | undefined): string {
  if (!ip) return '';
  const value = ip.trim();
  const mapped = MAPPED_V4.exec(value);
  if (mapped) return mapped[1];
  return value === '::1' ? '127.0.0.1' : value;
}

// La IP del cliente la resuelve Express con `trust proxy` (TRUST_PROXY): `req.ip` ya salta los saltos de confianza del
// X-Forwarded-For. No se lee CF-Connecting-IP directo: sin condición de confianza cualquiera podría falsificarla.
export const clientIp = (req: Pick<Request, 'ip'>): string => normalizeIp(req.ip);
