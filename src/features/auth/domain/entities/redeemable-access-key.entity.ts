export type RedeemState = 'redeemable' | 'used' | 'expired' | 'revoked';

// La clave de acceso vista desde el canje (modelo-datos.md §4.2, paso 4): el cliente la usa una
// sola vez para crear su cuenta admin_empresa; después entra con correo y contraseña.
export class RedeemableAccessKey {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly status: 'pending' | 'used' | 'expired' | 'revoked',
    public readonly expiresAt: Date,
    public readonly usedAt: Date | null,
  ) {}

  stateAt(now: Date): RedeemState {
    if (this.status === 'revoked') return 'revoked';
    if (this.status === 'used' || this.usedAt) return 'used';
    if (this.status === 'expired' || this.expiresAt <= now) return 'expired';
    return 'redeemable';
  }
}

// La empresa dueña de la clave: su nombre llega bloqueado al onboarding y su admin_email es el
// único correo con el que se puede canjear.
export type RedeemingCompany = {
  id: string;
  name: string;
  adminEmail: string;
  status: 'active' | 'suspended';
};
