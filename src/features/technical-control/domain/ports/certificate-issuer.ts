// El certificado de una conexión de Microsoft 365 (D154). Monkey lo genera por activo: el cliente solo recibe la parte PÚBLICA (para subirla a su aplicación) y la clave privada
// se guarda cifrada. Un puerto, para que el caso de uso no sepa de criptografía y las pruebas no esperen a generar claves de verdad.
export type IssuedCertificate = {
  // PEM de la clave privada (PKCS#8). SECRETO: se cifra y no se devuelve nunca.
  privateKeyPem: string;
  // La parte pública, en PEM. No es un secreto.
  certificatePem: string;
  // La huella SHA-1 en mayúsculas, como la muestra Entra. No es un secreto.
  thumbprint: string;
  expiresAt: Date;
};

export abstract class CertificateIssuer {
  /** `commonName` es solo una etiqueta legible en el certificado (no identifica nada). */
  abstract issue(commonName: string): IssuedCertificate;
}
