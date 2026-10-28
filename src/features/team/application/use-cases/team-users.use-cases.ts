import { Inject, Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { generateAccessKeyCode, normalizeAccessKeyCode } from '../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { unusablePasswordHash } from '../../../../common/security/unusable-password-hash';
import { MemberFilters, TeamUserRepository } from '../../domain/repositories/team-user.repository';
import { IssuedActivationCode, TeamMember } from '../../domain/team.types';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../dtos/team.dto';
import { ACTIVATION_CODE_TTL_HOURS } from '../activation-policy.token';

// contracts/modules/users-team.md · Solo `admin_empresa` (lo impone @Roles en la ruta). El código de activación viaja en claro SOLO en la respuesta que lo emite; en la base
// y en la auditoría no queda ni el código ni su huella (conventions.md).
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const entry = (p: Principal, meta: RequestMeta, action: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'user', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});
const snapshot = (m: TeamMember) => ({ id: m.id, email: m.email, role: m.role, status: m.status, dimensions: m.dimensions });

export type MemberWithCode = { member: TeamMember; activationCode: IssuedActivationCode };

@Injectable()
export class IssueActivationCode {
  constructor(private readonly hasher: TokenHasher, @Inject(ACTIVATION_CODE_TTL_HOURS) private readonly ttlHours: number) {}

  issue(now: Date = new Date()): { code: string; codeHash: string; codeExpiresAt: Date } {
    const code = generateAccessKeyCode();
    return { code, codeHash: this.hasher.hash(normalizeAccessKeyCode(code)), codeExpiresAt: new Date(now.getTime() + this.ttlHours * 3_600_000) };
  }
}

@Injectable()
export class CreateTeamMemberUseCase {
  constructor(private readonly repo: TeamUserRepository, private readonly codes: IssueActivationCode) {}

  async execute(p: Principal, dto: CreateTeamMemberDto, meta: RequestMeta): Promise<MemberWithCode> {
    // Un funcional sin especialidad no recibiría nada que hacer; un auditor lo ve todo, así que no lleva especialidades.
    if (dto.role === 'funcional' && !dto.dimensions?.length) throw new ValidationException([{ field: 'dimensions', code: 'array.min' }]);
    if (dto.role === 'auditor' && dto.dimensions) throw new ValidationException([{ field: 'dimensions', code: 'dimensions.not_allowed' }]);

    const issued = this.codes.issue();
    const member = await this.repo.create(
      scopeOf(p),
      { email: dto.email, role: dto.role, dimensions: dto.dimensions ?? [], passwordHash: await unusablePasswordHash(), codeHash: issued.codeHash, codeExpiresAt: issued.codeExpiresAt, createdBy: p.userId },
      (done) => entry(p, meta, 'user.create', null, snapshot(done)),
    );
    return { member, activationCode: { code: issued.code, status: 'pending', expiresAt: issued.codeExpiresAt } };
  }
}

@Injectable()
export class ListTeamUseCase {
  constructor(private readonly repo: TeamUserRepository) {}

  execute(p: Principal, filters: MemberFilters): Promise<Page<TeamMember>> {
    return this.repo.list(scopeOf(p), filters);
  }
}

@Injectable()
export class UpdateTeamMemberUseCase {
  constructor(private readonly repo: TeamUserRepository) {}

  async execute(p: Principal, id: string, dto: UpdateTeamMemberDto, meta: RequestMeta): Promise<TeamMember> {
    if (dto.status === undefined && dto.dimensions === undefined) throw new ValidationException([{ field: 'status', code: 'required' }]);
    const done = await this.repo.update(scopeOf(p), id, { status: dto.status, dimensions: dto.dimensions }, new Date(), ({ before, after, sessionsClosed }) => ({
      ...entry(p, meta, 'user.update', snapshot(before), { ...snapshot(after), ...(sessionsClosed ? { sessions_closed: sessionsClosed } : {}) }),
    }));
    if (!done) throw new DomainError('NOT_FOUND');
    return done;
  }
}

@Injectable()
export class ReissueActivationCodeUseCase {
  constructor(private readonly repo: TeamUserRepository, private readonly codes: IssueActivationCode) {}

  async execute(p: Principal, id: string, meta: RequestMeta): Promise<MemberWithCode> {
    const issued = this.codes.issue();
    const member = await this.repo.reissueCode(scopeOf(p), id, { codeHash: issued.codeHash, codeExpiresAt: issued.codeExpiresAt, createdBy: p.userId }, (done) =>
      entry(p, meta, 'user.activation_code_regenerate', null, { id: done.id, email: done.email }),
    );
    if (!member) throw new DomainError('NOT_FOUND');
    return { member, activationCode: { code: issued.code, status: 'pending', expiresAt: issued.codeExpiresAt } };
  }
}
