import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_ROLES } from '../../../../common/enums/user-role.enum';
import { AccessTokenClaims, AccessTokenService } from '../../domain/ports/access-token.service';

@Injectable()
export class JwtAccessTokenService extends AccessTokenService {
  // Secreto y expiración (JWT_SECRET, JWT_ACCESS_EXPIRES_IN) se configuran en auth.module.ts.
  constructor(private readonly jwt: JwtService) {
    super();
  }

  sign(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync({ ...claims });
  }

  async verify(token: string): Promise<AccessTokenClaims | null> {
    try {
      const payload = await this.jwt.verifyAsync<Partial<AccessTokenClaims>>(token, {
        algorithms: ['HS256'],
      });
      const { sub, cid, role, sid } = payload;
      if (!sub || !cid || !sid || !role || !USER_ROLES.includes(role)) return null;
      return { sub, cid, role, sid };
    } catch {
      return null;
    }
  }
}
