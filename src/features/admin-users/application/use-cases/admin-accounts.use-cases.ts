import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { unusablePasswordHash } from '../../../../common/security/unusable-password-hash';
import { StepUp } from '../../../auth/application/services/step-up.service';
import { ADMIN_GRACE_DAYS, AdminAccount, AdminFilters, Invitation } from '../../domain/admin-account';
import { AdminAccountRepository } from '../../domain/repositories/admin-account.repository';
import { IssueAdminActivationCode } from '../admin-activation-code';
import { AdminInvitationDelivery } from '../admin-invitation-delivery.service';
import { InviteAdminDto } from '../dtos/admin.dto';
import { adminEntry, scopeOf, snapshot } from './admin-audit';

export type InvitedAdmin = { admin: AdminAccount; invitation: Invitation };

// contracts/gestion-usuarios/administradores.md · Todo es de `admin_monkey` (@Roles en el controller). El código de activación nunca viaja en una respuesta ni va a la auditoría.
@Injectable()
export class ListAdminsUseCase {
  constructor(private readonly repo: AdminAccountRepository) {}

  execute(p: Principal, filters: AdminFilters): Promise<Page<AdminAccount>> {
    return this.repo.list(scopeOf(p), filters);
  }
}

// El segundo factor de quien actúa: si no pasa, el intento rechazado deja su rastro (con el motivo, nunca el código) y el error sube tal cual.
@Injectable()
export class AdminStepUp {
  constructor(private readonly stepUp: StepUp, private readonly audit: AuditLogWriter) {}

  async assert(p: Principal, action: string, totpCode: string, meta: RequestMeta, extra: Record<string, unknown> = {}): Promise<void> {
    try {
      await this.stepUp.assert(scopeOf(p), p.userId, totpCode, meta);
    } catch (error) {
      if (error instanceof DomainError && (error.code === 'MFA_CODE_INVALID' || error.code === 'ACCOUNT_LOCKED' || error.code === 'MFA_NOT_ENABLED')) {
        await this.audit.write({ ...adminEntry(p, meta, action, 'error', null, { ...extra, reason: error.code === 'MFA_CODE_INVALID' ? 'totp_invalid' : error.code.toLowerCase() }) });
      }
      throw error;
    }
  }
}

@Injectable()
export class InviteAdminUseCase {
  constructor(
    private readonly repo: AdminAccountRepository,
    private readonly codes: IssueAdminActivationCode,
    private readonly delivery: AdminInvitationDelivery,
    private readonly stepUp: AdminStepUp,
  ) {}

  async execute(p: Principal, dto: InviteAdminDto, meta: RequestMeta): Promise<InvitedAdmin> {
    // D117 · Solo se invita a otro admin_monkey; otro rol no es un error de formato sino de regla.
    if (dto.role !== 'admin_monkey') throw new ValidationException([{ field: 'role', code: 'role.not_allowed' }]);
    await this.stepUp.assert(p, 'admin.invite', dto.totp_code, meta);
    const issued = this.codes.issue();
    const admin = await this.repo.invite(
      scopeOf(p),
      { email: dto.email, name: dto.name, lastName: dto.last_name, passwordHash: await unusablePasswordHash(), codeHash: issued.codeHash, codeExpiresAt: issued.codeExpiresAt, createdBy: p.userId, language: meta.language ?? 'es' },
      (done) => adminEntry(p, meta, 'admin.invite', 'success', null, snapshot(done)),
    );
    const deliveryStatus = await this.delivery.deliver({ userId: admin.id, to: admin.email, code: issued.code, expiresAt: issued.codeExpiresAt, language: meta.language, inviterName: await this.repo.inviterName(scopeOf(p), p.userId) });
    return { admin, invitation: { deliveryStatus, expiresAt: issued.codeExpiresAt } };
  }
}

@Injectable()
export class ReissueAdminCodeUseCase {
  constructor(private readonly repo: AdminAccountRepository, private readonly codes: IssueAdminActivationCode, private readonly delivery: AdminInvitationDelivery) {}

  async execute(p: Principal, id: string, meta: RequestMeta): Promise<Invitation> {
    const issued = this.codes.issue();
    const admin = await this.repo.reissueCode(scopeOf(p), id, { codeHash: issued.codeHash, codeExpiresAt: issued.codeExpiresAt, createdBy: p.userId }, (done) =>
      adminEntry(p, meta, 'admin.activation_code_regenerate', 'success', null, { id: done.id, email: done.email }),
    );
    if (!admin) throw new DomainError('NOT_FOUND');
    const deliveryStatus = await this.delivery.deliver({ userId: admin.id, to: admin.email, code: issued.code, expiresAt: issued.codeExpiresAt, language: meta.language, inviterName: await this.repo.inviterName(scopeOf(p), p.userId) });
    return { deliveryStatus, expiresAt: issued.codeExpiresAt };
  }
}

@Injectable()
export class DeactivateAdminUseCase {
  constructor(private readonly repo: AdminAccountRepository, private readonly stepUp: AdminStepUp) {}

  async execute(p: Principal, id: string, totpCode: string, meta: RequestMeta): Promise<AdminAccount> {
    await this.stepUp.assert(p, 'admin.deactivate', totpCode, meta, { target_id: id });
    const at = new Date();
    const purgeAt = new Date(at.getTime() + ADMIN_GRACE_DAYS * 86_400_000);
    const outcome = await this.repo.deactivate(scopeOf(p), id, at, purgeAt, (done) =>
      done.kind === 'deactivated'
        ? adminEntry(p, meta, 'admin.deactivate', 'success', { ...snapshot(done.before) }, { ...snapshot(done.after), sessions_closed: done.sessionsClosed })
        : adminEntry(p, meta, 'admin.deactivate', 'error', null, { target_id: done.targetId, reason: done.reason }),
    );
    if (!outcome) throw new DomainError('NOT_FOUND');
    if (outcome.kind === 'refused') {
      if (outcome.reason === 'cannot_deactivate_self') throw new DomainError('CANNOT_DEACTIVATE_SELF');
      throw new DomainError('LAST_ADMIN', {}, 'admin.last_admin');
    }
    return outcome.after;
  }
}

@Injectable()
export class ReactivateAdminUseCase {
  constructor(private readonly repo: AdminAccountRepository) {}

  // D117 punto 6 · No pide el segundo factor: devolver acceso a quien ya lo tuvo no abre una puerta nueva.
  async execute(p: Principal, id: string, meta: RequestMeta): Promise<AdminAccount> {
    const done = await this.repo.reactivate(scopeOf(p), id, new Date(), (r) => adminEntry(p, meta, 'admin.reactivate', 'success', snapshot(r.before), snapshot(r.after)));
    if (!done) throw new DomainError('NOT_FOUND');
    return done.after;
  }
}
