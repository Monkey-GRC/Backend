import { createPrivateKey, createPublicKey, X509Certificate } from 'node:crypto';
import { CERTIFICATE_VALID_DAYS, ForgeCertificateIssuer } from './forge-certificate.issuer';

const NOW = new Date('2026-11-22T12:00:00.000Z');

describe('ForgeCertificateIssuer (certificado de una conexión de Microsoft 365, D154)', () => {
  const issuer = new ForgeCertificateIssuer(() => NOW);
  const issued = issuer.issue('Acme');

  it('el certificado público es válido, de dos años, y trae la huella SHA-1 en mayúsculas que Entra muestra', () => {
    const x509 = new X509Certificate(issued.certificatePem);
    expect(x509.fingerprint.replace(/:/g, '')).toBe(issued.thumbprint);
    expect(issued.thumbprint).toMatch(/^[0-9A-F]{40}$/);
    expect(new Date(x509.validTo).getTime()).toBe(Math.floor(issued.expiresAt.getTime() / 1000) * 1000);
    expect(issued.expiresAt.getTime() - NOW.getTime()).toBe(CERTIFICATE_VALID_DAYS * 24 * 60 * 60_000);
    // Empieza unos minutos antes (un reloj ligeramente atrasado en Microsoft no lo rechaza por «aún no válido»).
    expect(new Date(x509.validFrom).getTime()).toBeLessThan(NOW.getTime());
    expect(x509.subject).toContain('Monkey Acme');
    expect(x509.ca).toBe(false);
  });

  it('el certificado es de la clave privada que se guarda (firmar con una y verificar con la otra funciona)', () => {
    const x509 = new X509Certificate(issued.certificatePem);
    expect(x509.checkPrivateKey(createPrivateKey(issued.privateKeyPem))).toBe(true);
    expect(createPublicKey(issued.certificatePem).asymmetricKeyType).toBe('rsa');
  });


  it('cada conexión recibe un par distinto (nunca se reutiliza un certificado entre clientes)', () => {
    const other = issuer.issue('Acme');
    expect(other.privateKeyPem).not.toBe(issued.privateKeyPem);
    expect(other.thumbprint).not.toBe(issued.thumbprint);
  });

  it('el nombre de la etiqueta se acota a 64 caracteres (límite del campo del certificado)', () => {
    expect(() => new X509Certificate(issuer.issue('x'.repeat(200)).certificatePem)).not.toThrow();
  });
});
