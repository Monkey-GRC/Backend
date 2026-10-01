import { ConfigService } from '@nestjs/config';
import { TokenHasher } from '../../common/security/token-hasher';
export declare class HmacTokenHasher extends TokenHasher {
    private readonly pepper;
    constructor(config: ConfigService);
    generate(): string;
    hash(token: string): string;
}
