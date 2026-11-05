import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { assertCanAnswer, assertCanResolve, assertEditable, ObservationType } from '../../domain/observations/observation-lifecycle';
import { ObservationAccess, ObservationFilters, ObservationRecord, ObservationRepository } from '../../domain/observations/observation.repository';
import { AnswerObservationDto, CreateObservationDto, UpdateObservationDto } from './observation.dto';
import { isScopedRole } from '../../../../common/enums/user-role.enum';

// MD-154, D96 · Las observaciones del auditor (contracts/modules/compliance-audit.md). Las escribe, edita y cierra solo el `auditor` (lo impone @Roles en la ruta, y aquí que
// sea SU autor); las responde el `admin_empresa` o el `responsable` responsable del control; las leen los tres. NO mueven el porcentaje: nada de aquí toca una evaluación.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const text = (s: string | undefined | null): string => (s ?? '').trim();
const required = (field: string): never => {
  throw new ValidationException([{ field, code: 'required' }]);
};

// El rastro lleva lo que dijo cada quien (texto del auditor y de la empresa): es lo único que conserva una respuesta que se sobrescribe cuando el auditor la devuelve.
const snapshot = (o: ObservationRecord) => ({
  id: o.id, service_id: o.serviceId, client_control_id: o.clientControlId, evidence_submission_id: o.evidenceSubmissionId, type: o.type, status: o.status, body: o.body,
  answer_note: o.answerNote, answer_evidence_id: o.answerEvidenceId, answered_by: o.answeredBy?.id ?? null, closed_by: o.closedBy?.id ?? null,
});
const entry = (p: Principal, meta: RequestMeta, action: string, before: ObservationRecord | null, after: ObservationRecord): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'observation', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: before ? snapshot(before) : null, afterState: snapshot(after),
});

/** El `responsable` solo toca lo de los controles de los que es responsable. Algo de la propia empresa que no le toca es `403`; de otra empresa, `404` (lo resuelve la RLS). */
function assertScopedMayAct(p: Principal, current: ObservationAccess): void {
  if (isScopedRole(p.role) && !current.responsibleUserIds.includes(p.userId)) throw new DomainError('FORBIDDEN');
}

@Injectable()
export class CreateObservationUseCase {
  constructor(private readonly repo: ObservationRepository) {}

  async execute(p: Principal, serviceId: string, dto: CreateObservationDto, meta: RequestMeta): Promise<ObservationRecord> {
    const body = text(dto.body) || required('body');
    const created = await this.repo.create(
      scopeOf(p), serviceId,
      { type: dto.type as ObservationType, body, clientControlId: dto.client_control_id ?? null, evidenceSubmissionId: dto.evidence_submission_id ?? null, createdBy: p.userId },
      (done) => entry(p, meta, 'observation.create', null, done),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    return created;
  }
}

@Injectable()
export class ListObservationsUseCase {
  constructor(private readonly repo: ObservationRepository) {}

  async execute(p: Principal, serviceId: string, filters: Omit<ObservationFilters, 'onlyControlsOf'>): Promise<Page<ObservationRecord>> {
    const page = await this.repo.list(scopeOf(p), serviceId, { ...filters, onlyControlsOf: isScopedRole(p.role) ? p.userId : undefined });
    if (!page) throw new DomainError('NOT_FOUND');
    return page;
  }
}

@Injectable()
export class GetObservationUseCase {
  constructor(private readonly repo: ObservationRepository) {}

  async execute(p: Principal, id: string): Promise<ObservationRecord> {
    const found = await this.repo.find(scopeOf(p), id);
    if (!found) throw new DomainError('NOT_FOUND');
    assertScopedMayAct(p, found);
    return found.record;
  }
}

@Injectable()
export class UpdateObservationUseCase {
  constructor(private readonly repo: ObservationRepository) {}

  async execute(p: Principal, id: string, dto: UpdateObservationDto, meta: RequestMeta): Promise<ObservationRecord> {
    const body = dto.body === undefined ? undefined : text(dto.body) || required('body');
    if (body === undefined && dto.status === undefined) throw new ValidationException([{ field: 'body', code: 'body_or_status.required' }]);
    if (body !== undefined && dto.status !== undefined) throw new ValidationException([{ field: 'status', code: 'body_or_status.exclusive' }]);

    const action = body !== undefined ? 'observation.update' : dto.status === 'closed' ? 'observation.close' : 'observation.return';
    const updated = await this.repo.mutate(
      scopeOf(p), id,
      ({ record }) => {
        // Solo su autor la cambia (ni otro auditor de la misma empresa): `FORBIDDEN` antes que cualquier regla de estado.
        if (record.createdBy.id !== p.userId) throw new DomainError('FORBIDDEN');
        if (body !== undefined) {
          assertEditable(record.status);
          return { body };
        }
        assertCanResolve(record.status);
        return dto.status === 'closed' ? { status: 'closed', closed: { by: p.userId, at: new Date() } } : { status: 'open' };
      },
      ({ before, after }) => entry(p, meta, action, before, after),
    );
    if (!updated) throw new DomainError('NOT_FOUND');
    return updated;
  }
}

@Injectable()
export class AnswerObservationUseCase {
  constructor(private readonly repo: ObservationRepository) {}

  async execute(p: Principal, id: string, dto: AnswerObservationDto, meta: RequestMeta): Promise<ObservationRecord> {
    const note = text(dto.answer_note) || required('answer_note');
    const answered = await this.repo.mutate(
      scopeOf(p), id,
      (current) => {
        // El `responsable` solo responde las de un control suyo; las de un servicio completo, no (D96): las atiende el `admin_empresa`.
        assertScopedMayAct(p, current);
        assertCanAnswer(current.record.status);
        return { status: 'answered', answer: { note, evidenceId: dto.answer_evidence_id ?? null, by: p.userId, at: new Date() } };
      },
      ({ before, after }) => entry(p, meta, 'observation.answer', before, after),
    );
    if (!answered) throw new DomainError('NOT_FOUND');
    return answered;
  }
}
