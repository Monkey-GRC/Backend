// Datos de la petición que exige el audit trail y la tabla sessions (§5.2).
export type RequestMeta = {
  ipAddress: string;
  userAgent: string;
  // D111 · El idioma de quien hace la petición (su `Accept-Language`), cuando importa: de él depende el idioma de los correos que salen sin cuenta destino.
  language?: 'es' | 'en';
};
