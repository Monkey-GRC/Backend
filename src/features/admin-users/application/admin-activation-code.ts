import { Inject, Injectable } from '@nestjs/common';
import { generateAccessKeyCode, normalizeAccessKeyCode } from '../../../common/security/access-key-code';
import { TokenHasher } from '../../../common/security/token-hasher';

// Vigencia del código de la invitación, en horas (ACTIVATION_CODE_TTL_HOURS; 168 = 7 días, D95): el mismo mecanismo y la misma variable que las cuentas del equipo.
export const ADMIN_ACTIVATION_CODE_TTL_HOURS = Symbol('ADMIN_ACTIVATION_CODE_TTL_HOURS');

@Injectable()
export class IssueAdminActivationCode {
  constructor(private readonly hasher: TokenHasher, @Inject(ADMIN_ACTIVATION_CODE_TTL_HOURS) private readonly ttlHours: number) {}

  issue(now: Date = new Date()): { code: string; codeHash: string; codeExpiresAt: Date } {
    const code = generateAccessKeyCode();
    return { code, codeHash: this.hasher.hash(normalizeAccessKeyCode(code)), codeExpiresAt: new Date(now.getTime() + this.ttlHours * 3_600_000) };
  }
}
