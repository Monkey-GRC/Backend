import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { isScoped } from '../../../../common/authorization/permission-matrix';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TransactionRunner } from '../../../../common/tenancy/transaction-runner';
import { ControlEditRepository, ControlSnapshot, PeriodicityState } from '../../domain/controls/control-edit.repository';
import { validateControlEdit, validatePeriodicityChange } from './control-edit.validation';
import { EditClientControlDto, SetControlPeriodicityDto } from './control.dto';
import { ControlDetail, GetControlUseCase } from './get-control.use-case';

// D96, D150 · Editar un control lo hacen el `admin_empresa` y el `responsable` DUEÑO del control (lo impone @Can en la ruta y, para el responsable, `isScoped` aquí); darlo de baja y cambiar su
// periodicidad, solo el `admin_empresa`. Es al instante y sin propuesta. La baja no borra: el histórico se conserva.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const stateOf = (s: ControlSnapshot) => ({ interpretation: s.interpretation, dimensions: s.dimensions.map((d) => ({ dimension: d.dimension, applies: d.applies, reason_not_applicable: d.reasonNotApplicable })) });
const entry = (p: Principal, meta: RequestMeta, action: string, controlId: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'client_control', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: { id: controlId, ...(before as Record<string, unknown>) }, afterState: after ? { id: controlId, ...(after as Record<string, unknown>) } : null,
});

@Injectable()
export class UpdateControlUseCase {
  constructor(private readonly controls: ControlEditRepository, private readonly getControl: GetControlUseCase, private readonly tx: TransactionRunner) {}

  async execute(p: Principal, controlId: string, dto: EditClientControlDto, meta: RequestMeta): Promise<ControlDetail> {
    return this.tx.run(scopeOf(p), async () => {
      const access = await this.controls.findAccess(scopeOf(p), controlId);
      if (!access) throw new DomainError('NOT_FOUND');
      // Existe y es de su empresa, pero un `responsable` solo edita los controles de los que es dueño: no le toca (403).
      if (isScoped('controls.edit', p.role) && access.ownerId !== p.userId) throw new DomainError('FORBIDDEN');
      if (!access.isActive) throw new DomainError('CONTROL_RETIRED');
      const edit = validateControlEdit(dto, access.origin);
      const done = await this.controls.update(scopeOf(p), controlId, edit, { userId: p.userId, meta }, (change) =>
        entry(p, meta, 'client_control.update', controlId, stateOf(change.before), stateOf(change.after)),
      );
      if (!done) throw new DomainError('NOT_FOUND');
      return this.getControl.execute(p, controlId, undefined);
      // 30 s: la lectura final de getControl los pide, y una transacción abierta no se amplía.
    }, { timeoutMs: 30_000 });
  }
}

const periodicityOf = (s: PeriodicityState) => ({ periodicity: s.periodicity, source: s.source, justification: s.justification });

// MD-500 · D147 · G-10 · Cambiar la periodicidad de un control (todos sus requisitos) con una justificación escrita: solo `admin_empresa`, al instante. La respuesta es el detalle ya recalculado.
@Injectable()
export class SetControlPeriodicityUseCase {
  constructor(private readonly controls: ControlEditRepository, private readonly getControl: GetControlUseCase, private readonly tx: TransactionRunner) {}

  async execute(p: Principal, controlId: string, dto: SetControlPeriodicityDto, meta: RequestMeta): Promise<ControlDetail> {
    return this.tx.run(scopeOf(p), async () => {
      const access = await this.controls.findAccess(scopeOf(p), controlId);
      if (!access) throw new DomainError('NOT_FOUND');
      if (!access.isActive) throw new DomainError('CONTROL_RETIRED');
      const input = validatePeriodicityChange(dto, access.origin);
      const done = await this.controls.setPeriodicity(scopeOf(p), controlId, input, { userId: p.userId, meta }, (change) =>
        entry(p, meta, 'client_control.periodicity_set', controlId, periodicityOf(change.before), periodicityOf(change.after)),
      );
      if (!done) throw new DomainError('NOT_FOUND');
      return this.getControl.execute(p, controlId, 'technical');
    }, { timeoutMs: 30_000 });
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