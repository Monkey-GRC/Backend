// D94 · Un desafío del segundo factor: lo que hay entre la contraseña correcta y la sesión. Dura 5 minutos, se usa una vez y se rinde a los 5 intentos fallidos.
export const MFA_CHALLENGE_MINUTES = 5;
export const MFA_CHALLENGE_MAX_FAILURES = 5;

export type MfaChallengePurpose = 'verify' | 'setup';

export class MfaChallenge {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly purpose: MfaChallengePurpose,
    // Solo en un desafío de configuración, y solo después de pedir el QR: el secreto nuevo espera cifrado hasta que la persona lo confirma con un código.
    public readonly pendingSecretEncrypted: string | null,
    public readonly failedAttempts: number,
    public readonly expiresAt: Date,
    public readonly consumedAt: Date | null,
  ) {}

  isUsable(now: Date): boolean {
    return this.consumedAt === null && this.expiresAt > now && this.failedAttempts < MFA_CHALLENGE_MAX_FAILURES;
  }
}