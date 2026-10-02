// Vigencia de la clave de acceso, en horas (ACCESS_KEY_TTL_HOURS). El contrato asume 7 días;
// es supuesto de P2(b), no decisión cerrada, por eso vive en el .env y no en el código.
export const ACCESS_KEY_TTL_HOURS = Symbol('ACCESS_KEY_TTL_HOURS');
