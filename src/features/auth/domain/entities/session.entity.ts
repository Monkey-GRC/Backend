// Tiempos de la política de sesión (modelo-datos.md §5.3), en segundos. Vienen del .env.
export type SessionPolicy = {
  accessTokenTtl: number; // 15 min
  idleTimeout: number; // 30 min sin actividad
  maxDuration: number; // 8 h desde el login, aunque haya actividad
};

export type SessionState = 'active' | 'revoked' | 'idle' | 'expired';

export class Session {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly lastActivityAt: Date,
    // created_at + maxDuration: el tope absoluto de 8 h.
    public readonly expiresAt: Date,
    public readonly revokedAt: Date | null,
  ) {}

  stateAt(now: Date, policy: SessionPolicy): SessionState {
    if (this.revokedAt) return 'revoked';
    if (now >= this.expiresAt) return 'expired';
    if (now.getTime() - this.lastActivityAt.getTime() > policy.idleTimeout * 1000) return 'idle';
    return 'active';
  }

  static expiresAtFor(createdAt: Date, policy: SessionPolicy): Date {
    return new Date(createdAt.getTime() + policy.maxDuration * 1000);
  }
}
