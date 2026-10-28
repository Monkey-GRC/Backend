import { UserRole, UserStatus } from '../../../../common/enums/user-role.enum';
import { RedeemableAccessKey } from './redeemable-access-key.entity';

// El código de activación visto desde la activación (D95). Se comporta como una clave de acceso —un solo uso, vence, se puede revocar—, pero es de una
// persona y no de una empresa.
export class RedeemableActivationCode extends RedeemableAccessKey {
  constructor(
    id: string,
    companyId: string,
    public readonly userId: string,
    status: 'pending' | 'used' | 'expired' | 'revoked',
    expiresAt: Date,
    usedAt: Date | null,
  ) {
    super(id, companyId, status, expiresAt, usedAt);
  }
}

// La cuenta que un código activa: su correo es el único con el que se puede canjear (como el `admin_email` de una clave de acceso, D43).
export type ActivatingAccount = {
  id: string;
  companyId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};