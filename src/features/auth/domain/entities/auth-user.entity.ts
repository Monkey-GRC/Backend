import { UserRole, UserStatus } from '../../../../common/enums/user-role.enum';

// Bloqueo por fuerza bruta: 5 intentos fallidos → 15 min (modelo-datos.md §5.3).
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

// Lo mínimo para verificar una contraseña. Sale de find_login_candidates, antes de conocer
// el tenant, así que no trae datos de perfil.
export class UserCredentials {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly failedLoginAttempts: number,
    public readonly lockedUntil: Date | null,
    // D94 · Segundo factor: si ya lo configuró, su secreto cifrado y el último paso de 30 s aceptado.
    public readonly isMfaEnabled = false,
    public readonly mfaSecretEncrypted: string | null = null,
    public readonly mfaLastUsedStep: number | null = null,
  ) {}

  isLocked(now: Date): boolean {
    return this.lockedUntil !== null && this.lockedUntil > now;
  }

  secondsUntilUnlock(now: Date): number {
    return this.lockedUntil
      ? Math.max(0, Math.ceil((this.lockedUntil.getTime() - now.getTime()) / 1000))
      : 0;
  }

  // Estado tras un intento fallido: al llegar al 5º se bloquea y el contador vuelve a 0,
  // para que al vencer el bloqueo el usuario tenga otros 5 intentos.
  afterFailedAttempt(now: Date): { failedLoginAttempts: number; lockedUntil: Date | null } {
    const attempts = this.failedLoginAttempts + 1;
    if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      return {
        failedLoginAttempts: 0,
        lockedUntil: new Date(now.getTime() + LOCKOUT_MINUTES * 60_000),
      };
    }
    return { failedLoginAttempts: attempts, lockedUntil: null };
  }
}

// El usuario con su empresa, tal como lo devuelve el contrato de auth.
export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly companyName: string,
    public readonly email: string,
    // Opcionales: la cuenta se identifica por el correo (D51).
    public readonly name: string | null,
    public readonly lastName: string | null,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly isMfaEnabled: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  isActive(): boolean {
    return this.status === 'active';
  }
}
