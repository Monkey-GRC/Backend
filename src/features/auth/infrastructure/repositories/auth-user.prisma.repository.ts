import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AuthUser, UserCredentials } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';

// `status` ya viene ajustado por la base: una persona de una empresa archivada (D97) sale `inactive` aunque su propia cuenta esté activa.
type LoginCandidateRow = { id: string; company_id: string; password_hash: string; status: UserCredentials['status'] };

const CREDENTIAL_FIELDS = {
  role: true,
  status: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  isMfaEnabled: true,
  mfaSecretEncrypted: true,
  mfaLastUsedStep: true,
  preferredLanguage: true,
} as const;

const toCredentials = (
  id: string,
  companyId: string,
  passwordHash: string,
  u: { role: UserCredentials['role']; status: UserCredentials['status']; failedLoginAttempts: number; lockedUntil: Date | null; isMfaEnabled: boolean; mfaSecretEncrypted: string | null; mfaLastUsedStep: number | null; preferredLanguage: 'es' | 'en' },
): UserCredentials =>
  new UserCredentials(id, companyId, passwordHash, u.role, u.status, u.failedLoginAttempts, u.lockedUntil, u.isMfaEnabled, u.mfaSecretEncrypted, u.mfaLastUsedStep, u.preferredLanguage);

@Injectable()
export class AuthUserPrismaRepository extends AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    // Antes de conocer el tenant RLS devuelve cero filas: la única puerta es la función
    // SECURITY DEFINER angosta de la migración 20 (D29). El email es único global.
    const rows = await this.prisma.$queryRaw<LoginCandidateRow[]>`
      SELECT id, company_id, password_hash, status FROM platform.find_login_candidates(${email})
    `;
    const candidate = rows[0];
    if (!candidate) return null;

    // Con el company_id ya conocido, el resto se lee con RLS normal (y con tipos de Prisma).
    const user = await this.prisma.withScope(
      { companyId: candidate.company_id, userId: candidate.id },
      (tx) =>
        tx.user.findUnique({
          where: { id: candidate.id },
          select: CREDENTIAL_FIELDS,
        }),
    );
    if (!user) return null;

    return toCredentials(candidate.id, candidate.company_id, candidate.password_hash, {
      ...user,
      status: candidate.status !== 'active' ? candidate.status : user.status,
    });
  }

  async findCredentialsById(scope: TenantScope, userId: string): Promise<UserCredentials | null> {
    const user = await this.prisma.withScope(scope, (tx) =>
      tx.user.findUnique({ where: { id: userId }, select: { ...CREDENTIAL_FIELDS, passwordHash: true } }),
    );
    return user ? toCredentials(userId, scope.companyId, user.passwordHash, user) : null;
  }

  async findById(scope: TenantScope, userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.withScope(scope, (tx) =>
      tx.user.findUnique({
        where: { id: userId },
        include: { company: { select: { name: true } }, group: { select: { id: true, name: true, leader: { select: { id: true, name: true, lastName: true } } } } },
      }),
    );
    if (!user) return null;

    return new AuthUser(
      user.id,
      user.companyId,
      user.company.name,
      user.email,
      user.name,
      user.lastName,
      user.role,
      user.status,
      user.isMfaEnabled,
      user.lastLoginAt,
      user.createdAt,
      user.group ? { id: user.group.id, name: user.group.name } : null,
      user.role === 'delegado' && user.group ? user.group.leader : null,
      user.preferredLanguage,
    );
  }

  async registerFailedLogin(
    scope: TenantScope,
    userId: string,
    state: { failedLoginAttempts: number; lockedUntil: Date | null },
  ): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: state.failedLoginAttempts, lockedUntil: state.lockedUntil },
      }),
    );
  }

  async setPreferredLanguage(scope: TenantScope, userId: string, language: 'es' | 'en', audit: AuditIntent<{ from: 'es' | 'en'; to: 'es' | 'en' }>): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      const before = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { preferredLanguage: true } });
      await tx.user.update({ where: { id: userId }, data: { preferredLanguage: language } });
      await insertAuditLog(tx, audit({ from: before.preferredLanguage, to: language }));
    });
  }

  async registerSuccessfulLogin(scope: TenantScope, userId: string, at: Date): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: at },
      }),
    );
  }
}
