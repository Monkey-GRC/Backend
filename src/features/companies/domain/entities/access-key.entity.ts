export type AccessKeyStatus = 'pending' | 'used' | 'expired' | 'revoked';

// Clave de un solo uso con la que el cliente crea su cuenta admin_empresa (§4.1). En la base solo
// vive su hash; el código en claro existe una única vez, en la respuesta del registro.
export class AccessKey {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly status: AccessKeyStatus,
    public readonly expiresAt: Date,
    public readonly usedAt: Date | null,
  ) {}

  // Nadie pasa la fila a `expired` cuando vence: el estado que se informa se deriva de la fecha.
  statusAt(now: Date): AccessKeyStatus {
    return this.status === 'pending' && this.expiresAt <= now ? 'expired' : this.status;
  }
}
