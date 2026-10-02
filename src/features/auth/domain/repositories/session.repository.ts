import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Session } from '../entities/session.entity';

export type NewSession = {
  userId: string;
  refreshTokenHash: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
};

export abstract class SessionRepository {
  abstract create(scope: TenantScope, data: NewSession): Promise<Session>;

  // Búsqueda previa al tenant: el refresh llega solo con el token.
  abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;

  abstract findById(scope: TenantScope, sessionId: string): Promise<Session | null>;

  // Refresh: rota el token (el anterior deja de servir) y marca actividad.
  abstract rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void>;

  abstract touch(scope: TenantScope, sessionId: string, at: Date): Promise<void>;

  abstract revoke(scope: TenantScope, sessionId: string, at: Date): Promise<void>;
}
