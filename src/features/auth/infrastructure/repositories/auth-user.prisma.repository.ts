import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
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
} as const;

const toCredentials = (
  id: string,
  companyId: string,
  passwordHash: string,
  u: { role: UserCredentials['role']; status: UserCredentials['status']; failedLoginAttempts: number; lockedUntil: Date | null; isMfaEnabled: boolean; mfaSecretEncrypted: string | null; mfaLastUsedStep: number | null },
): UserCredentials =>
  new UserCredentials(id, companyId, passwordHash, u.role, u.status, u.failedLoginAttempts, u.lockedUntil, u.isMfaEnabled, u.mfaSecretEncrypted, u.mfaLastUsedStep);

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
        include: { company: { select: { name: true } } },
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

  async registerSuccessfulLogin(scope: TenantScope, userId: string, at: Date): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: at },
      }),
    );
  }
}
