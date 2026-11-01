// D101 · Enlace de «olvidé mi contraseña»: de un solo uso y de corta vida.
export class PasswordResetToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly usedAt: Date | null,
  ) {}

  isUsable(now: Date): boolean {
    return this.usedAt === null && this.expiresAt > now;
  }
}
