import { Injectable } from '@nestjs/common';
import { createHash, generateKeyPairSync } from 'node:crypto';
import forge from 'node-forge';
import { CertificateIssuer, IssuedCertificate } from '../../domain/ports/certificate-issuer';

// Dos años: el mismo plazo del ejemplo del motor (`-days 730`). El vencimiento se muestra y la renovación es DT-137.
export const CERTIFICATE_VALID_DAYS = 730;
const RSA_BITS = 2048;
const BACKDATE_MS = 5 * 60_000;
const DAY_MS = 24 * 60 * 60_000;

// La clave RSA la genera el módulo nativo de Node (rápido); forge solo arma el certificado X.509, que Node no sabe construir.
@Injectable()
export class ForgeCertificateIssuer extends CertificateIssuer {
  constructor(private readonly now: () => Date = () => new Date()) {
    super();
  }

  issue(commonName: string): IssuedCertificate {
    const { privateKey: privatePem } = generateKeyPairSync('rsa', { modulusLength: RSA_BITS, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
    const key = forge.pki.privateKeyFromPem(privatePem);
    const publicKey = forge.pki.setRsaPublicKey(key.n, key.e);

    const cert = forge.pki.createCertificate();
    cert.publicKey = publicKey;
    // Una serie aleatoria positiva (el primer bit en 0 evita un entero negativo en ASN.1).
    cert.serialNumber = '00' + forge.util.bytesToHex(forge.random.getBytesSync(15));
    const issuedAt = this.now();
    cert.validity.notBefore = new Date(issuedAt.getTime() - BACKDATE_MS);
    cert.validity.notAfter = new Date(issuedAt.getTime() + CERTIFICATE_VALID_DAYS * DAY_MS);
    const subject = [{ name: 'commonName', value: `Monkey ${commonName}`.slice(0, 64) }];
    cert.setSubject(subject);
    cert.setIssuer(subject);
    cert.setExtensions([
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true },
    ]);
    cert.sign(key, forge.md.sha256.create());

    const der = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(), 'binary');
    return {
      privateKeyPem: privatePem,
      // forge escribe el PEM con CRLF: se normaliza a LF (un solo formato en la base, en el comando y en lo que lee openssl).
      certificatePem: forge.pki.certificateToPem(cert).replace(/\r\n/g, "\n"),
      thumbprint: createHash('sha1').update(der).digest('hex').toUpperCase(),
      expiresAt: cert.validity.notAfter,
    };
  }
}
