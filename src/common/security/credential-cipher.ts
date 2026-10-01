// Cifra y descifra las credenciales de los sistemas que el cliente conecta (Componente 3). Se
// guardan en `asset_provisionings.encrypted_credentials` y NUNCA se devuelven por la API ni se
// escriben en logs o en el audit trail. Lo implementa la infraestructura.
export abstract class CredentialCipher {
  abstract encrypt(credentials: Record<string, unknown>): string;
  abstract decrypt(payload: string): Record<string, unknown>;
}
