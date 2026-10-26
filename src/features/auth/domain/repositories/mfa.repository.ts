import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { MfaChallenge, MfaChallengePurpose } from '../entities/mfa-challenge.entity';

export type NewMfaChallenge = {
  userId: string;
  tokenHash: string;
  purpose: MfaChallengePurpose;
  ipAddress: string;
  expiresAt: Date;
};

// Todo el segundo factor que toca la base: los desafíos, los códigos de recuperación y el estado del usuario. Cada operación que cambia más de una cosa
// lo hace en una sola transacción, con su rastro dentro (SEG-36).
export abstract class MfaRepository {
  abstract createChallenge(scope: TenantScope, data: NewMfaChallenge): Promise<void>;

  // Búsqueda previa al tenant: el desafío llega solo con su token (SECURITY DEFINER, como la de la sesión).
  abstract findChallengeByTokenHash(hash: string): Promise<{ scope: TenantScope; challenge: MfaChallenge } | null>;

  abstract setPendingSecret(scope: TenantScope, challengeId: string, encrypted: string): Promise<void>;

  // Suma un intento fallido y devuelve cuántos lleva.
  abstract registerChallengeFailure(scope: TenantScope, challengeId: string): Promise<number>;

  abstract consumeChallenge(scope: TenantScope, challengeId: string, at: Date): Promise<void>;

  // Acepta un paso solo si es posterior al último usado; de dos peticiones simultáneas con el mismo código, gana una. `false` si ya estaba usado.
  abstract recordTotpUse(scope: TenantScope, userId: string, step: number): Promise<boolean>;

  // Gasta un código de recuperación si existe y no se había usado. `false` si no sirve. Devuelve también cuántos quedan.
  abstract useRecoveryCode(scope: TenantScope, userId: string, codeHash: string, at: Date): Promise<{ used: boolean; remaining: number }>;

  abstract countRecoveryCodes(scope: TenantScope, userId: string): Promise<number>;

  // Activa el segundo factor: guarda el secreto cifrado, el paso con el que se confirmó y los códigos de recuperación, y consume el desafío, todo junto.
  abstract activate(
    scope: TenantScope,
    userId: string,
    data: { challengeId: string; secretEncrypted: string; step: number; recoveryCodeHashes: string[]; at: Date },
    audit: AuditIntent<{ userId: string }>,
  ): Promise<void>;

  // Cambia los códigos de recuperación por unos nuevos (los anteriores dejan de servir).
  abstract replaceRecoveryCodes(scope: TenantScope, userId: string, hashes: string[], audit: AuditIntent<{ userId: string }>): Promise<void>;

  // Quita el segundo factor (la persona perdió el celular y los códigos): borra el secreto y los códigos y cierra todas sus sesiones. Devuelve cuántas cerró.
  // `null` si el usuario no existe en ese ámbito.
  abstract reset(scope: TenantScope, userId: string, at: Date, audit: AuditIntent<{ userId: string; sessionsClosed: number }>): Promise<number | null>;
}