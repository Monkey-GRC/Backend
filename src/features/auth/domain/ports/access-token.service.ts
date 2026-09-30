import { UserRole } from '../../../../common/enums/user-role.enum';

export type AccessTokenClaims = {
  sub: string; // user id
  cid: string; // company id
  role: UserRole;
  sid: string; // session id: permite revocar y medir inactividad en cada request
};

export abstract class AccessTokenService {
  abstract sign(claims: AccessTokenClaims): Promise<string>;
  // null si la firma no es válida o expiró.
  abstract verify(token: string): Promise<AccessTokenClaims | null>;
}
