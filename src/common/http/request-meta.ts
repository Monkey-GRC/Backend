// Datos de la petición que exige el audit trail y la tabla sessions (§5.2).
export type RequestMeta = {
  ipAddress: string;
  userAgent: string;
};
