import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ControlEditRepository, ControlSnapshot } from '../../domain/repositories/control-edit.repository';
import { validateControlEdit } from '../control-edit.validation';
import { EditClientControlDto } from '../dtos/control.dto';
import { ControlDetail, GetControlUseCase } from './get-control.use-case';

// D96 · Editar y dar de baja un control: solo `admin_empresa` (lo impone @Roles en la ruta), al instante y sin propuesta. La baja no borra: el histórico se conserva.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const stateOf = (s: ControlSnapshot) => ({ interpretation: s.interpretation, dimensions: s.dimensions.map((d) => ({ dimension: d.dimension, applies: d.applies, reason_not_applicable: d.reasonNotApplicable })) });
const entry = (p: Principal, meta: RequestMeta, action: string, controlId: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'client_control', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: { id: controlId, ...(before as Record<string, unknown>) }, afterState: after ? { id: controlId, ...(after as Record<string, unknown>) } : null,
});

@Injectable()
export class UpdateControlUseCase {
  constructor(private readonly controls: ControlEditRepository, private readonly getControl: GetControlUseCase) {}

  async execute(p: Principal, controlId: string, dto: EditClientControlDto, meta: RequestMeta): Promise<ControlDetail> {
    const access = await this.controls.findAccess(scopeOf(p), controlId);
    if (!access) throw new DomainError('NOT_FOUND');
    if (!access.isActive) throw new DomainError('CONTROL_RETIRED');
    const edit = validateControlEdit(dto, access.origin);
    const done = await this.controls.update(scopeOf(p), controlId, edit, { userId: p.userId, meta }, (change) =>
      entry(p, meta, 'client_control.update', controlId, stateOf(change.before), stateOf(change.after)),
    );
    if (!done) throw new DomainError('NOT_FOUND');
    return this.getControl.execute(p, controlId, undefined);
  }
}

@Injectable()
export class RetireControlUseCase {
  constructor(private readonly controls: ControlEditRepository) {}

  async execute(p: Principal, controlId: string, meta: RequestMeta): Promise<void> {
    const found = await this.controls.retire(scopeOf(p), controlId, { userId: p.userId, meta }, (change) =>
      entry(p, meta, 'client_control.retire', controlId, { ...stateOf(change.before), own_code: change.before.ownCode }, null),
    );
    if (!found) throw new DomainError('NOT_FOUND');
  }
}