import { ConfigService } from '@nestjs/config';
import { CredentialCipher } from '../../common/security/credential-cipher';
export declare class AesCredentialCipher extends CredentialCipher {
    private readonly key;
    constructor(config: ConfigService);
    encrypt(credentials: Record<string, unknown>): string;
    decrypt(payload: string): Record<string, unknown>;
}
