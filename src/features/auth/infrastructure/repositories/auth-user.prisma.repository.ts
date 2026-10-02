import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AuthUser, UserCredentials } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';

type LoginCandidateRow = { id: string; company_id: string; password_hash: string };

@Injectable()
export class AuthUserPrismaRepository extends AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    // Antes de conocer el tenant RLS devuelve cero filas: la única puerta es la función
    // SECURITY DEFINER angosta de la migración 20 (D29). El email es único global.
    const rows = await this.prisma.$queryRaw<LoginCandidateRow[]>`
      SELECT id, company_id, password_hash FROM platform.find_login_candidates(${email})
    `;
    const candidate = rows[0];
    if (!candidate) return null;

    // Con el company_id ya conocido, el resto se lee con RLS normal (y con tipos de Prisma).
    const user = await this.prisma.withScope(
      { companyId: candidate.company_id, userId: candidate.id },
      (tx) =>
        tx.user.findUnique({
          where: { id: candidate.id },
          select: { role: true, status: true, failedLoginAttempts: true, lockedUntil: true },
        }),
    );
    if (!user) return null;

    return new UserCredentials(
      candidate.id,
      candidate.company_id,
      candidate.password_hash,
      user.role,
      user.status,
      user.failedLoginAttempts,
      user.lockedUntil,
    );
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
