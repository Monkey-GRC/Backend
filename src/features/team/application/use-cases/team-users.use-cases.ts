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
import { Invitation, IssuedActivationCode, TeamMember } from '../../domain/team.types';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../dtos/team.dto';
import { ACTIVATION_CODE_TTL_HOURS } from '../activation-policy.token';
import { planCreation } from './team-member-placement';

// contracts/gestion-usuarios.md · Crear y listar los abren `admin_empresa` y `responsable` (@Roles en la ruta y la regla de cada rol aquí); editar y reemitir, solo `admin_empresa`.
// El código de activación nunca viaja en el alta (SEG-75): solo su huella queda en la base, y ni el código ni la huella van a la auditoría (conventions.md).
// El reenvío (`ReissueActivationCodeUseCase`) sigue devolviéndolo hasta MD-190.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const entry = (p: Principal, meta: RequestMeta, action: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'user', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});
const snapshot = (m: TeamMember) => ({
  id: m.id, email: m.email, name: m.name, last_name: m.lastName, role: m.role, status: m.status, group_id: m.group?.id ?? null, is_internal: m.isInternal,
});

export type MemberWithCode = { member: TeamMember; activationCode: IssuedActivationCode };
export type InvitedMember = { member: TeamMember; invitation: Invitation };

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

  async execute(p: Principal, dto: CreateTeamMemberDto, meta: RequestMeta): Promise<InvitedMember> {
    const plan = planCreation(p, { role: dto.role, groupId: dto.group_id ?? null, isInternal: dto.is_internal ?? null });
    const issued = this.codes.issue();
    const member = await this.repo.create(
      scopeOf(p),
      {
        email: dto.email, name: dto.name, lastName: dto.last_name, role: dto.role, isInternal: plan.isInternal, placement: plan.placement,
        passwordHash: await unusablePasswordHash(), codeHash: issued.codeHash, codeExpiresAt: issued.codeExpiresAt, createdBy: p.userId,
      },
      (done) => entry(p, meta, 'user.create', null, snapshot(done)),
    );
    // El correo con el código sale en MD-190; mientras tanto la invitación queda pendiente y el código no se devuelve.
    return { member, invitation: { deliveryStatus: 'pending', expiresAt: issued.codeExpiresAt } };
  }
}

@Injectable()
export class ListTeamUseCase {
  constructor(private readonly repo: TeamUserRepository) {}

  // El administrador ve todo el equipo; el responsable, solo el suyo: el servidor impone ese filtro y ningún `group_id` lo amplía.
  execute(p: Principal, filters: MemberFilters): Promise<Page<TeamMember>> {
    if (p.role === 'admin_empresa') return this.repo.list(scopeOf(p), filters);
    if (p.role === 'responsable') return this.repo.list(scopeOf(p), { ...filters, teamLeaderId: p.userId });
    throw new DomainError('FORBIDDEN');
  }
}

@Injectable()
export class UpdateTeamMemberUseCase {
  constructor(private readonly repo: TeamUserRepository) {}

  async execute(p: Principal, id: string, dto: UpdateTeamMemberDto, meta: RequestMeta): Promise<TeamMember> {
    if (dto.status === undefined && dto.name === undefined && dto.last_name === undefined) throw new ValidationException([{ field: 'status', code: 'required' }]);
    const done = await this.repo.update(scopeOf(p), id, { status: dto.status, name: dto.name, lastName: dto.last_name }, new Date(), ({ before, after, sessionsClosed }) => ({
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
