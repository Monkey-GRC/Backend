export declare abstract class CredentialCipher {
    abstract encrypt(credentials: Record<string, unknown>): string;
    abstract decrypt(payload: string): Record<string, unknown>;
}
