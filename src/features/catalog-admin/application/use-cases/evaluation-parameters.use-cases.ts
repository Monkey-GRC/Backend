import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { ParameterKey, ParameterValue, validateParameterValue } from '../../../../common/evaluation-parameters/parameter-definitions';
import { RequestMeta } from '../../../../common/http/request-meta';
import { EvaluationParametersAdminRepository, ParameterChange, ParameterDecision, ParameterRecord } from '../../domain/repositories/evaluation-parameters.repository';

const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });

@Injectable()
export class ListEvaluationParametersUseCase {
  constructor(private readonly repo: EvaluationParametersAdminRepository) {}

  execute(p: Principal): Promise<ParameterRecord[]> {
    return this.repo.list(scopeOf(p));
  }
}

// RC-19 · El PATCH de un parámetro. La forma, el rango y las reglas entre parámetros (contra el valor vigente del otro) son 422.
@Injectable()
export class UpdateEvaluationParameterUseCase {
  constructor(private readonly repo: EvaluationParametersAdminRepository) {}

  async execute(p: Principal, key: string, value: unknown, meta: RequestMeta): Promise<ParameterRecord> {
    const decide: ParameterDecision = (current, all) => {
      const values = Object.fromEntries(all.map((r) => [r.key, r.value]));
      const error = validateParameterValue(key as ParameterKey, current.unit, value, values);
      if (error) throw new ValidationException([{ field: 'value', code: error }]);
      return value as ParameterValue;
    };
    const updated = await this.repo.change(scopeOf(p), key, p.userId, decide, ({ before, after }: ParameterChange): AuditEntry => ({
      tenantId: null, userId: p.userId, action: 'catalog.evaluation_parameter.update', resource: 'evaluation_parameter', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: { key, value: before.value }, afterState: { key, value: after.value },
    }));
    if (!updated) throw new DomainError('NOT_FOUND');
    return updated;
  }
}
