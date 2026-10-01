import { JwtService } from '@nestjs/jwt';
import { AccessTokenClaims, AccessTokenService } from '../../domain/ports/access-token.service';
export declare class JwtAccessTokenService extends AccessTokenService {
    private readonly jwt;
    constructor(jwt: JwtService);
    sign(claims: AccessTokenClaims): Promise<string>;
    verify(token: string): Promise<AccessTokenClaims | null>;
}
