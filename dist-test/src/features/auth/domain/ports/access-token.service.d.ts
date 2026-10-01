import { UserRole } from '../../../../common/enums/user-role.enum';
export type AccessTokenClaims = {
    sub: string;
    cid: string;
    role: UserRole;
    sid: string;
};
export declare abstract class AccessTokenService {
    abstract sign(claims: AccessTokenClaims): Promise<string>;
    abstract verify(token: string): Promise<AccessTokenClaims | null>;
}
